export class ServerError extends Error {
  public override readonly name = 'ServerError'

  constructor(
    public override readonly message = '未知错误',
    public readonly status: number = 500,
  ) {
    super(message)
  }
}
