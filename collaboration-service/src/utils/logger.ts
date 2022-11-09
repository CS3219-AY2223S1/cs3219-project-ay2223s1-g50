enum LogLevel {
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
}

export class Logger {
  private static outputLog(logText: string, level: LogLevel, obj: any[]): void {
    console.info(`[${new Date().toISOString()}] [${level}] ${logText}`, obj)
  }

  static makeLog(
    level: LogLevel,
    ...obj: any[]
  ): (logText: string) => (obj: any[]) => void {
    return (text: string) => (obj: any[]) => this.outputLog(text, level, obj)
  }

  static info(text: string, ...obj: any[]): void {
    this.makeLog(LogLevel.Info)(text)(obj)
  }

  static error(text: string, ...obj: any[]): void {
    this.makeLog(LogLevel.Error)(text)(obj)
  }

  static warn(text: string, ...obj: any[]): void {
    this.makeLog(LogLevel.Warn)(text)(obj)
  }
}
