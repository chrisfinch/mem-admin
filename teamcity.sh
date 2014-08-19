#!/bin/bash

npm install

mkdir public/uploads

mkdir -p target/packages/eventbriteImages

zip -rv target/packages/eventbriteImages/app.zip bin config modules node_modules public routes views app.js package.json server.sh

cp deploy.json target/

pushd target

zip -rv artifacts.zip .

popd

echo "##teamcity[publishArtifacts '$(pwd)/target/artifacts.zip => .']"
