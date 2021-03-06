var server = null;

if(window.location.protocol === 'http:')
    server = "http://" + window.location.hostname + ":8088/janus";
else
    server = "https://" + window.location.hostname + ":8089/janus";

// janus object
var janus = null;
// streaming plugin object
var streaming = null;
var opaqueId = "streamingtest" + Janus.randomString(12);

var started = false;
var spinner = null;

var streamsList = null;
var selectedStream = null;

window.onload = function() {
    document.getElementById("server").innerHTML = "janus server address: " + server;

    Janus.init({debug: "all", callback: function() {
        // check if browser support webrtc
        if(!Janus.isWebrtcSupported()) {
				    alert("No WebRTC support... ");
				    return;
			  }
        janus = new Janus(
            {
                server: server,
                success: function() {
                    // attach to a streaming plugin
                    janus.attach(
                        {
                            plugin: "janus.plugin.streaming",
                            opaqueId: opaqueId,
                            success: function(pluginHandle) {
                                // Plugin attached! 'PluginHandle' is our handle
                                streaming = pluginHandle;
                                Janus.log("Streaming plugin attached! (" + streaming.getPlugin() + ", id=" + streaming.getId() + ")");
                                updateStreamsList();
                            },
                            error: function(error) {
                                // Could not attach to the plugin
                                alert("Error attaching streaming plugin... " + error);
                            },
                            // This callback is triggered just before getUserMedia is called
                            // (parameter=true) and after it completed (parameter=false);
                            // this means it can be used to modify the UI accordingly, e.g.
                            // to promt the user about the need to accept the device access
                            // consent requests
                            consentDialog: function(on) {
                                // e.g. darken the screen if on=true (getUserMedia incoming),
                                // restore it otherwise
                            },
                            onmessage: function(msg, jsep) {
                                Janus.debug(" ::: Got a message :::");
                                Janus.debug(JSON.stringify(msg));
                                var result = msg["result"];
                                if(result !== null && result !== undefined) {
										                if(result["status"] !== undefined && result["status"] !== null) {
											                  var status = result["status"];
											                  if(status === 'starting')
												                    $('#status').removeClass('hide').text("Starting, please wait...").show();
											                  else if(status === 'started')
												                    $('#status').removeClass('hide').text("Started").show();
											                  else if(status === 'stopped')
												                    stopStream();
										                }
									              } else if(msg["error"] !== undefined && msg["error"] !== null) {
										                bootbox.alert(msg["error"]);
										                stopStream();
										                return;
									              }
                                // jsep - javascript session establishment protocol
                                // if jsep is not null, message involves webrtc negotiation
									              if(jsep !== undefined && jsep !== null) {
                                    // we have an OFFER from the plugin
                                    // sdp - session description protocol
										                Janus.debug("Handling SDP as well...");
										                Janus.debug(jsep);
										                // Answer
										                streaming.createAnswer(
											                  {
                                            // Attach the remote OFFER
												                    jsep: jsep,
                                            // We want recvonly audio/video
												                    media: { audioSend: false, videoSend: false },
												                    success: function(jsep) {
                                                // Got our SDP! Send out ANSWER to the plugin
													                      Janus.debug("Got SDP!");
													                      Janus.debug(jsep);
													                      var body = { "request": "start" };
													                      streaming.send({"message": body, "jsep": jsep});
												                    },
												                    error: function(error) {
                                                // An error occured
													                      Janus.error("WebRTC error:", error);
													                      bootbox.alert("WebRTC error... " + JSON.stringify(error));
												                    }
											                  });
									              }
                            },
                            onlocalstream: function(stream) {
                                // This will NOT be invoked, we've choosen recvonly
                            },
                            // a remote media stream is available and ready to be displayed
                            onremotestream: function(stream) {
                                // invoked after send has got us a PeerConnection
                                // This is the remote video
                                Janus.debug(" ::: Got a remote stream ::: ");
                                Janus.debug(JSON.stringify(stream));
                                Janus.attachMediaStream($('#remotevideo').get(0), stream);
                            },
                            oncleanup: function() {
                                // PeerConnection with the plugin closed, clean the UI
                                // The plugin handle is still valid so we can create a new one
                            },
                            detached: function() {
                                // Connection with the plugin closed, get rid of its features
                                // The plugin handle is not valid anymore
                            }
                        });
                }
            }
        );
    }});
};

function updateStreamsList() {
    var body = { "request": "list" };
    streaming.send(
        {"message": body,
         success: function(result) {
             if(result === null || result == undefined) {
                 alert("Failed getting streaming list");
                 return;
             }
             if(result["list"] !== undefined && result["list"] !== null) {
                 var list = result["list"];
                 Janus.log("Got a list of available streams");
                 Janus.debug(list);
                 streamsList = list;
                 startStream();
             }
         }});
}

function startStream() {
    selectedStream = streamsList[0]["id"];
    Janus.log("Starting stream with ID " + selectedStream);
    var body = { "request": "watch", id: parseInt(selectedStream) };
    streaming.send({"message": body});
}
