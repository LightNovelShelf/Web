export interface ApiEnvelope<Response> {
  Success: boolean
  Response: Response
  Status: number
  Msg: string
}

export interface HubRequestOptions {
  UseGzip: boolean
}
