const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const io = require("socket.io-client");
const path = require("path");
const fs = require("fs");

const controls = require("./controls.json");
const music = require("./music.json");

const serialPath = process.env.SERIAL_PATH || "/dev/ttyACM0";
const volumioServer = process.env.VOLUMIO_SERVER || "http://localhost:3000";

const port = new SerialPort({
  path: serialPath,
  baudRate: 9600
});

var currentState = {};

function registerMusic(cardId) {
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

  music[cardId] = newMusicItem;

  var jsonContent = JSON.stringify(music, null, 2);

  var file = path.join(__dirname, "music.json");
  fs.writeFile(file, jsonContent, "utf8", function(err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log(cardId + " is now connected to: " + JSON.stringify(newMusicItem));
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

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", data => {
  console.log(data);

  const cardId = data.startsWith("NewCard") ? data.slice(8) : null;

  if (data === "CardRemoved") {
    if (
      currentState.service === "webradio" ||
      currentState.service === "tunein_radio"
    ) {
      socket.emit("stop");
    } else {
      socket.emit("pause");
    }
    return;
  }

  const controlItem = controls[cardId];
  const musicItem = music[cardId];

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
    } else {
      socket.emit(controlItem);
    }
  } else if (musicItem) {
    console.log(musicItem);
    socket.emit("replaceAndPlay", musicItem);
  } else if (currentState.status === "play") {
    registerMusic(cardId);
  }
});

const socket = io.connect(volumioServer);

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
