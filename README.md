# YouTube Reporting

Report on YouTube entities owned by a single YouTube CMS.

Authentication can be done in two ways:
- A refresh token (standard OAuth2)
- A service account

## Requirements
- Node 9
- Access to a YouTube CMS

## Usage
- Clone repo
- `npm install`
- Fill in the config files in the [`config`](./config) directory
- Choose which auth the use:
  - By default its service account
  - Uncomment line 27 and comment line 28 in [`main.js`](./main.js) to use oauth2
- `npm run get-videos`

## Example output of `get-videos` command
```console
2018-03-18T21:04:51+00:00 [INFO] using ServiceAccountAuthentication 
2018-03-18T21:04:51+00:00 [LOG] fetching next page for channels.list 
...
2018-03-18T21:06:51+00:00 [LOG] fetching next page for playlistItems.list 
2018-03-18T21:06:52+00:00 [INFO] video summary for channel UCHpw8xwDNhU9gdohEcJu4aA: {"public":6425}
2018-03-18T21:06:52+00:00 [LOG] videoId=FXdYSQ6nu-M videoPublishedAt=2018-03-17T14:10:02.000Z privacyStatus=public 
...
2018-03-18T21:06:52+00:00 [INFO] done
```