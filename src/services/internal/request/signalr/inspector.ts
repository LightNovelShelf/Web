enum RecordTypeEnum {
  INIT = 'INIT',
  SENT = 'SENT',
  REVICE = 'REVICE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}

interface RecordItemAdditionData<T = unknown> {
  message?: string
  data?: T
}

interface RecordItem<T = unknown> {
  type: RecordTypeEnum
  when: number
  addition?: RecordItemAdditionData<T>
}

export class SignalrInspector {
  public readonly TYPE_ENUM = RecordTypeEnum
  static readonly now = () => performance.now()

  private records: RecordItem[] = []

  constructor(public readonly url: string, public readonly params: unknown[]) {
    this.records.push({ type: RecordTypeEnum.INIT, when: SignalrInspector.now() })
  }

  public add = (type: RecordTypeEnum, addition?: RecordItemAdditionData) => {
    this.records.push({ type, when: SignalrInspector.now(), addition })
  }

  public flush = ({ clear = true }: { clear?: boolean } = {}) => {
    if (__DEV__ && VUE_TRACE_SERVER) {
      const groupName = `signalr request data trace: '${this.url}'`
      console.groupCollapsed(groupName)
      let lastRecord: RecordItem | null = null
      this.records.forEach((record) => {
        if (lastRecord) {
          console.log('--->', `${record.when - lastRecord.when}ms`)
        }

        if (record.addition) {
          const { message, data } = record.addition
          const groupName = message ? `${record.type}: ${message}` : `${record.type}`

          console.groupCollapsed(groupName)
          console.log(data)
          console.groupEnd()
        } else {
          console.log(`${record.type}`)
        }

        lastRecord = record
      })

      if (clear) {
        this.records = []
      }

      console.groupEnd()
    }
  }
}
