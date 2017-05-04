#!/bin/sh
gst-launch-1.0 \
  audiotestsrc ! \
    audioresample ! audio/x-raw,channels=1,rate=16000 ! \
    opusenc bitrate=20000 ! \
      rtpopuspay ! udpsink host=127.0.0.1 port=5002 \
  videotestsrc ! \
    video/x-raw,width=1920,height=1080,framerate=25/1 ! \
    videoscale ! videorate ! videoconvert ! timeoverlay ! \
    x264enc ! \
    rtph264pay pt=96 ! udpsink host=127.0.0.1 port=5004
