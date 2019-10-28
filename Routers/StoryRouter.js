"use strict";
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const story = require('express').Router();

const storage = new GridFsStorage({
  url: 'mongodb://localhost:27017/a-better-u',
  file: (req, file) => {
    console.log('im in')
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'storyMedia' //should match the collection name that you gave it!!!
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

story.get('/getStories', (req,res) => {
  let {stories} = req.app.locals;
  stories.find()
    .sort( { date: -1, _id: -1} )
    .toArray()
    .then(items => { res.json(items) } )
    .catch( err => console.error(err))
})

//need to use readStream to show the files
//@route GET /image/:filename
// @desc Display image
story.get('/media/:id', (req, res) => {
  let {gfs, ObjectID} = req.app.locals;
  //gets filename from the url
  gfs.files.findOne({_id: ObjectID(req.params.id)}, (err, file) => {
    if(!file || file.length === 0){
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

// @route POST /upload
// @desc Uploads file to DB
story.post('/uploadStories', upload.single('file'), (req, res) => {
  let {date, ObjectID, stories, users} = req.app.locals;
  let text = req.body.text || "";
  let file = req.file ? req.file : false;
  users.findOne(
    { _id: ObjectID(req.session.passport.user)}
  )
    .then(result => {
      let {name, picture, user} = result;
      stories.insertOne({
        user: {
          user,
          name,
          picture
        },
        text,
        file,
        date
      })
        .catch(err => console.error(err))
    })
  res.end()
});

story.put('/editStories', upload.single('file'), (req, res) => {
  let {gfs, ObjectID, stories} = req.app.locals;
  let {_id, oldFile, text} = req.body;
  text = text || "";
  oldFile = JSON.parse(oldFile);
  let file = req.file ? req.file : oldFile;
  stories.updateOne(
    { _id : ObjectID(_id) },
    {$set: { text, file} }
  )
    .catch(err => console.error(err))
  if(file && file.id !== oldFile.id){
    gfs.remove({_id: oldFile, root: 'storyMedia'}, (err, gridStore) => {
      if(err){
        return res.status(404).json({
          err: err
        });
      }
    })
  }
  res.end()
});

story.delete('/deleteStory', (req, res) => {
  let {gfs, ObjectID, stories} = req.app.locals;
  let { story_id, file_id } = req.query;
  stories.deleteOne( { _id : ObjectID(story_id) } )
    .catch(err => console.error(err))
  if(file_id){
    gfs.remove({_id: ObjectID(file_id), root: 'storyMedia'}, (err, gridStore) => {
      if(err){
        return res.status(404).json({
          err: err
        });
      }
    })
  }
  res.end()
})

module.exports = story;
