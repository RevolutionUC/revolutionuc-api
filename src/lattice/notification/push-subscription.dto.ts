export class PushSubscription {
  readonly endpoint: string
  readonly expirationTime: number | null
  readonly options: {
    readonly applicationServerKey: ArrayBuffer | null
    readonly userVisibleOnly: boolean
  }
}