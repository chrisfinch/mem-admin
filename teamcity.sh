#!/bin/bash

target=target/packages/memb-eventbriteImages
base_files="bin config node_modules prod-config server.sh package.json"
app_files="config controllers public service views routes.js server.js"

npm install

mkdir -p $target
zip -rv $target/app.zip $base_files $app_files

cp deploy.json target/

pushd target
zip -rv artifacts.zip .
popd

echo "##teamcity[publishArtifacts '$(pwd)/target/artifacts.zip => .']"
