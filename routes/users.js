import express from "express";
import User from '../models/user.js';

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find()
    .sort('name')
    .exec()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      next(err);
    });
});

/* POST new user */
router.post('/', (req, res, next) => {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);
  // Save that document
  newUser.save()
    .then(savedUser => {
      // Send the saved document in the response
      res.send(savedUser);
    })
    .catch(err => {
      next(err);
    });
});

export default router;
