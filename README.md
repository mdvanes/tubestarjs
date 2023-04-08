# Tubestar.js

Show data from Open APIs for Dutch public transport.

Data source: https://data.ndovloket.nl/REALTIME.TXT

Stack: Express, Server Side Events, Zero MQ bindings.

[Converts](./src/main/rd2wgs.ts) RD (Rijksdriehoek) to WGS 84 (Latitude & Longitude coordinates)

![Screenshot](screenshot.png "Screenshot")

## Usage

- development: `npm start` and go to http://localhost:5173/
- production: `npm build`, `npm serve` and go to http://localhost:3000/
- docker: `docker-compose up` and go to http://localhost:3000/
- AWS Amplify:
    - sign in to your AWS account
    - `amplify configure` https://docs.amplify.aws/cli/start/install/#configure-the-amplify-cli
        - eu-west-1 > create user `tubestarjs` > attach policies directly: `AdministratorAccess-Amplify` > create > security credentials / access keys / create access key (CLI)
    - `amplify init`
    - `amplify add api` https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js/#automated-setup-create-new-rest-api > REST
    - `amplify push`
    - TODO https://eu-west-1.console.aws.amazon.com/amplify/ > tubestarjs > Hosting environments
    - Connect to the Github repo
    - Configure output dir "dist"
    - Continous Deployments are set up, so on changes to the repo (on the main branch), it will be redeployed by Amplify

## TODO

- Add Dockerfile & docker-compose
- deploy to AWS Amplify
- add second event source for HTM
- prevent the blinking of markers on each update
- use fp-ts and/or RxJS observable
- https://github.com/dekguh/Leaflet.MoveMarker
