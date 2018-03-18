#!/usr/bin/env node
require('json5/lib/register');

const contentOwnerConfig = require('./config/content-owner.json5');
const oauth2Config = require('./config/oauth2.json5');
const serviceAccountConfig = require('./config/service-account.json5');

const Logger = require('./logger');
const { RefreshTokenAuthentication, ServiceAccountAuthentication, Channels, Videos } = require('./youtube');

async function main() {
    // const authClient = new RefreshTokenAuthentication(Object.assign({}, contentOwnerConfig, oauth2Config));
    const authClient = new ServiceAccountAuthentication(Object.assign({}, contentOwnerConfig, serviceAccountConfig));

    const channels = await Channels.getChannelsInCms(authClient);

    const channelSubset = channels.slice(0, 1);

    return channelSubset.reduce(async (acc, channel) => {
        const videos = await Videos.getChannelUploads(authClient, channel);
        acc.set(channel.id, videos);
        return acc;
    }, new Map());
}

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