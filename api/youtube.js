const { google } = require('googleapis');
const Logger = require('../util/logger');
const youtube = google.youtube('v3');
const sleep = require('../util/sleep');
const Video = require('../models/video');

class RefreshTokenAuthentication {
    constructor({ contentOwner, client_id, client_secret, refresh_token }) {
        const OAuth2 = google.auth.OAuth2;

        const client = new OAuth2({ clientId: client_id, clientSecret: client_secret });
        client.setCredentials({ refresh_token });

        this._contentOwner = contentOwner;
        this._client = client;

        Logger.info(`using RefreshTokenAuthentication`);
    }

    get contentOwner() {
        return this._contentOwner;
    }

    get authClient() {
        return this._client;
    }
}

class ServiceAccountAuthentication {
    constructor({ contentOwner, client_email, private_key }) {
        const JWT = google.auth.JWT;

        const client = new JWT({
            email: client_email,
            key: private_key,
            scopes: [
                "https://www.googleapis.com/auth/youtube",
                "https://www.googleapis.com/auth/youtube.force-ssl",
                "https://www.googleapis.com/auth/youtube.readonly",
                "https://www.googleapis.com/auth/youtube.upload",
                "https://www.googleapis.com/auth/youtubepartner",
                "https://www.googleapis.com/auth/youtubepartner-channel-audit"
            ]
        });

        this._contentOwner = contentOwner;
        this._client = client;

        Logger.info(`using ServiceAccountAuthentication`);
    }

    get contentOwner() {
        return this._contentOwner;
    }

    get authClient() {
        return this._client;
    }
}

async function callAPI({ type, fn, options, allItems = [] }) {
    const response = await new Promise((resolve, reject) => {
        fn(options, (err, resp) => {
            if (err) {
                Logger.error(err.response);
                reject(err);
            } else {
                resolve({
                    nextPageToken: resp.data.nextPageToken,
                    items: [...allItems, ...resp.data.items]
                });
            }
        });
    });

    if (!response.nextPageToken) {
        return response.items;
    } else {
        Logger.log(`fetching next page for ${type}`);
        const nextOpts = Object.assign({}, options, {
            pageToken: response.nextPageToken
        });
        await sleep();
        return await callAPI({
            type,
            fn,
            options: nextOpts,
            allItems: response.items
        });
    }
}

class ContentOwnerApi {
    static getChannels({ authClient, contentOwner }) {
        const options = {
            auth: authClient,
            part: 'id,contentDetails',
            managedByMe: true,
            onBehalfOfContentOwner: contentOwner
        };

        return callAPI({
            type: 'channels.list',
            fn: youtube.channels.list,
            options
        });
    }
}

class ChannelApi {
    static async getUploads({ authClient, contentOwner }, { id }) {
        const options = {
            auth: authClient,
            part: 'snippet',
            channelId: id,
            forContentOwner: true,
            onBehalfOfContentOwner: contentOwner,
            type: 'video',
            fields: 'items(id(kind,videoId)),kind,nextPageToken,pageInfo,prevPageToken'
        };

        const videoList = await callAPI({
            type: 'youtube.search.list',
            fn: youtube.search.list,
            options
        });

        const videoInfo = await Promise.all(
            videoList.map(async video => {
                await sleep();
                return await VideoApi.getInformation({authClient, contentOwner}, { id: video.id.videoId })
            })
        );

        return videoInfo.filter(Boolean);
    }
}

class VideoApi {
    static async getInformation({ authClient, contentOwner }, { id }) {
        Logger.log(`Getting video information for videoId=${id}`);
        const options = {
            auth: authClient,
            part: 'snippet,status,contentDetails',
            id,
            onBehalfOfContentOwner: contentOwner
        };

        const video = await callAPI({
            type: 'youtube.videos.list',
            fn: youtube.videos.list,
            options
        });

        // We're getting information for a single video the API returns an array.
        // Lets return the first item (the video) or nothing (video doesn't exist).
        return video.length === 1 ? new Video(video[0]) : undefined;
    }
}

module.exports = {
    RefreshTokenAuthentication
    , ServiceAccountAuthentication
    , ContentOwnerApi
    , ChannelApi
    , VideoApi
}