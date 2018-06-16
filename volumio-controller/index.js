const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const io = require("socket.io-client");
const path = require('path');
const fs = require("fs");

const controls = require("./controls.json");
const music = require("./music.json");

const serialPort = process.env.SERIAL_PORT || "/dev/ttyACM0"; // "/dev/tty.usbmodem1431" on my Mac
const volumioServer = process.env.VOLUMIO_SERVER || "http://localhost:3000"; // http://volumio.local

const port = new SerialPort(serialPort, {
  baudRate: 9600
});



var currentState = {};
var nextAction = null;

function registerMusic(data) {
  var newMusicItem = {
    service: currentState.service,
    uri: currentState.uri
  };

  if (currentState.service === "mpd") {
    console.log("service is mpd");
    const encodedArtist = currentState.artist
      ? encodeURIComponent(currentState.artist)
      : "";
    const encodedAlbum = encodeURIComponent(currentState.album);
    newMusicItem.uri = "albums://" + encodedArtist + "/" + encodedAlbum;
  }

  music[data] = newMusicItem;

  var jsonContent = JSON.stringify(music, null, 2);

  var file = path.join(__dirname, "music.json");
  fs.writeFile(file, jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log(data + " is now connected to: " + JSON.stringify(newMusicItem));
  });
}

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
        if (currentState.service === "webradio" || currentState.service === "tunein_radio") {
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
        console.log("stopped register music")
        nextAction = null;
      }, 5000);
    } else {
      socket.emit(controlItem);
    }
  } else if (musicItem) {
    console.log(musicItem);
    socket.emit("replaceAndPlay", musicItem);
  }
});




var socket = io.connect(volumioServer);

socket.on("pushState", function(data) {
  console.log("status: " + data.status);
  currentState = data;
});

socket.on("disconnect", function() {
  console.log("disconnected");
});

socket.emit("getState");




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
  socket.disconnect();
  process.exit();
});
