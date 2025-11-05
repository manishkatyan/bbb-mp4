# BigBlueButton MP4

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

## Install

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

- create `bbb_mp4.rb` to invoke `bbb-mp4.sh` that will start automatic MP4 conversion after a class recording is published.
- create a directory `recording` at `/var/www/bigbluebutton-default` to store converted MP4 videos that can be accessed via browser.
- update the default index.html at `/var/bigbluebutton/playback/presentation/2.3/index.html` to provide download button.

```sh

# add user bigbluebutton to docker group
sudo usermod -aG docker bigbluebutton

# change ownership of /var/www/bbb-mp4 to bigbluebutton
sudo chown -R bigbluebutton:bigbluebutton /var/www/bbb-mp4

```

You need to give user bigbluebutton sudo access, as detailed above, for bbb-mp4 to run correctly.

If you are using BigBlueButton 2.6 or higher version you need to add nginx location to access mp4 recording
```sh
cd /usr/share/bigbluebutton/nginx
sudo touch bbb-mp4.nginx
sudo bash -c "echo 'location /mp4 { root    /var/www/bigbluebutton-default; }' > bbb-mp4.nginx"
sudo nginx -t
sudo nginx -s reload
```

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

## 🚀 <a href="https://higheredlab.com/bigbluebutton" target="_blank">Stress-free BigBlueButton hosting! Start free Trial</a>

**Save big with our affordable BigBlueButton hosting.**

- Bare metal servers for HD video
- 40% lower hosting costs
- Top-rated tech support, 100% uptime
- Upgrade / cancel anytime
- 2 weeks free trial; No credit card needed

<a href="https://higheredlab.com/bigbluebutton" target="_blank"><strong>Start Free Trial</strong></a>
