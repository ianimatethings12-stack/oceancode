import { cmd } from "@/cli/cmd/cmd"
import { Rpc } from "@/util/rpc"
import type { rpc } from "../tui/worker"
import path from "path"
import { fileURLToPath } from "url"
import { UI } from "@/cli/ui"
import { errorMessage } from "@opencode-ai/tui/util/error"
import { withTimeout } from "@/util/timeout"
import { withNetworkOptions, resolveNetworkOptionsNoConfig, hasArg } from "@/cli/network"
import { Filesystem } from "@/util/filesystem"
import type { GlobalEvent } from "@opencode-ai/sdk/v2"
import type { EventSource } from "@opencode-ai/tui/context/sdk"
import { writeHeapSnapshot } from "v8"
import { ServerAuth } from "@/server/auth"
import { validateSession } from "../tui/validate-session"
import { win32InstallCtrlCGuard } from "@opencode-ai/tui/terminal-win32"
import { isatty } from "node:tty"

declare global {
  const OPENCODE_WORKER_PATH: string
}

type RpcClient = ReturnType<typeof Rpc.client<typeof rpc>>

function createWorkerFetch(client: RpcClient): typeof fetch {
  const fn = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init)
    const body = request.body ? await request.text() : undefined
    const result = await client.call("fetch", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    })
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    })
  }
  return fn as typeof fetch
}

function createEventSource(client: RpcClient): EventSource {
  return {
    subscribe: async (handler) => {
      return client.on<GlobalEvent>("global.event", (e) => {
        handler(e)
      })
    },
  }
}

async function target() {
  if (typeof OPENCODE_WORKER_PATH !== "undefined") return OPENCODE_WORKER_PATH
  const dist = new URL("./cli/tui/worker.js", import.meta.url)
  if (await Filesystem.exists(fileURLToPath(dist))) return dist
  return new URL("../tui/worker.ts", import.meta.url)
}

async function readPipedInput(): Promise<string | undefined> {
  // When stdin is a TTY there is no piped input. When stdin is not a TTY,
  // Bun.stdin.text() waits for EOF — under `bun run` / wrappers on Windows
  // this can hang forever, so race it with a short timeout and treat a
  // timeout (or error) as "no piped input".
  if (process.stdin.isTTY) return undefined
  try {
    if (isatty(0)) return undefined
  } catch {}
  try {
    const text = await Promise.race([
      Bun.stdin.text(),
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 100)),
    ])
    if (typeof text !== "string" || text.length === 0) return undefined
    return text
  } catch {
    return undefined
  }
}

async function input(value?: string) {
  const piped = await readPipedInput()
  if (!value) return piped
  if (!piped) return value
  return piped + "\n" + value
}

export function resolveThreadDirectory(project?: string, envPWD = process.env.PWD, cwd = process.cwd()) {
  const root = Filesystem.resolve(envPWD ?? cwd)
  if (project) return Filesystem.resolve(path.isAbsolute(project) ? project : path.join(root, project))
  return Filesystem.resolve(cwd)
}

