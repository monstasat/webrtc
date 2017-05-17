#!/bin/sh
gst-launch-1.0 \
  audiotestsrc ! \
    audioresample ! audio/x-raw,channels=1,rate=16000 ! \
    opusenc bitrate=20000 ! \
    rtpopuspay ! udpsink host=127.0.0.1 port=5002 \
  filesrc location=/home/alexander/Videos/demo.mp4 ! \
    qtdemux ! h264parse ! avdec_h264 ! \
    videoscale ! video/x-raw,width=840,height=525 ! \
    vp8enc ! rtpvp8pay ! udpsink host=127.0.0.1 port=5004
