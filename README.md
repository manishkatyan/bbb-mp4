# bbb-mp4
A new version of bbb-mp4 that is super simple and easy to integrate with BigBlueButton to automatically generate MP4 recordings.


## How it works?

After a BigBlueButton class ends, recording process kicks in, which will process recording in three stages - archieve, process and publish. Once recording is published, `/usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb` is executed.

In `post_publish.rb`, we invoke `bbb-mp4.sh` with corresponding `meeting_id` to convert recording into mp4 video.

`bbb-mp4.sh` starts a node process to launch Chrome browser with the BigBlueButton playback URL in a Virtual Screen Buffer, that plays the recording and record the screen in WEBM format. 

After compeltion of recording, FFmpeg is used to convert WEBM to MP4 and moved to `/var/www/bigbluebutton-default/recording`.

You can view the MP4 video at `https://<your-bbb-fqdn>/recording/<meeting_id>.mp4`.

##  Install

```sh
# SSH to your BigBlueButton server and execute the following commands
cd /var/www
git clone https://github.com/manishkatyan/bbb-mp4.git
cd bbb-mp4
cp .env-example .env
```
Edit `.env` to update the following parameters:
1. bbb_fqdn: fully-qualified domain name of your BigBlueButton server (Example - bbb.higheredlab.com)
2. copyToPath: location where converted MP4 videos should be kept. Leave it at the default value so that you can browse MP4 video via https://bbb_fqdn/recording. Please create a directory `recording` at `/var/www/bigbluebutton-default/`.

```sh
# Edit post_publish.rb to update the location of `bbb-mp4` project in line number 41. By default it's set to `/var/www/bbb-mp4/`.

cp post_publish.rb /usr/local/bigbluebutton/core/scripts/post_publish/post_publish.rb
```
Above will replace the default version of `post_publish.rb` with our version that will invoke `bbb-mp4.sh` to launch MP4 conversion after a class recording is processed and published by BigBlueButton. 

```ssh
# Execute the following to install all required packages. 
./bbb-mp4-install.sh
```
`bbb-mp4-install.sh` will install the following packages:

1. XVFB
2. Google Chrome
3. FFmpeg
4. NodeJS
5. Dependencies (`dependencies_check.sh`)

