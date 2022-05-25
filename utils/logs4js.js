/**
 * 日志记录
 * @author fang
 */

const log4js = require('log4js')

const levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL,
}

log4js.configure({
    appenders: {
        console: { type: 'console' },       // 记录方式为控制台输出
        info: {
            type: "file",
            filename: "logs/all-logs.log"
        },
        error: {
            type: "file",
            filename: "logs/err.log",
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true      // 设置文件名称为 filename + pattern
        }
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
        info: { appenders: ['info'], level: 'info' },
        error: { appenders: ['error'], level: 'error' },
    }
})

/**
 * debug 级别日志记录
 * @param {string} content 
 */
exports.debug = (content) => {
    let logger = log4js.getLogger();
    logger.level = levels.debug;
    logger.debug(content);
}

/**
 * info 级别日志记录
 * @param {string} content 
 */
exports.info = (content) => {
    let logger = log4js.getLogger('info');  // 传参为 categories 中配置的类别
    logger.level = levels.info;
    logger.info(content);
}

/**
 * error 级别日志记录
 * @param {string} content 
 */
exports.error = (content) => {
    let logger = log4js.getLogger('error');
    logger.level = levels.error;
    logger.error(content);
}



