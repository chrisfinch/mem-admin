#!/bin/bash

#Install node v4.8.6 (same as the destination server)
NODE_VERSION="4.8.6"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}

npm install
npm run riffraff
