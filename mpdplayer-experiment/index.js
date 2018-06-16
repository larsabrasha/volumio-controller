var mpd = require("mpd"),
  cmd = mpd.cmd;

var client = mpd.connect({
  port: 6600,
  host: "10.0.1.55"
});

client.on("ready", function() {
  console.log("ready");

  client.sendCommand(cmd("list", ['album', 'group', 'albumartist', 'group', 'date']), function(err, msg) {
    if (err) throw err;
    
    var lines = msg.split('\n');
    
    var albums = [];
    var currentAlbum = null;

    for (const line of lines) {
      console.log('line: ' + line);
      console.log('currentAlbum: ' + JSON.stringify(currentAlbum));
      console.log('');

      if (line.startsWith('Album: ')) {
        if (currentAlbum != null)
          albums.push(currentAlbum);

        currentAlbum = {};
        currentAlbum.album = line.substr(7);
      } else if (line.startsWith('AlbumArtist: ')) {
        currentAlbum.albumArtist = line.substr(13);
      } else if (line.startsWith('Date: ')) {
        currentAlbum.date = parseInt(line.substr(6, 4), 10);
      }
    }

    console.log('albums.length: ', albums.length);

    albums.sort(compareAlbums);

    for (const album of albums) {
      console.log('album: ' + album.album + ' - ' + album.albumArtist + ' - ' + album.date);  
    }
    
  });
});

function compareAlbums(a, b) {
  var dateA = a.date || 0;
  var dateB = b.date || 0;

  if (dateA < dateB)
    return 1;
  if (dateA > dateB)
    return -1;

  if (a.albumArtist < b.albumArtist)
    return -1;
  if (a.albumArtist > b.albumArtist)
    return 1;
    
  return 0;
}

client.on("system", function(name) {
  console.log("update", name);
});

client.on("system-player", function() {
  client.sendCommand(cmd("status", []), function(err, msg) {
    if (err) throw err;
    console.log(msg);
  });
});
