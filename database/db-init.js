const sqlite3 = require('sqlite3');
const Logger = require('../logger');

class DatabaseInit {
    constructor({location = ':memory:'}) {
        this.db = new sqlite3.Database(location);

        Logger.log(`initialising database to ${location}`);

        const statements = [
            `CREATE TABLE video (
                videoId PRIMARY KEY
                , data TEXT NOT NULL
            );`
        ];
        
        this.db.parallelize(() => statements.forEach(sql => this.db.run(sql)));
    }
}

module.exports = DatabaseInit;