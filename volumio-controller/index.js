const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const io = require("socket.io-client");

const controls = require("./controls.json");
const music = require("./music.json");

const serialPort = process.env.SERIAL_PORT || "/dev/ttyACM0"; // "/dev/tty.usbmodem1431" on my Mac
const volumioServer = process.env.VOLUMIO_SERVER || "http://localhost:3000"; // http://volumio.local

var socket = io.connect(volumioServer);

var status = null;

socket.on("pushState", function(data) {
  console.log("status: " + data.status);
  status = data.status;
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
  console.log(data);

  const controlItem = controls[data];
  const musicItem = music[data];

  if (controlItem) {
    console.log(controlItem);

    if (controlItem === "playpause") {
      if (status === "play") {
        socket.emit("pause");
      } else {
        socket.emit("play");
      }
    } else {
      socket.emit(controlItem);
    }
  } else if (musicItem) {
    console.log(musicItem);
    socket.emit("replaceAndPlay", musicItem);
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
