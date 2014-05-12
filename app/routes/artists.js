/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  artists.find().toArray((err, artist)=>
  {
    res.render('artists/index', {artists: artist, title: 'NodeTunes - Artists'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>
  {
    var photo = files.photo[0];

    var artist = {
      name: fields.name[0],
      photo: photo.originalFilename
    };

    artists.save(artist, ()=>
    {
      artists.find({name: artist.name, photo: artist.photo}).toArray((err, aArtists)=>
      {
        if(aArtists.length)
        {
          aArtists.forEach((a, i)=>
          {
            var path = photo.path;
            if(i < aArtists.length - 1)
            {
              var sourceData = fs.readFileSync(photo.path);
              path = path.replace('.','temp.');
              fs.writeFileSync(path, sourceData);
            }
            createArtistDirectory(a, path);
          });
        }

        function createArtistDirectory(a, oldPath)
        {
          var newPath = `${__dirname}/../static/img/artists/${a._id}`;
          if(!fs.existsSync(newPath))
          {
            fs.mkdirSync(newPath);
            fs.renameSync(oldPath, `${newPath}/${photo.originalFilename}`);
          }
        }
      });

      res.redirect('/artists');
    });
  });
};

exports.show = (req, res)=>{
  var _id = req.params.id;
  // var artistId = song.artist;

  songs.find({artist:_id}).toArray((e, song)=>{
    res.render('artists/show', {songs: song, title: 'Artist Show Page'});

  });
};


// var form = new multiparty.Form();
//
// form.parse(req, (err, fields, files)=>{
//   var artist = {};
//   artist.name = fields.name[0];
//   artist.photo = files.photo[0];
//   // artists.save(artist, ()=>res.redirect('/artists'));
//
//
//   console.log('----fields----');
//   console.log(fields);
//   console.log('----files----');
//   console.log(files);
// });

  //var artist = {};
  //
  // artist.name = req.body.name;
  //
  // console.log('---------');
  // console.log(fields);
  // console.log(files);
  //
  //
  // res.render('artists/index', {title: 'Artists Page'});
// };
