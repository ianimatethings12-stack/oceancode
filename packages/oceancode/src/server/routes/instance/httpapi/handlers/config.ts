import { Config } from "@/config/config"
import { Provider } from "@/provider/provider"
import * as InstanceState from "@/effect/instance-state"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { ModelsDev } from "@opencode-ai/core/models-dev"
import { ProviderV2 } from "@opencode-ai/core/provider"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { InstanceHttpApi } from "../api"
import { markInstanceForDisposal } from "../lifecycle"

export const configHandlers = HttpApiBuilder.group(InstanceHttpApi, "config", (handlers) =>
  Effect.gen(function* () {
    const providerSvc = yield* Provider.Service
    const configSvc = yield* Config.Service
    const modelsDevSvc = yield* ModelsDev.Service
    const runtimeFlags = yield* RuntimeFlags.Service

    const get = Effect.fn("ConfigHttpApi.get")(function* () {
      return yield* configSvc.get()
    })

    const update = Effect.fn("ConfigHttpApi.update")(function* (ctx) {
      yield* configSvc.update(ctx.payload)
      yield* markInstanceForDisposal(yield* InstanceState.context)
      return ctx.payload
    })

    const providers = Effect.fn("ConfigHttpApi.providers")(function* () {
      const providers = yield* providerSvc.list()
      // Overlay live ModelsDev metadata for opencode so the free list updates
      // without waiting for the per-instance provider catalog to rebuild.
      const current = providers[ProviderV2.ID.opencode]
      const source = (yield* modelsDevSvc.get())[ProviderV2.ID.opencode]
      const hasKey = current ? Object.values(current.models).some((model) => model.cost.input > 0) : false
      const models =
        current && source
          ? Object.fromEntries(
              Object.entries(Provider.fromModelsDevProvider(source).models).filter(
                ([_, model]) =>
                  (hasKey || model.cost.input === 0) &&
                  model.status !== "deprecated" &&
                  (model.status !== "alpha" || runtimeFlags.enableExperimentalModels),
              ),
            )
          : undefined
      const list =
        current && models && Object.keys(models).length > 0
          ? { ...providers, [ProviderV2.ID.opencode]: { ...current, models } }
          : providers
      return {
        providers: Object.values(list).map(Provider.toPublicInfo),
        default: Provider.defaultModelIDs(list),
      }
    })

    return handlers.handle("get", get).handle("update", update).handle("providers", providers)
  }),
)
