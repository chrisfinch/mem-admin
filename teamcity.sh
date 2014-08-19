#!/bin/bash

npm install

mkdir public/uploads

mkdir -p target/packages/eventbriteImages

cp deploy.json target/

zip -rv target/packages/eventbriteImages/app.zip .

echo "##teamcity[publishArtifacts '.']"
