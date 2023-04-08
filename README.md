# Tubestar.js

Show data from Open APIs for Dutch public transport.

Data source: https://data.ndovloket.nl/REALTIME.TXT

Stack: Express, Server Side Events, Zero MQ bindings.

[Converts](./src/main/rd2wgs.ts) RD (Rijksdriehoek) to WGS 84 (Latitude & Longitude coordinates)

![Screenshot](screenshot.png "Screenshot")

## TODO

- Add Dockerfile & docker-compose
- deploy to AWS Amplify
- add second event source for HTM
- prevent the blinking of markers on each update
- use fp-ts and/or RxJS observable
- https://github.com/dekguh/Leaflet.MoveMarker
