#!usr/bin/sh
duration=$1
exportname=$2
disp_num=$3

#ffmpeg command to capture screen
ffmpeg  -draw_mouse 0 -s 1280x800 \
	-framerate 30 \
	-f x11grab -thread_queue_size 1024 \
	-i :$disp_num \
	-f alsa -thread_queue_size 1024 \
	-itsoffset 0.57 \
	-i pulse -ac 2 \
	-c:v libx264 -c:a aac  \
	-crf 22  \
	-pix_fmt yuv420p \
	-preset veryfast \
	-movflags faststart \
	-t $duration \
	/usr/src/app/download/$exportname.mp4
