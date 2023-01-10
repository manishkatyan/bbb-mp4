#!/usr/bin/ruby
# encoding: UTF-8
require "optimist"
require File.expand_path('../../../lib/recordandplayback', __FILE__)

logger = Logger.new("/var/log/bigbluebutton/post_publish.log", 'weekly' )
logger.level = Logger::INFO
BigBlueButton.logger = logger

opts = Optimist::options do
  opt :meeting_id, "Meeting id to convert mp4", :type => String
  opt :format, "Playback format name", :type => String
end
meeting_id = opts[:meeting_id]

bbb_mp4_cmd = "bash /var/www/bbb-mp4/bbb-mp4.sh #{meeting_id} &"
status = system (bbb_mp4_cmd)
BigBlueButton.logger.info("MP4 conversion started for #{meeting_id}: #{status}")
