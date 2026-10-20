import path from "path"
import { Context, Duration, Effect, Layer, Option, Schedule, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/unstable/http"
import { ModelsDev } from "@opencode-ai/schema/models-dev"
import { Global } from "./global"
import { Flag } from "./flag/flag"
import { Flock } from "./util/flock"
import { Hash } from "./util/hash"
import { FSUtil } from "./fs-util"
import { InstallationAPIVersion, InstallationChannel } from "./installation/version"
import { EventV2 } from "./event"
import { makeGlobalNode } from "./effect/app-node"
import { httpClient } from "./effect/app-node-platform"

export const CatalogModelStatus = Schema.Literals(["alpha", "beta", "deprecated"])
export type CatalogModelStatus = typeof CatalogModelStatus.Type

const InterleavedField = Schema.Union([
  Schema.Literals(["reasoning", "reasoning_content", "reasoning_text"]),
  Schema.String,
])

const USER_AGENT = `opencode/${InstallationChannel}/${InstallationAPIVersion}/${Flag.OPENCODE_CLIENT}`

const CostTier = Schema.Struct({
  input: Schema.Finite,
  output: Schema.Finite,
  cache_read: Schema.optional(Schema.Finite),
  cache_write: Schema.optional(Schema.Finite),
  tier: Schema.Struct({
    type: Schema.Literal("context"),
    size: Schema.Finite,
  }),
})

const Cost = Schema.Struct({
  input: Schema.Finite,
  output: Schema.Finite,
  cache_read: Schema.optional(Schema.Finite),
  cache_write: Schema.optional(Schema.Finite),
  tiers: Schema.optional(Schema.Array(CostTier)),
  context_over_200k: Schema.optional(
    Schema.Struct({
      input: Schema.Finite,
      output: Schema.Finite,
      cache_read: Schema.optional(Schema.Finite),
      cache_write: Schema.optional(Schema.Finite),
    }),
  ),
})

const ReasoningOption = Schema.Union([
  Schema.Struct({
    type: Schema.Literal("effort"),
    values: Schema.Array(Schema.NullOr(Schema.String)),
  }),
  Schema.Struct({
    type: Schema.Literal("toggle"),
  }),
  Schema.Struct({
    type: Schema.Literal("budget_tokens"),
    min: Schema.optional(Schema.Finite),
    max: Schema.optional(Schema.Finite),
  }),
])

export const Model = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  family: Schema.optional(Schema.String),
  release_date: Schema.String,
  attachment: Schema.Boolean,
  reasoning: Schema.Boolean,
  temperature: Schema.Boolean,
  tool_call: Schema.Boolean,
  reasoning_options: Schema.optional(Schema.Array(ReasoningOption)),
  interleaved: Schema.optional(
    Schema.Union([
      Schema.Boolean,
      InterleavedField,
      Schema.Struct({
        field: InterleavedField,
      }),
    ]),
  ),
  cost: Schema.optional(Cost),
  limit: Schema.Struct({
    context: Schema.Finite,
    input: Schema.optional(Schema.Finite),
    output: Schema.Finite,
  }),
  modalities: Schema.optional(
    Schema.Struct({
      input: Schema.Array(Schema.Literals(["text", "audio", "image", "video", "pdf"])),
      output: Schema.Array(Schema.Literals(["text", "audio", "image", "video", "pdf"])),
    }),
  ),
  experimental: Schema.optional(
    Schema.Struct({
      modes: Schema.optional(
        Schema.Record(
          Schema.String,
          Schema.Struct({
            cost: Schema.optional(Cost),
            provider: Schema.optional(
              Schema.Struct({
                body: Schema.optional(Schema.Record(Schema.String, Schema.MutableJson)),
                headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
              }),
            ),
          }),
        ),
      ),
    }),
  ),
  status: Schema.optional(CatalogModelStatus),
  provider: Schema.optional(
    Schema.Struct({ npm: Schema.optional(Schema.String), api: Schema.optional(Schema.String) }),
  ),
})
export type Model = Schema.Schema.Type<typeof Model>

export const Provider = Schema.Struct({
  api: Schema.optional(Schema.String),
  name: Schema.String,
  env: Schema.Array(Schema.String),
  id: Schema.String,
  npm: Schema.optional(Schema.String),
  models: Schema.Record(Schema.String, Model),
})

export type Provider = Schema.Schema.Type<typeof Provider>

const Catalog = Schema.Record(Schema.String, Provider)

export const Event = ModelsDev.Event

declare const OPENCODE_MODELS_DEV: Record<string, Provider> | undefined

export interface Interface {
  readonly get: () => Effect.Effect<Record<string, Provider>>
  readonly refresh: (force?: boolean) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/ModelsDev") {}

const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const events = yield* EventV2.Service
    const client = yield* HttpClient.HttpClient

