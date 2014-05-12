/* jshint unused:false */

'use strict';

var songs = global.nss.db.collection('songs');
var artists = global.nss.db.collection('artists');
var albums = global.nss.db.collection('albums');
var multiparty = require('multiparty');
var fs = require('fs');
var _ = require('lodash');
var Mongo = require('mongodb');

exports.index = (req, res)=>{
  songs.find().toArray((e, s)=>{
    artists.find().toArray((e, a)=>{
      albums.find().toArray((e, alb)=>{

        s = s.map(s=>{

          var ar = _(a).find(a=>a._id.toString() === s.artist.toString());
          var al = _(alb).find(alb=>alb._id.toString() === s.album.toString());
          s.artist = ar;
          s.album = al;

          return s;
        });

        res.render('songs/index', {artists: a, albums: alb, songs: s, title: 'Songs Page'});
      });
    });
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{


    var albumId = Mongo.ObjectID(fields.albumId[0]);

    albums.find({_id: albumId}).toArray((err, album)=>{

      // var albumName = album.name;

      var artistId = Mongo.ObjectID(fields.artistId[0]);

        artists.find({_id: artistId}).toArray((err, artist)=>{

        // var artistName = artist.name;



        // console.log('------fields------');
        // console.log(fields);
        // console.log('------files------');
        // console.log(files);

        var song = {};
        song.name = fields.name[0];
        song.artistName = artist[0].name;
        song.artist = fields.artistId[0];
        song.albumName = album[0].name;
        song.album = fields.albumId[0];
        song.genre = fields.genre[0];
        song.mp3 = files.audio[0].originalFilename;



        console.log('------song object------');
        console.log(song);


        songs.save(song, ()=>
        {
          songs.find({name: song.name}).toArray((err, songArray)=>
          {
            if(songArray.length)
            {
              songArray.forEach((s, i)=>
              {
                var path = files.audio[0].path;
                if(i < songArray.length - 1)
                {
                  var sourceData = fs.readFileSync(path);
                  path = path.replace('.','temp.');
                  fs.writeFileSync(path, sourceData);
                }
                createSongDirectory(s, path);

              });
            }

            function createSongDirectory(s, oldPath)
            {
              var newPath = `${__dirname}/../static/audios/songs/${s._id}`;
              if(!fs.existsSync(newPath))
              {
                fs.mkdirSync(newPath);
                fs.renameSync(oldPath, `${newPath}/${song.mp3}`);
              }
            }
          });

          res.redirect('/songs');
        });

      });

        // var genres = fields.genres[0].split(',').map(g=>g.trim().toLowerCase());
      });
    });

};

exports.filter = (req, res)=>{
  //console.log(req);
  var genre = req.query.genre;
  songs.find({genre:genre}).toArray((e,s)=>{
    albums.find().toArray((e,alb)=>{
      artists.find().toArray((e,a)=>{
        res.render('songs/index', {songs: s, albums: alb, artists: a, title: 'Songs Filtered'});

      });
    });
  });
};








  //   var song = {};
  //   song.title = fields.title[0];
  //   song.date = new Date(fields.date[0]);
  //   song.photos = [];
  //   files.photos.forEach(p=>{
  //
  //     fs.renameSync(p.path, `${__dirname}/../static/img/${p.originalFilename}`);
  //     album.photos.push(p.originalFilename);
  //
  //
  //   });
  //
  //
  //
  //   albums.save(album, ()=>res.redirect('/albums'));
  //


//
//
//   req.body.artistId = Mongo.ObjectID(req.body.artistId);
//   // var form = new multiparty.Form();
//   //
//   // form.parse(req, (err, fields, files)=>
//   // {
//   //   console.log('-----------fields-----------');
//   //   console.log(fields);
//   //   console.log('-----------files-----------');
//   //   console.log(files);
//   //
//   // //   var photo = files.photo[0];
//   // //
//   // //   var artist = {
//   // //     name: fields.name[0],
//   // //     photo: photo.originalFilename
//   // //   };
//   // //
//   // //   artists.save(artist, ()=>
//   // //   {
//   // //     artists.find({name: artist.name, photo: artist.photo}).toArray((err, aArtists)=>
//   // //     {
//   // //       if(aArtists.length)
//   // //       {
//   // //         aArtists.forEach((a, i)=>
//   // //         {
//   // //           var path = photo.path;
//   // //           if(i < aArtists.length - 1)
//   // //           {
//   // //             var sourceData = fs.readFileSync(photo.path);
//   // //             path = path.replace('.','temp.');
//   // //             fs.writeFileSync(path, sourceData);
//   // //           }
//   // //           createArtistDirectory(a, path);
//   // //         });
//   // //       }
//   // //
//   // //       function createArtistDirectory(a, oldPath)
//   // //       {
//   // //         var newPath = `${__dirname}/../static/img/artists/${a._id}`;
//   // //         if(!fs.existsSync(newPath))
//   // //         {
//   // //           fs.mkdirSync(newPath);
//   // //           fs.renameSync(oldPath, `${newPath}/${photo.originalFilename}`);
//   // //         }
//   // //       }
//   // //     });
//   // //
//   // //     res.redirect('/artists');
//   // //   });
//   // });
//
// };
