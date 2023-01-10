#!/bin/bash

# Load .env variables
set -a
source <(cat  /var/www/bbb-mp4/.env | \
    sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a

MEETING_ID=$1

echo "converting $MEETING_ID to mp4" |  systemd-cat -p warning -t bbb-mp4

docker run --rm -d \
                --name $MEETING_ID \
                -v $COPY_TO_LOCATION:/usr/src/app/processed \
                --env REC_URL=https://$BBB_DOMAIN_NAME/playback/presentation/2.3/$MEETING_ID \
                manishkatyan/bbb-mp4
