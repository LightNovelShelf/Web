export default class ServerError extends Error {
  public status: number

  constructor({ message, status }) {
    super(message)
    this.name = 'ServerError'
    this.status = status
  }
}
