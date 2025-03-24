import { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Shared log format
const logFormat = format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

// Shared file transport options
const fileTransportOptions = {
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
};

// Create a logger instance for combined log
const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%-error.log',
            ...fileTransportOptions
        })
    ],
    exceptionHandlers: [
        new transports.DailyRotateFile({
            filename: 'logs/%DATE%-error.log',
            level: 'error',
            ...fileTransportOptions,
            handleExceptions: true
        })
    ],
    rejectionHandlers: [
        new transports.DailyRotateFile({
            filename: 'logs/%DATE%-error.log',
            ...fileTransportOptions,
        }),
    ],
});

// Create a logger instance for access log
const accessLogger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%-access.log',
            ...fileTransportOptions
        })
    ]
});

// Create a logger instance for query log
const queryLogger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%-query.log',
            ...fileTransportOptions
        })
    ]
});

export { logger as default, accessLogger, queryLogger };
