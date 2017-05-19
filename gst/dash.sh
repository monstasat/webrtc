gst-launch-1.0 \
    videotestsrc is-live=true ! timeoverlay ! \
    x264enc ! \
    mp4dashmux fragment-method=1 fragment-duration=2 ! \
    dashsink is-live=true delete-old-files=true fragment-duration=2 title="manifest"
