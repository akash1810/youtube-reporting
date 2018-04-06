#!/usr/bin/env node

const Logger = require('./util/logger');
const { serviceAccountConfig, refreshTokenConfig } = require('./config/config');
const { 
    ServiceAccountAuthentication
    , RefreshTokenAuthentication
    , ContentOwnerApi
    , ChannelApi
    , VideoApi
} = require('./api/youtube');

const DatabaseInit = require('./database/db-init');
const Database = require('./database/db');
const sleep = require('./util/sleep');

const dbPath = './foo.db';

async function main() {
    // const auth = new ServiceAccountAuthentication(serviceAccountConfig);
    const auth = new RefreshTokenAuthentication(refreshTokenConfig);
    const database = new Database({location: dbPath});
    const channels = await ContentOwnerApi.getChannels(auth);
    
    channels.filter(_ => _.id === 'UC-pCzg7zq1Nahs0lENOqyiw').forEach(async channel => {
        const videos = await ChannelApi.getUploads(auth, channel);
        
        videos.forEach(async video => {
            await database.insert(video);
            Logger.log(`videoId=${video.id} publishDate=${video.publishDate} privacyStatus=${video.privacyStatus}`, video);
        });

        await sleep();
    });
}

new DatabaseInit({location: dbPath});
main().then(console.log).catch(console.error);