const Logger = require('./logger');

function sleep(duration = 500) {
    Logger.log(`sleeping for ${duration}ms`);
    
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

module.exports = sleep;