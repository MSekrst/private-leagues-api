import winston from 'winston'

const winstonLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: winstonLevel,
    }),
    new winston.transports.File({
      level: winstonLevel,
      filename: 'logs.log',
    }),
  ],
}

const logger = winston.createLogger(options)

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level')
}

export default logger
