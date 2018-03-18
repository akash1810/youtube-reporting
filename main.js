#!/usr/bin/env node
require('json5/lib/register');

const Logger = require('./logger');
const { RefreshTokenAuthentication, ServiceAccountAuthentication, Channels, Videos } = require('./youtube');

const contentOwnerJson = require('./config/content-owner.json5');
const oauth2Json = require('./config/oauth2.json5');
const serviceAccountJson = require('./config/service-account.json5');

const refreshTokenConfig = Object.assign({}, contentOwnerJson, oauth2Json);
const serviceAccountConfig = Object.assign({}, contentOwnerJson, serviceAccountJson);

function isConfigValid() {
    const refreshTokenValues = new Set(Object.values(refreshTokenConfig));
    const serviceAccountValues = new Set(Object.values(serviceAccountConfig));

    if (refreshTokenValues.size === 1 || serviceAccountValues.size === 1) {
        Logger.error("invalid config");
        return false;
    }

    return true;
}

async function main() {
    // const authClient = new RefreshTokenAuthentication(refreshTokenConfig);
    const authClient = new ServiceAccountAuthentication(serviceAccountConfig);

    const channels = await Channels.getChannelsInCms(authClient);

    // just use the first channel in the CMS for demo purposes
    const channelSubset = channels.slice(0, 1);

    return channelSubset.reduce(async (acc, channel) => {
        const videos = await Videos.getChannelUploads(authClient, channel);
        acc.set(channel.id, videos);
        return acc;
    }, new Map());
}

if (isConfigValid()) {
    main().then(channelVideos => {
        for (const [channel, videos] of channelVideos) {
            const summary = videos.reduce((acc, video) => {
                const status = video.status.privacyStatus;
        
                return Object.assign({}, acc, {
                    [status]: acc[status] ? acc[status] + 1 : 1
                });
            }, {});
        
            Logger.info(`video summary for channel ${channel}:`, summary);
        
            videos.forEach(video => {
                Logger.log(`videoId=${video.contentDetails.videoId} videoPublishedAt=${video.contentDetails.videoPublishedAt} privacyStatus=${video.status.privacyStatus}`);
            });
        }
    
        Logger.info("done");
    }).catch(e => {
        Logger.error(`${e.code} ${e}`);
    });
}