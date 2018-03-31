const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const http = require("http");

const controls = require('./controls.json');
const albums = require('./albums.json');

const serialPort = process.env.SERIAL_PORT || "/dev/ttyACM0"; // "/dev/tty.usbmodem1431" on my Mac
const volumioServer = process.env.VOLUMIO_SERVER || "http://localhost:3000"; // http://volumio.local

const port = new SerialPort(serialPort, {
  baudRate: 9600
});

port.on('error', function(error) {
  console.log("error: " + error.message);
});

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

parser.on("data", data => {
  console.log(data);

  if (controls.play === data) {
    console.log("play");
    http.get(volumioServer + "/api/v1/commands/?cmd=play");
  } else if (controls.pause === data) {
    console.log("pause");
    http.get(volumioServer + "/api/v1/commands/?cmd=pause");
  } else if (controls.next === data) {
    console.log("next");
    http.get(volumioServer + "/api/v1/commands/?cmd=next");
  } else if (controls.previous === data) {
    console.log("previous");
    http.get(volumioServer + "/api/v1/commands/?cmd=prev");
  } else {
    const album = albums[data];  
    if (album) {
      console.log("album: " +  album);
      var albumVar = encodeURIComponent(album);
      var url = volumioServer + "/api/v1/commands/?cmd=playplaylist&name=" + album;
      http.get(url);      
    }
  }
});

