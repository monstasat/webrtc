#!/bin/sh
gst-launch-1.0 \
  audiotestsrc ! \
    audioresample ! audio/x-raw,channels=1,rate=16000 ! \
    opusenc bitrate=20000 ! \
      rtpopuspay ! udpsink host=127.0.0.1 port=5002 \
  filesrc location=/home/alexander/Videos/demo.mp4 ! decodebin ! \
    video/x-raw,width=1280,height=720 ! \
    videoscale ! videorate ! videoconvert ! \
    vp8enc target-bitrate=55000000 ! \
    rtpvp8pay ! udpsink host=127.0.0.1 port=5004
