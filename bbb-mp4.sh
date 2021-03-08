#!usr/bin/sh

. ./.env

MEETING_ID=$1

echo "converting $MEETING_ID to mp4" |  systemd-cat -p warning -t bbb-mp4
sudo docker run --rm -d \
		--name bbb-mp4 \
		-v $BBB_MP4_LOCATION/download:/usr/src/app/download \
		--env-file .env \
		--env REC_URL=https://$BBB_DOMAIN_NAME/playback/presentation/2.0/$playbackFile?meetingId=$MEETING_ID \
		bbb-mp4:v1

echo "moving $MEETING_ID.mp4 to $COPY_TO_LOCATION" | systemd-cat -p warning -t bbb-mp4
sudo mv -f  $BBB_MP4_LOCATION/download/$MEETING_ID.mp4 $COPY_TO_LOCATION/$MEETING_ID.mp4