export const TuiThreadCommand = cmd({
  command: "$0 [project]",
  describe: "start ocean tui",
  builder: (yargs) =>
    withNetworkOptions(yargs)
      .positional("project", {
        type: "string",
        describe: "path to start ocean in",
      })
      .option("model", {
        type: "string",
        alias: ["m"],
        describe: "model to use in the format of provider/model",
      })
      .option("continue", {
        alias: ["c"],
        describe: "continue the last session",
        type: "boolean",
      })
      .option("session", {
        alias: ["s"],
        type: "string",
        describe: "session id to continue",
      })
      .option("fork", {
        type: "boolean",
        describe: "fork the session when continuing (use with --continue or --session)",
      })
      .option("prompt", {
        type: "string",
        describe: "prompt to use",
      })
      .option("agent", {
        type: "string",
        describe: "agent to use",
      })
      .option("auto", {
        type: "boolean",
        describe: "auto-approve permissions that are not explicitly denied (dangerous!)",
        default: false,
      })
      .option("yolo", {
        type: "boolean",
        hidden: true,
        default: false,
      })
      .option("dangerously-skip-permissions", {
        type: "boolean",
        hidden: true,
        default: false,
      })
      .option("mini", {
        type: "boolean",
        describe: "start the minimal interactive interface",
        default: false,
      })
      .option("replay", {
        type: "boolean",
        hidden: true,
      })
      .option("no-replay", {
        type: "boolean",
        describe: "disable mini session history replay on resume and after resize",
      })
      .option("replay-limit", {
        type: "number",
        describe: "cap visible mini replay to the newest N messages",
      })
      .option("demo", {
        type: "boolean",
        hidden: true,
      }),
  handler: async (args) => {
    if (args.replay === true) {
      UI.error("--replay is not supported; replay is enabled by default")
      process.exitCode = 1
      return
    }
    const noReplay = args.replay === false || args.noReplay === true

    if (args.mini) {
      const network = ["--port", "--hostname", "--mdns", "--no-mdns", "--mdns-domain", "--cors"].find((option) =>
        process.argv.some((arg) => arg === option || arg.startsWith(option + "=")),
      )
      if (network) {
        UI.error(`${network} cannot be used with --mini`)
        process.exitCode = 1
        return
      }

      const { runMini } = await import("./run")
      await runMini({
        directory: resolveThreadDirectory(args.project),
        continue: args.continue,
        session: args.session,
        fork: args.fork,
        model: args.model,
        agent: args.agent,
        prompt: args.prompt,
        replay: noReplay ? false : undefined,
        replayLimit: args.replayLimit,
        demo: args.demo,
      })
      return
    }

    const unsupported = [
      ["--no-replay", noReplay],
      ["--replay-limit", args.replayLimit !== undefined],
      ["--demo", args.demo !== undefined],
    ].find((entry) => entry[1])?.[0]
    if (unsupported) {
      UI.error(`${unsupported} requires --mini`)
      process.exitCode = 1
      return
    }

    const unguard = win32InstallCtrlCGuard()
    const isTTY = Boolean(process.stdin.isTTY) || isatty(0) || Boolean(process.stdout.isTTY)
    try {
      const { TuiConfig } = await import("@/config/tui")
      if (args.fork && !args.continue && !args.session) {
        UI.error("--fork requires --continue or --session")
        process.exitCode = 1
        return
      }

      if (!isTTY) {
        UI.error("ocean needs an interactive terminal. Run it directly in a terminal window, not through a pipe.")
        process.exitCode = 1
        return
      }

      // Resolve relative --project paths from PWD, then use the real cwd after
      // chdir so the thread and worker share the same directory key.
      const next = resolveThreadDirectory(args.project)
      let file: URL | string
      try {
        file = await target()
      } catch (error) {
        UI.error(errorMessage(error) || "Failed to resolve the background worker entrypoint.")
        process.exitCode = 1
        return
      }
      try {
        process.chdir(next)
      } catch {
        UI.error("Failed to change directory to " + next)
        return
      }
      const cwd = Filesystem.resolve(process.cwd())

      const worker = new Worker(file, {
        env: Object.fromEntries(
          Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
        ),
      })
      const client = Rpc.client<typeof rpc>(worker)
      const reload = () => {
        client.call("reload", undefined).catch(() => {})
      }
      process.on("SIGUSR2", reload)

      let stopped = false
      const stop = async () => {
        if (stopped) return
        stopped = true
        process.off("SIGUSR2", reload)
        await withTimeout(client.call("shutdown", undefined), 5000).catch(() => {})
        try {
          worker.terminate()
        } catch {}
      }

      // Surface background worker crashes on stderr instead of leaving a
      // blank screen. Rpc.client also rejects any pending calls on worker
      // error, so shutdown/transport calls fail fast rather than hang.
      try {
        const prev = worker.onerror
        worker.onerror = function (this: Worker, ev: ErrorEvent) {
          if (typeof prev === "function") {
            try {
              prev.call(this, ev)
            } catch {}
          }
          try {
            process.stderr.write(`\nBackground worker error: ${String(ev?.message ?? ev?.error ?? ev)}\n`)
          } catch {}
          return false as any
        } as any
      } catch {}

      const prompt = await input(args.prompt).catch((error) => {
        UI.error(errorMessage(error) || "Failed to read piped input.")
        process.exitCode = 1
        return undefined
      })
      if (process.exitCode === 1) return
      let config: Awaited<ReturnType<typeof TuiConfig.get>>
      try {
        config = await TuiConfig.get()
      } catch (error) {
        UI.error(errorMessage(error) || "Failed to load TUI config.")
        process.exitCode = 1
        return
      }

      const network = resolveNetworkOptionsNoConfig(args)
      const external = hasArg("--port") || hasArg("--hostname") || network.mdns === true

      const headers = external ? ServerAuth.headers() : undefined

      let transport: {
        url: string
        fetch: typeof fetch | undefined
        events: EventSource | undefined
        headers: RequestInit["headers"]
      }
      try {
        transport = external
          ? {
              url: (await withTimeout(client.call("server", network), 15000)).url,
              fetch: undefined,
              events: undefined,
              headers,
            }
          : {
              url: "http://opencode.internal",
              fetch: createWorkerFetch(client),
              events: createEventSource(client),
              headers: undefined,
            }
      } catch (error) {
        UI.error(errorMessage(error) || "Background worker did not respond in time.")
        process.exitCode = 1
        return
      }

      try {
        await validateSession({
          url: transport.url,
          sessionID: args.session,
          directory: cwd,
          fetch: transport.fetch,
          headers,
        })
      } catch (error) {
        UI.error(errorMessage(error))
        process.exitCode = 1
        return
      }

      setTimeout(() => {
        client.call("checkUpgrade", { directory: cwd }).catch(() => {})
      }, 1000).unref?.()

      let started = false
      try {
        const { Effect } = await import("effect")
        const { run } = await import("../tui/layer")
        const { createLegacyTuiPluginHost } = await import("@/plugin/tui/runtime")
        started = true
        await Effect.runPromise(
          run({
            url: transport.url,
            async onSnapshot() {
              const tui = writeHeapSnapshot("tui.heapsnapshot")
              const server = await client.call("snapshot", undefined)
              return [tui, server]
            },
            config,
            pluginHost: createLegacyTuiPluginHost(),
            directory: cwd,
            fetch: transport.fetch,
            headers: transport.headers,
            events: transport.events,
            args: {
              continue: args.continue,
              sessionID: args.session,
              agent: args.agent,
              model: args.model,
              prompt,
              fork: args.fork,
              auto: args.auto || args.yolo || args["dangerously-skip-permissions"],
            },
          }),
        )
      } catch (error) {
        // Never leave a blank screen: surface render/startup failures.
        try {
          process.stderr.write("\n")
        } catch {}
        UI.error(errorMessage(error) || "Failed to start the TUI.")
        process.exitCode = 1
        return
      } finally {
        await stop()
        if (!started && process.exitCode === 1) return
      }
    } finally {
      try {
        unguard?.()
      } catch {}
    }
    process.exit()
  },
})
// scratch
