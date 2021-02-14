#!/bin/bash

# Load .env variables
set -a
source <(cat .env | \
    sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a

chmod +x *.sh
mkdir "$webm_dir"
mkdir "$mp4_dir"
mkdir "$download_dir"
echo "copying post_publish.rb to /usr/local/bigbluebutton/core/scripts/post_publish"
cp post_publish.rb /usr/local/bigbluebutton/core/scripts/post_publish/

echo "Installing xvfb"
apt-get -y install xvfb

echo "Installing Google Chrome"
curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get -y update
apt-get -y install google-chrome-stable

echo "Installing FFmpeg"
add-apt-repository ppa:jonathonf/ffmpeg-4
apt-get update
apt-get -y install ffmpeg

echo "Installing NodeJS"
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt-get -y install nodejs

echo "Installing NPM"
npm install --ignore-scripts

echo "Checking dependencies"
./dependencies_check.sh
