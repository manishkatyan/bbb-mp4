#!usr/bin/sh

. ./.env

MEETING_ID=$1

echo "converting $MEETING_ID to mp4" |  systemd-cat -p warning -t bbb-mp4
sudo docker run --rm -d \
                --name $MEETING_ID \
                -v $COPY_TO_LOCATION:/usr/src/app/download \
                --env-file .env \
                --env REC_URL=https://$BBB_DOMAIN_NAME/playback/presentation/2.0/$playbackFile?meetingId=$MEETING_ID \
                bbb-mp4:v1