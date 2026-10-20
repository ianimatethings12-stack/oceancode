interface ImportMetaEnv {
  readonly OCEANCODE_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:oceancode-server" {
  export namespace Server {
    export type Listener = {
      hostname: string
      port: number
      url: URL
      stop(close?: boolean): Promise<void>
    }
    export function listen(options: {
      port: number
      hostname: string
      username: string
      password: string
      cors: string[]
    }): Promise<Listener>
  }
}
