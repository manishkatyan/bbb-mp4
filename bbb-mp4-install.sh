#!/bin/bash

# Load .env variables
set -a
source <(cat .env | \
    sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a

chmod +x *.sh

echo "Creating directories"
mkdir "$webm_dir"
mkdir "$mp4_dir"
mkdir "$download_dir"

echo "Updating post_publish.rb"
if [ ! -f "/usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb.default" ]; then
  echo "post_publish.rb.default doesn't exist. Proceed with replacing.";
  mv /usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb /usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb.default
  cp post_publish.rb /usr/local/bigbluebutton/core/scripts/post_publish/    
else
  echo "post_publish.rb.default exists. Skipping replacing.";
fi

echo "Updating playback.html"
if [ ! -f "/var/bigbluebutton/playback/presentation/2.0/playback_default.html" ]; then
  
  echo "playback_default.html doesn't exist. Proceed with replacing.";
  
  # playback_default.html is used by bbb-mp4 for recording. If you want to remove bbb-mp4, rename playback_default.html to playback.html.
  cp /var/bigbluebutton/playback/presentation/2.0/playback.html /var/bigbluebutton/playback/presentation/2.0/playback_default.html
  
  # the new playback.html, that we are copying, will direct users to /recording/<meeting-id>.mp4
  cp playback.html /var/bigbluebutton/playback/presentation/2.0/playback.html
else
  echo "playback_default.html exists. Skipping replacing.";
fi


echo "Installing xvfb"
apt-get -y update
apt-get -y install xvfb

echo "Installing Google Chrome"
curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get -y update
apt-get -y install google-chrome-stable

echo "Installing FFmpeg"
add-apt-repository -y ppa:jonathonf/ffmpeg-4
apt-get -y install ffmpeg

echo "Installing NodeJS"
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt-get -y install nodejs

echo "Installing NPM"
npm install --ignore-scripts

echo "Checking dependencies"
./dependencies_check.sh
