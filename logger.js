const moment = require('moment');
const chalk = require('chalk');

class Logger {
    static log(message, extra = {}) {
        console.log(chalk.dim(`${moment().format()} [LOG] ${message} ${Object.keys(extra).length > 0 ? JSON.stringify(extra) : ''}`));
    }

    static info(message, extra = {}) {
        console.info(chalk.cyan(`${moment().format()} [INFO] ${message} ${Object.keys(extra).length > 0 ? JSON.stringify(extra) : ''}`));
    }

    static warn(message) {
        console.warn(chalk.yellow(`${moment().format()} [WARN] ${Object.keys(extra).length > 0 ? JSON.stringify(extra) : ''}`));
    }

    static error(message) {
        console.error(chalk.bold.red(`${moment().format()} [ERROR] ${Object.keys(extra).length > 0 ? JSON.stringify(extra) : ''}`));
    }
}

module.exports = Logger;