    const source = Flag.OPENCODE_MODELS_URL || "https://models.opencode.ai"
    const filepath = path.join(
      Global.Path.cache,
      source === "https://models.opencode.ai" ? "models.json" : `models-${Hash.fast(source)}.json`,
    )
    const etagPath = `${filepath}.etag`
    const ttl = Duration.minutes(5)
    const lockKey = `models-dev:${filepath}`

    const fresh = Effect.fnUntraced(function* () {
      const stat = yield* fs.stat(filepath).pipe(Effect.catch(() => Effect.succeed(undefined)))
      if (!stat) return false
      const mtime = Option.getOrElse(stat.mtime, () => new Date(0)).getTime()
      return Date.now() - mtime < Duration.toMillis(ttl)
    })

    const loadFromDisk = fs.readJson(Flag.OPENCODE_MODELS_PATH ?? filepath).pipe(
      Effect.map((value) => Option.getOrUndefined(Schema.decodeUnknownOption(Catalog)(value))),
      Effect.catch(() => {
        if (Flag.OPENCODE_MODELS_PATH === undefined) {
          return fs.remove(filepath, { force: true }).pipe(Effect.ignore, Effect.as(undefined))
        }
        return Effect.succeed(undefined)
      }),
    )

    const loadSnapshot = Effect.sync(() =>
      typeof OPENCODE_MODELS_DEV === "undefined" ? undefined : OPENCODE_MODELS_DEV,
    )

    const fetchAndWrite = Effect.fn("ModelsDev.fetchAndWrite")(function* () {
      const etag = yield* fs.readFileStringSafe(etagPath).pipe(Effect.catch(() => Effect.succeed(undefined)))
      const response = yield* client.execute(
        HttpClientRequest.get(`${source}/api.json`).pipe(
          HttpClientRequest.setHeaders({
            "User-Agent": USER_AGENT,
            ...(etag ? { "If-None-Match": etag } : {}),
          }),
        ),
      )
      if (response.status === 304) return undefined
      if (response.status < 200 || response.status >= 300) {
        return yield* Effect.fail(new Error(`models.dev returned ${response.status}`))
      }
      const text = yield* response.text
      // Validate before replacing the cache so a truncated or malformed
      // response cannot poison the next startup.
      const data = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(Catalog))(text)
      const tempfile = `${filepath}.${process.pid}.${Date.now()}.tmp`
      yield* fs.writeWithDirs(tempfile, text).pipe(
        Effect.andThen(fs.rename(tempfile, filepath)),
        Effect.catch((error) =>
          Effect.gen(function* () {
            yield* fs.remove(tempfile, { force: true }).pipe(Effect.ignore)
            return yield* Effect.fail(error)
          }),
        ),
      )
      const etagHeader = response.headers["etag"] ?? response.headers["ETag"]
      if (etagHeader) yield* fs.writeWithDirs(etagPath, etagHeader).pipe(Effect.ignore)
      return data
    })

    const populate = Effect.gen(function* () {
      // Do not block startup on the multi-megabyte catalog. The cached copy or
      // bundled snapshot is enough to render the first picker; the refresh
      // loop publishes catalog.updated as soon as newer data is available.
      return (yield* loadFromDisk) ?? (yield* loadSnapshot) ?? ({} as Record<string, Provider>)
    }).pipe(Effect.withSpan("ModelsDev.populate"), Effect.orDie)

    const [cachedGet, invalidate] = yield* Effect.cachedInvalidateWithTTL(populate, Duration.infinity)

    const get = (): Effect.Effect<Record<string, Provider>> => cachedGet

    const refresh = Effect.fn("ModelsDev.refresh")(function* (force = false) {
      if (!force && (yield* fresh())) return
      yield* Effect.scoped(
        Effect.gen(function* () {
          yield* Flock.effect(lockKey)
          // Re-check under the lock: another process may have refreshed between
          // our outer check and lock acquisition.
          if (!force && (yield* fresh())) return
          const data = yield* fetchAndWrite()
          if (!data) return
          yield* invalidate
          yield* events.publish(Event.Refreshed, {})
        }),
      ).pipe(
        Effect.tapCause((cause) => Effect.logError("Failed to fetch models.dev", { cause: cause })),
        Effect.ignore,
      )
    })

    if (
      !Flag.OPENCODE_MODELS_PATH &&
      !Flag.OPENCODE_DISABLE_MODELS_FETCH &&
      !process.argv.includes("--get-yargs-completions")
    ) {
      // Schedule.spaced runs the effect once, then waits between completions.
      yield* Effect.forkScoped(refresh().pipe(Effect.repeat(Schedule.spaced("5 minutes")), Effect.ignore))
    }

    return Service.of({ get, refresh })
  }),
)

export const node = makeGlobalNode({ service: Service, layer: layer, deps: [FSUtil.node, EventV2.node, httpClient] })

export * as ModelsDev from "./models-dev"
