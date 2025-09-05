const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Увімкнемо "красивий" вивід логів для розробки
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
});

module.exports = logger;