const { parse, toSeconds } = require('iso8601-duration');

class Video {
    constructor({ 
        id,
        snippet: { publishedAt, title, description, tags, channelId, channelTitle, categoryId },
        contentDetails: { duration, hasCustomThumbnail },
        status: { privacyStatus }
    }) {
        this.id = id;
        this.publishDate = publishedAt;
        this.title = title;
        this.description = description;
        this.tags = (tags ? tags : []).join(',');
        this.channelId = channelId;
        this.channelTitle = channelTitle;
        this.categoryId = categoryId;
        this.duration = toSeconds(parse(duration));
        this.hasCustomThumbnail = hasCustomThumbnail;
        this.privacyStatus = privacyStatus;
    }
}

module.exports = Video;