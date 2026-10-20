# Changelog

Release notes for OceanCode V2, newest first.

## v2.1.0 — 2026-10-20

### Highlights


### Breaking changes


#### Provider replay data is now `native`

Provider-owned replay data previously used different names on different surfaces. Read and write `native` instead; a tool's execution `state` and UI `metadata` are separate and are not renamed.

| Surface | Before | After |
| --- | --- | --- |
| Text and reasoning parts | `state` | `native` |
| Assistant and compaction messages | `providerState` | `native` |
| Text/reasoning lifecycle events and `session.tool.called` | `state` | `native` |
| `session.step.ended`, `session.step.failed`, and `session.compaction.ended` | `providerState` | `native` |
| `session.tool.success` and `session.tool.failed` | `resultState` | `native` |
| Exported replay-data schema | `SessionMessage.ProviderState` | `SessionMessage.Native` |
| Plugin compaction hook result | `SessionCompactionResult.providerState` | `SessionCompactionResult.native` |

#### Tool call and result data share `tool.native`

Tool parts no longer have separate `providerState` and `providerResultState` fields:

```diff
 tool
-  providerState?
-  providerResultState?
+  native?
   state
```

Success and failure events shallow-merge their `native` into the call's existing `native`. Missing result data preserves call data; result values win on duplicate keys. Provider/protocol implementations must use distinct keys when call and result values differ. There is no `state.native`, `resultNative`, or nested `{ call, result }` envelope.

Replay passes the merged blob to the protocol, which reads the fields it needs. Tool calls receive it only for the same provider and model. Provider-run results receive it for the same provider, including after a model switch. Local results receive it only for the same provider and model when the step did not fail. Legacy stored or imported `providerResultState` is merged into `tool.native` when read. Execution status and readable output remain in `tool.state`.

#### Key credential setup answers move to `metadata`

`Credential.Key.configuration` is removed. Public credential writes must put setup-form answers in the existing `metadata` field:

```diff
 { type: "key", key: "...",
-  configuration: { account: "example" }
+  metadata: { account: "example" }
 }
```

Existing stored credentials and `oceancode auth import` still accept the old shape. Legacy `configuration` is merged into `metadata`; the legacy configuration value wins when both contain the same key. This compatibility is for storage/import, not a reason to keep sending `configuration` in public writes.

#### Summary compactions reference kept messages

Compaction messages and `session.compaction.started` / `session.compaction.ended` no longer expose `recent`. New summary compactions reference the first message retained verbatim through `metadata.keepID` instead of storing a second, flattened copy:

```diff
 summary compaction
-  recent: "[User]: ... [Assistant]: ..."
+  metadata: { keepID: "msg_..." }
```

History reconstructs the kept text from that message up to the compaction boundary. Forks remap the reference to their copied messages, and compaction hooks can override `keepID` through metadata. Kept text from pre-2.1 compactions and V1 imports remains available as `metadata.recent`. New compactions store the reference, not the duplicated text.

#### Provider compaction windows move to `native.messages`

Completed compactions and `session.compaction.ended` no longer have `providerContext`. The replacement message window now lives in `native.messages`:

```diff
-  providerContext: { version, provenance, messages }
+  native: { messages }
```

Native compaction replay now matches the compaction's provider ID and model ID, rather than route/protocol/endpoint provenance. If they do not match, history uses the original messages. Endpoint changes alone no longer block replay, and request hooks that rewrite the base URL no longer block native compaction or replay.

Summary compactions no longer save the summary call's unused provider data in `native`. A compaction hook's `result.native` is still stored; if it contains `messages`, that window is replayed **instead of** the summary. Old `providerContext` rows and events are converted when read, including the media format used before 2.0.15.

#### Remove the unused `session.compacted` event

The transitional `session.compacted` event is removed from the public event surface. Update event subscriptions and schema imports to use the current compaction lifecycle events, including `session.compaction.started` and `session.compaction.ended`.

### Core

#### Improvements


#### Bug fixes


### TUI

#### Improvements


#### Bug fixes


### Desktop

#### Bug fixes


### SDK

#### Improvements


### Extensions

#### Improvements


## v2.0.32 — 2026-10-16

### Highlights


### Core

#### Bug fixes


### TUI

#### Improvements


#### Bug fixes


### SDK

#### Improvements


## v2.0.30 — 2026-10-15

### Highlights


### Core

#### Improvements


#### Bug fixes


### TUI

#### Improvements


#### Bug fixes


### Desktop

#### Improvements


#### Bug fixes


### Extensions

#### Bug fixes


## v2.0.29 — 2026-10-14

### Highlights


### Core

#### Improvements


#### Bug fixes


### TUI

#### Improvements


### Desktop

#### Improvements


#### Bug fixes


### SDK

#### Improvements


#### Bug fixes


### Extensions

#### Improvements


#### Bug fixes


## v2.0.28 — 2026-10-13

### Highlights


### Core

#### Improvements


#### Bug fixes


### TUI

#### Improvements


#### Bug fixes


### Desktop

#### Improvements


#### Bug fixes


### SDK

#### Improvements


### Extensions

#### Improvements


#### Bug fixes


## v2.0.27 — 2026-10-12

### Highlights


### Core

#### Improvements


#### Bug fixes

- Fixed remote workspace file operations so driver-provided filesystem overrides are used correctly.

### TUI

#### Bug fixes


### Desktop

#### Improvements


#### Bug fixes


### SDK

#### Improvements

- Added startup plugin seeding to Effect embedded hosts and workerd through `OceanCode.create({ plugins })` and `OpenCodeWorkerd.create({ plugins })`.
- Re-exported `WorkspaceDriver`, `EnvironmentDriver`, and `EnvironmentFiles` from `@oceancode/sdk/effect`.

#### Bug fixes


### Extensions

#### Improvements

- Extended `BridgeLayout` with viewport dimensions and optional border information so native extension surfaces can track window resizing and preserve rounded card borders.

#### Bug fixes


## v2.0.26 — 2026-10-08

### Highlights

- **Step 5 Preview Free**: You can now select **Step 5 Preview Free** from OceanCode’s free model lineup for a limited time.

### Core

#### Improvements

- Added **Step 5 Preview Free** to OceanCode’s free models for a limited time and removed the retired **Fledge Alpha Free** listing.

#### Bug fixes


### TUI

#### Improvements


#### Bug fixes

