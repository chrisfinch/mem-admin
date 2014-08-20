#!/bin/bash

npm install

mkdir public/uploads

mkdir -p target/packages/memb-eventbriteImages

zip -rv target/packages/memb-eventbriteImages/app.zip bin config modules node_modules public routes views app.js package.json server.sh prod-config

cp deploy.json target/

pushd target

zip -rv artifacts.zip .

popd

echo "##teamcity[publishArtifacts '$(pwd)/target/artifacts.zip => .']"
