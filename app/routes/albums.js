'use strict';

var albums = global.nss.db.collection('albums');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');

exports.index = (req, res)=>{
  albums.find().toArray((e, album)=>{
    res.render('albums/index', {albums: album, title: 'NodeTunes - Albums'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>
  {
    var photo = files.photo[0];

    var album = {
      name: fields.name[0],
      photo: photo.originalFilename
    };

    albums.save(album, ()=>
    {
      albums.find({name: album.name, photo: album.photo}).toArray((err, aAlbums)=>
      {
        if(aAlbums.length)
        {
          aAlbums.forEach((a, i)=>
          {
            var path = photo.path;
            if(i < aAlbums.length - 1)
            {
              var sourceData = fs.readFileSync(photo.path);
              path = path.replace('.','temp.');
              fs.writeFileSync(path, sourceData);
            }
            createAlbumDirectory(a, path);
          });
        }

        function createAlbumDirectory(a, oldPath)
        {
          var newPath = `${__dirname}/../static/img/albums/${a._id}`;
          if(!fs.existsSync(newPath))
          {
            fs.mkdirSync(newPath);
            fs.renameSync(oldPath, `${newPath}/${photo.originalFilename}`);
          }
        }
      });

      res.redirect('/albums');
    });
  });
};

exports.show = (req, res)=>{
  var _id = req.params.id;
  // var artistId = song.artist;

  songs.find({album:_id}).toArray((e, song)=>{
    res.render('albums/show', {songs: song, title: 'Albums Show Page'});

  });
};


//   form.parse(req, (err, fields, files)=>{
//     var artist = {};
//     artist.name = fields.name[0];
//     artist.photo = files.photo[0];
//     // artists.save(artist, ()=>res.redirect('/artists'));
//
//
//     console.log('----fields----');
//     console.log(fields);
//     console.log('----files----');
//     console.log(files);
//   });
//
//   //var artist = {};
//   //
//   // artist.name = req.body.name;
//   //
//   // console.log('---------');
//   // console.log(fields);
//   // console.log(files);
//   //
//   //
//   // res.render('artists/index', {title: 'Artists Page'});
// };
