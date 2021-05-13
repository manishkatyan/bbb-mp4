# bbb-mp4
Easily integrate this app into your BigBlueButton server to automatically convert class recordings into MP4 videos.


## How it works?

After a BigBlueButton class ends, recording process kicks in, which will process recording in three stages - archieve, process and publish. Once recording is published, `/usr/local/bigbluebutton/core/scripts/post_publish/bbb_mp4.rb` is executed.

In `bbb_mp4.rb`, we invoke `bbb-mp4.sh` with corresponding `meeting_id` to convert recording into mp4 video.

`bbb-mp4.sh` starts a docker process to launch Chrome browser with the BigBlueButton playback URL in a Virtual Screen Buffer, that plays the recording and FFmpeg will capture the screen in mp4 format. MP4 will be moved to `/var/www/bigbluebutton-default/recording`.

When you visit the default BBB playback url `https://<your-bbb-fqdn>/playback/presentation/2.3/<meeting_id>`, either of the following two cases happen:
- MP4 video exists: A download button will appear at the bottom right. 
- MP4 video doesn't exist: A download button will not appear.

Hence, you can safely deploy this project on your existing BigBlueButton server. 
- Going forward, all your recordings would get converted into MP4 videos. 
- Older recordings will still be accessible as default BBB playback recording.

### Requirement 
1. Install the Docker as per the instruction mentioned here https://docs.docker.com/engine/install/

##  Install

```sh
# Assuming you install bbb-mp4 project at /var/www/
# SSH to your BigBlueButton server and execute the following commands
cd /var/www
git clone https://github.com/manishkatyan/bbb-mp4.git
cd bbb-mp4
```
Edit `.env` to update the following parameters:
1. BBB_DOMAIN_NAME: <it will be automatically updated through bbb-mp4-install.sh> (Example - bbb.higheredlab.com)
2. COPY_TO_LOCATION: location where converted MP4 videos should be kept. Leave it at the default value so that you can view MP4 video at `https://<your-bbb-fqdn>/recording/<meeting_id>.mp4`.


```ssh
# Execute the following to install all required packages. 
./bbb-mp4-install.sh
```
`bbb-mp4-install.sh` will install the following packages In Docker :
1. XVFB
2. Google Chrome
3. FFmpeg
4. NodeJS
5. Dependencies

During this installation, `bbb-mp4-install.sh` will also do the following:
- create  `bbb_mp4.rb` to invoke `bbb-mp4.sh` that will start automatic MP4 conversion after a class recording is published. 
- create a directory `recording` at `/var/www/bigbluebutton-default` to store converted MP4 videos that can be accessed via browser.
- update the default index.html at `/var/bigbluebutton/playback/presentation/2.3/index.html` to provide download button.

```sh
# give bigbluebutton user sudo access
usermod -aG sudo bigbluebutton

# make sudo access passwordless
sudo visudo
# add the following line at the end of the file
bigbluebutton ALL=(ALL) NOPASSWD: ALL
```
You need to give user bigbluebutton sudo access, as detailed above, for bbb-mp4 to run correctly. 

## How to use it

No changes are required from your side to view MP4 videos created by bbb-mp4. 

As we updated the default index.html, when you would visit the default playback url - `https://<your-bbb-fqdn>/playback/presentation/2.3/<meeting_id>` - you would see a download button

If you are using Greenlight or Moodle, you will continue to use the same way to view MP4 videos.

## Uninstall

In case you want to restore the default playback.html, please follow the steps below:

```sh
mv /var/bigbluebutton/playback/presentation/2.3/index_default.html /var/bigbluebutton/playback/presentation/2.3/index.html
mv /usr/local/bigbluebutton/core/scripts/post_publish/bbb_mp4.rb /usr/local/bigbluebutton/core/scripts/post_publish/bbb_mp4.rb.old
```
With this, you would be able to restore default playback behavior and default post_poublish action.

## BigBlueButton Tech Support

Are you facing difficulties with your BigBlueButton server?

Lean on our expertise to smoothly run your BigBlueButton server.

Get 24×7 connected with our Tech team. On facing any difficulties, just message us and we’ll promptly fix it.

Start today with a monthly subscription for $59 per BBB server.

[Learn More](https://higheredlab.com/bigbluebutton-support/) about the scope of Tech support.

## More on BigBlueButton

Check-out the following apps to further extend features of BBB.

### [bbb-admin](https://github.com/manishkatyan/bbb-admin)

Scripts for BigBlueButton admins including extracting IP of users joining, participants attendance, poll answers and many other analytics. 

### [bbb-twilio](https://github.com/manishkatyan/bbb-twilio)

Integrate Twilio into BigBlueButton so that users can join a meeting with a dial-in number. You can get local numbers for almost all the countries.

### [bbb-optimize](https://github.com/manishkatyan/bbb-customize)

Better audio quality, increase recording processing speed, dynamic video profile, pagination, fix 1007/1020 errors and use apply-config.sh to manage your customizations are some key techniques for you to optimize and smoothly run your BigBlueButton servers.

### [bbb-streaming](https://github.com/manishkatyan/bbb-streaming)

Livestream your BigBlueButton classes on Youtube or Facebook to thousands of your users.

### [100 Most Googled Questions on BigBlueButton](https://higheredlab.com/bigbluebutton-guide/)

Everything you need to know about BigBlueButton including pricing, comparison with Zoom, Moodle integrations, scaling, and dozens of troubleshooting.

#### Inspired by

bbb-mp4 app builds on the ideas from several other projects, including:
- [puppetcam](https://github.com/muralikg/puppetcam)
- [Canvas-Streaming-Example](https://github.com/fbsamples/Canvas-Streaming-Example)
- [bbb-recorder](https://github.com/jibon57/bbb-recorder)
