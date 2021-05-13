#!/bin/bash

# Load .env variables
cp env-example .env
sed -i "s/BBB_DOMAIN_NAME=.*/BBB_DOMAIN_NAME=\"$(bbb-conf --secret | grep URL|  cut -d'/' -f3)\"/g" .env
set -a
source <(cat .env | \
    sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a

chmod +x *.sh

echo "Adding bbb_mp4.rb"
cp -r bbb_mp4.rb /usr/local/bigbluebutton/core/scripts/post_publish/  
chmod 777 bbb_mp4.rb


echo "Updating index.html"
if [ ! -f "/var/bigbluebutton/playback/presentation/2.3/index_default.html" ]; then
  
  echo "index_default.html doesn't exist. Proceed with replacing.";
  
  # index_default.html is backup of default index.html that comes with fresh bbb install. If you want to remove bbb-mp4, rename index_default.html to index.html.
  cp /var/bigbluebutton/playback/presentation/2.3/index.html /var/bigbluebutton/playback/presentation/2.3/index_default.html
  
  # the new index.html, that we are copying, will allow users to download recordings
  cp index.html /var/bigbluebutton/playback/presentation/2.3/index.html
else
  echo "index_default.html exists. Skipping replacing.";
fi

#creating Docker image.
echo "creating Docker image bbb-mp4:v1"
docker build -t bbb-mp4:2.3 .

