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
  - By default its service config
  - Uncomment line 27 and comment line 28 in [`main.js`](./main.js) to use oauth2
- `npm run get-videos`
