import * as winston from 'winston'
import { format } from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export function createLogger(loggerName: string): winston.Logger {
  return winston.createLogger({
    level: 'info',
    format: format.combine(
      format.splat(),
      format.simple()
    ),
    defaultMeta: { name: loggerName },
    transports: [
      new winston.transports.Console()
    ]
  })
}
