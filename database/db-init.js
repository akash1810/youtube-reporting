const sqlite3 = require('sqlite3');
const Logger = require('../util/logger');

class DatabaseInit {
    constructor({location = ':memory:'}) {
        this.db = new sqlite3.Database(location);

        Logger.log(`initialising database to ${location}`);

        const statements = [
            `CREATE TABLE video (
                id PRIMARY KEY
                , publishDate TEXT NOT NULL
                , title TEXT NOT NULL
                , description TEXT
                , tags TEXT
                , channelId TEXT NOT NULL
                , channelTitle TEXT NOT NULL
                , categoryId INTEGER NOT NULL
                , duration INTEGER NOT NULL
                , hasCustomThumbnail TEXT NOT NULL
                , privacyStatus TEXT NOT NULL
            );`
        ];
        
        this.db.parallelize(() => statements.forEach(sql => this.db.run(sql)));
    }
}

module.exports = DatabaseInit;