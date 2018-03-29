const sqlite3 = require('sqlite3');
const Logger = require('../logger');

class Database {
    constructor({location = ':memory:'}) {
        this.db = new sqlite3.Database(location);
    }

    insert(key, value) {
        const sql = `
            INSERT INTO video (videoId, data)
            VALUES (?, ?);
        `;

        const values = [key, value];

        this.db.prepare(sql).run(values, function (err) {
            return err
                ? Promise.reject(err)
                : Promise.resolve(this.lastID);
        });
    }
}

module.exports = Database;