const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const io = require("socket.io-client");
const fs = require("fs");

const controls = require("./controls.json");
const music = require("./music.json");

const serialPort = process.env.SERIAL_PORT || "/dev/ttyACM0"; // "/dev/tty.usbmodem1431" on my Mac
const volumioServer = process.env.VOLUMIO_SERVER || "http://localhost:3000"; // http://volumio.local

var socket = io.connect(volumioServer);

var currentState = null;

socket.on("pushState", function(data) {
    console.log("current state: " + JSON.stringify(data));
    currentState = data;
});

socket.on("disconnect", function() {
  console.log("disconnected");
});

socket.emit("getState");

const port = new SerialPort(serialPort, {
  baudRate: 9600
});

port.on("error", function(error) {
  console.log("error: " + error.message);
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

  const controlItem = controls[data];
  const musicItem = music[data];

  if (controlItem) {
    console.log(data + " is connected to: " + JSON.stringify(controlItem));
  } else if (musicItem) {
    console.log(data + " is connected to: " + JSON.stringify(musicItem));
  } else {
    var newMusicItem = {
        service: currentState.service,
        uri: currentState.uri
    };

    if (currentState.service === "mpd") {
        console.log("service is mpd");
        const encodedArtist = currentState.artist ? encodeURIComponent(currentState.artist) : "";
        const encodedAlbum = encodeURIComponent(currentState.album);
        newMusicItem.uri = "albums://" + encodedArtist + "/" + encodedAlbum;
    }    

    music[data] = newMusicItem;

    var jsonContent = JSON.stringify(music, null, 2);

    fs.writeFile("music.json", jsonContent, "utf8", function(err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log(data + " is now connected to: " + JSON.stringify(newMusicItem));
    });
    
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
  socket.disconnect();
  process.exit();
});
