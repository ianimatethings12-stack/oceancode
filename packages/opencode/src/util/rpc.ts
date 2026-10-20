type Definition = {
  [method: string]: (input: any) => any
}

export function listen(rpc: Definition) {
  onmessage = async (evt) => {
    let parsed: any
    try {
      parsed = JSON.parse(typeof evt.data === "string" ? evt.data : String(evt.data ?? ""))
    } catch (error) {
      try {
        postMessage(
          JSON.stringify({
            type: "rpc.result",
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            id: undefined,
          }),
        )
      } catch {}
      return
    }
    if (parsed.type === "rpc.request") {
      try {
        const result = await rpc[parsed.method](parsed.input)
        postMessage(JSON.stringify({ type: "rpc.result", ok: true, result, id: parsed.id }))
      } catch (error) {
        try {
          postMessage(
            JSON.stringify({
              type: "rpc.result",
              ok: false,
              error: error instanceof Error ? error.message : String(error),
              id: parsed.id,
            }),
          )
        } catch {}
      }
    }
  }
}

export function emit(event: string, data: unknown) {
  postMessage(JSON.stringify({ type: "rpc.event", event, data }))
}

export function client<T extends Definition>(target: {
  postMessage: (data: string) => void | null
  onmessage: ((this: Worker, ev: MessageEvent<any>) => any) | null
  onerror?: ((this: Worker, ev: ErrorEvent) => any) | null
}) {
  const pending = new Map<number, { resolve: (result: any) => void; reject: (error: unknown) => void }>()
  const listeners = new Map<string, Set<(data: any) => void>>()
  let id = 0

  const failAll = (error: unknown) => {
    if (pending.size === 0) return
    for (const [, entry] of pending) entry.reject(error)
    pending.clear()
  }

  target.onmessage = async (evt) => {
    let parsed: any
    try {
      parsed = JSON.parse(typeof evt.data === "string" ? evt.data : String(evt.data ?? ""))
    } catch {
      return
    }
    if (parsed.type === "rpc.result") {
      const entry = pending.get(parsed.id)
      if (entry) {
        // Worker may send { result } (legacy) or { ok, result } / { ok:false, error }.
        if (parsed.ok === false) entry.reject(new Error(String(parsed.error ?? "Worker call failed")))
        else entry.resolve(parsed.result)
        pending.delete(parsed.id)
      }
    }
    if (parsed.type === "rpc.event") {
      const handlers = listeners.get(parsed.event)
      if (handlers) {
        for (const handler of handlers) {
          handler(parsed.data)
        }
      }
    }
  }
  // If the worker crashes, reject pending calls so `stop()` / `client.call()`
  // never hang forever on a blank screen.
  try {
    const prev = target.onerror
    target.onerror = function (this: Worker, ev: ErrorEvent) {
      failAll(ev?.error ?? ev?.message ?? new Error("Worker failed"))
      if (typeof prev === "function") return prev.call(this, ev)
      return false as any
    } as any
  } catch {}
  return {
    call<Method extends keyof T>(method: Method, input: Parameters<T[Method]>[0]): Promise<ReturnType<T[Method]>> {
      const requestId = id++
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject })
        try {
          target.postMessage(JSON.stringify({ type: "rpc.request", method, input, id: requestId }))
        } catch (error) {
          pending.delete(requestId)
          reject(error)
        }
      })
    },
    on<Data>(event: string, handler: (data: Data) => void) {
      let handlers = listeners.get(event)
      if (!handlers) {
        handlers = new Set()
        listeners.set(event, handlers)
      }
      handlers.add(handler)
      return () => {
        handlers!.delete(handler)
      }
    },
  }
}

export * as Rpc from "./rpc"
