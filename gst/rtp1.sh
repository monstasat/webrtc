#!/bin/sh
gst-launch-1.0 \
    filesrc location=/home/alexander/Видео/c2000_promo.mp4 ! \
    decodebin ! \
    videoscale ! video/x-raw,width=320,height=240! \
    videorate ! videoconvert ! timeoverlay ! \
    vp8enc ! \
    rtpvp8pay ! udpsink host=127.0.0.1 port=5004
