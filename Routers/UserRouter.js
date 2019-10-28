"use strict";
const user = require('express').Router();


user.get('/getGoals', (req,res) => {
  let {users, ObjectID} = req.app.locals;
  users.findOne(
    { _id: ObjectID(req.session.passport.user) },
    { projection : { _id: 0, type: 0, user: 0, favExercises: 0, favFoods: 0} } )
    .then(result => {
      res.json(result)
    })
})

//get favorites!
user.get('/getFavorites', (req,res) => {
  let {users, ObjectID} = req.app.locals;
  users.findOne(
    { _id: ObjectID(req.session.passport.user) },
    req.query
  )
    .then(result => res.json(result))
    .catch(err => console.error(err))
})

user.get('/getUserInfo', (req, res) => {
  let {ObjectID, users} = req.app.locals;
  let {user} = req.session.passport;
  if(user){
    users.findOne(
      { _id: ObjectID(user)}
    )
     .then(user => res.json(user));
  }
  else{
    res.status(401).send({error: "Not Authenticated!"})
  }
})

// updates the users' goals such as weight loss goals and macronutrient goals
user.post('/updateMacroGoals', (req,res) => {
  let {users, ObjectID} = req.app.locals;
  users.updateOne(
    { _id: ObjectID(req.session.passport.user) },
    { $set: {macros: req.body} },
    {upsert : true}
  )
    .catch(err => console.error(error))
  res.end()
})

user.post('/updateUserStats', (req,res) => {
  let {users, ObjectID} = req.app.locals;
  let {Calories, ...userStats} = req.body;
  users.updateOne(
    { _id: ObjectID(req.session.passport.user) },
    { $set: {Calories, userStats } },
    {upsert : true}
  )
    .catch(err => console.error(error))
  res.end()
})

user.post('/insertFavorites', (req, res) => {
  let {users, ObjectID} = req.app.locals;
  let {field, item} = req.body;
  users.updateOne(
    { _id: ObjectID(req.session.passport.user) },
    { $addToSet: { [field]: item } },
    { upsert: true }
  )
    .catch(err => console.error(err))
  res.end();
})

user.post('/deleteFavorites', (req, res) => {
  let {users} = req.app.locals;
  let { field, item} = req.body;
  users.updateOne(
    { _id: ObjectID(req.session.passport.user) },
    { $pull: { [field] : item } }
  )
    .catch(err => console.error(err))
  res.end();
})


module.exports = user;
