#!/bin/bash

pm2 start bin/www -i max --output server-logs.log
