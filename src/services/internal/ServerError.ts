export class ServerError extends Error {
  public readonly name = 'ServerError'

  constructor(public readonly message = '未知错误', public readonly status: number = 500) {
    super(message)
  }
}
