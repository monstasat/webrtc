#!/bin/sh
gst-launch-1.0 \
    filesrc location=/home/alexander/Videos/demo.mp4 ! \
    decodebin ! \
    videoscale ! video/x-raw,width=320,height=240! \
    videorate ! videoconvert ! timeoverlay ! \
    x264enc ! \
    rtph264pay ! udpsink host=127.0.0.1 port=5004
