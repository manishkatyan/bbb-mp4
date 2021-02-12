# bbb-mp4
A new version of bbb-mp4 that is super simple and easy to integrate with BigBlueButton to automatically generate MP4 recordings.


**How it works?**
When you execute `node bbb-mp4`, Chrome browser is opened in the background with the BigBlueButton playback URL in a Virtual Screen Buffer, the recording is played and the screen is recorded WEBM format. After compeltion of recording, FFMEG is used to convert to MP4 and moved to ``` copyTopath ```.

## Install

1. Install XVFB
```sh
apt install xvfb
```

2. Install latest Google Chrome:

```sh
curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get -y update
apt-get -y install google-chrome-stable
```

3. Install FFmpeg:
```sh
sudo add-apt-repository ppa:jonathonf/ffmpeg-4
sudo apt-get update
sudo apt-get install ffmpeg
```

4. Install latest version of node
```sh
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

5. Clone bbb-mp4, install NPM modules and execute what `./dependencies_check.sh` tells you to 
```sh
git clone https://github.com/manishkatyan/bbb-mp4.git
cd bbb-mp4
apt install npm
npm install --ignore-scripts
cp .env-example .env
./dependencies_check.sh
```
