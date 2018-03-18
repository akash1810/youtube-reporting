const { google } = require('googleapis');
const Logger = require('./logger');
const youtube = google.youtube('v3');

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

async function getPagedItems({ type, fn, options, allItems = [] }) {
    const response = await new Promise((resolve, reject) => {
        fn(options, (err, resp) => {
            if (err) {
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
        return await getPagedItems({
            type,
            fn,
            options: nextOpts,
            allItems: response.items
        });
    }
}

class Channels {
    static getChannelsInCms({ authClient, contentOwner }) {
        const options = {
            auth: authClient,
            part: 'id,contentDetails',
            // mine: true,
            managedByMe: true,
            onBehalfOfContentOwner: contentOwner
        };

        return getPagedItems({
            type: 'channels.list',
            fn: youtube.channels.list,
            options
        });
    }
}

class Videos {
    static async getChannelUploads({ authClient, contentOwner }, { id, contentDetails }) {
        const options = {
            auth: authClient,
            part: 'id,contentDetails,snippet,status',
            playlistId: contentDetails.relatedPlaylists.uploads,
            onBehalfOfContentOwner: contentOwner,
            managedByMe: true,
            maxResults: 50,
            onBehalfOfContentOwnerChannel: id
        };
        
        return getPagedItems({
            type: 'playlistItems.list',
            fn: youtube.playlistItems.list,
            options
        });
    }
}

module.exports = {
    RefreshTokenAuthentication,
    ServiceAccountAuthentication,
    Channels,
    Videos
}