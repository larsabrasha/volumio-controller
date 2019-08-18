const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const path = require("path");
const fs = require("fs");
const http = require("http");

const controls = require("./controls.json");
const music = require("./music.json");

const serialPort = process.env.SERIAL_PORT || "/dev/ttyACM0"; // "/dev/tty.usbmodem1431" on my Mac
const baseUrl = process.env.BASE_URL || "http://localhost:5005"; // http://volumio.local:5005

function get(url) {
  http.get(url).on("error", err => {
    console.log("Error: " + err.message);
  });
}

function playAppleMusicAlbum(albumId) {
  get(baseUrl + "/Arbetsrum/leave");
  get(baseUrl + "/Arbetsrum/clearqueue");
  get(baseUrl + "/Arbetsrum/applemusic/now/album:" + albumId);
}

const port = new SerialPort(serialPort, {
  baudRate: 9600
});

var currentState = {};
var nextAction = null;

port.on("error", function(error) {
  console.log("error: " + error.message);
  process.exit();
});

port.on("close", function() {
  console.log("close");
  process.exit();
});

port.on("disconnected", function(err) {
  console.log("disconnected");
  process.exit();
});

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

parser.on("data", data => {
  const ignoredData = [
    "This code scan the MIFARE Classsic NUID.",
    "Using the following key:FFFFFFFFFFFF",
    "PICC type: MIFARE 1KB",
    "The NUID tag is:"
  ];
  if (ignoredData.indexOf(data) != -1) {
    return;
  }

  console.log(data);

  const controlItem = controls[data];
  const musicItem = music[data];

  if (nextAction === "registerMusic") {
    nextAction = null;
    registerMusic(data);
    return;
  }

  if (controlItem) {
    console.log(controlItem);

    if (controlItem === "playpause") {
      if (currentState.status === "play") {
        if (
          currentState.service === "webradio" ||
          currentState.service === "tunein_radio"
        ) {
          socket.emit("stop");
        } else {
          socket.emit("pause");
        }
      } else {
        socket.emit("play");
      }
    } else if (controlItem === "startRegisterMusic") {
      nextAction = "registerMusic";

      setTimeout(function() {
        console.log("stopped register music");
        nextAction = null;
      }, 5000);
    } else {
      socket.emit(controlItem);
    }
  } else if (musicItem) {
    console.log(musicItem);
    if (musicItem["AppleMusicAlbumId"] != null) {
      playAppleMusicAlbum(musicItem["AppleMusicAlbumId"]);
    }
  }
});

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function() {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function() {
  console.log("Caught interrupt signal");
  port.disconnect();
  process.exit();
});
