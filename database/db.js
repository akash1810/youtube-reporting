const sqlite3 = require('sqlite3');
const Logger = require('../util/logger');

class Database {
    constructor({location = ':memory:'}) {
        this.db = new sqlite3.Database(location);
    }

    insert({id, publishDate, title, description, tags, channelId, channelTitle, categoryId, duration, hasCustomThumbnail, privacyStatus}) {
        const sql = `
            INSERT INTO video (
                id
                , publishDate
                , title
                , description
                , tags
                , channelId
                , channelTitle
                , categoryId
                , duration
                , hasCustomThumbnail
                , privacyStatus
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            id, 
            publishDate, 
            title, 
            description,
            tags,
            channelId, 
            channelTitle, 
            categoryId, 
            duration, 
            hasCustomThumbnail, 
            privacyStatus
        ];

        this.db.prepare(sql).run(values, function (err) {
            return err
                ? Promise.reject(err)
                : Promise.resolve(this.lastID);
        });
    }
}

module.exports = Database;