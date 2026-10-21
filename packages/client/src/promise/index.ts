import type { OpenCode, OceanCode } from "./client.js"

export * from "./generated/index.js"
export { OpenCode, OceanCode } from "./client.js"
export type {
  AgentApi,
  CommandApi,
  ConfigApi,
  EventApi,
  IntegrationApi,
  ModelApi,
  PluginApi,
  ProviderApi,
  ReferenceApi,
  RpcApi,
  RpcCallOptions,
  RpcClient,
  RpcEventPayload,
  WebSearchApi,
  SessionApi,
  SkillApi,
} from "./api.js"
export type { EventSubscribeOutput as OpenCodeEvent } from "./generated/types.js"
export type OpenCodeClient = ReturnType<typeof OpenCode.make>
export type OceanCodeClient = ReturnType<typeof OceanCode.make>
