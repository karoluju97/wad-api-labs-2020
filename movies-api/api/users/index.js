import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res) => {
    User.find().then(users =>  res.status(200).json(users));
});

// Register OR authenticate a user
router.post('/', async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      res.status(401).json({
        success: false,
        msg: 'Please pass username and password.',
      });
    }
    if (req.query.action === 'register') {
      await User.create(req.body).catch(next);
      res.status(201).json({
        code: 201,
        msg: 'Successful created new user.',
      });
    } else {
      const user = await User.findByUserName(req.body.username).catch(next);
        if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            const token = jwt.sign(user.username, process.env.SECRET);
            // return the information including token as JSON
            res.status(200).json({
              success: true,
              token: 'BEARER ' + token,
            });
          } else {
            res.status(401).json({
              code: 401,
              msg: 'Authentication failed. Wrong password.'
            });
          }
        });
      }
  });

// Update a user
router.put('/:id',  (req, res) => {
    if (req.body._id) delete req.body._id;
     User.update({
      _id: req.params.id,
    }, req.body, {
      upsert: false,
    })
    .then(user => res.json(200, user));
});

// authenticate a user
router.post('/', (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(401).send('authentication failed');
    } else {
        User.findByUserName(req.body.username).then(user => {
            if (user.comparePassword(req.body.password)) {
                req.session.user = req.body.username;
                req.session.authenticated = true;
                res.status(200).json({
                    success: true,
                    token: "temporary-token"
                  });
            } else {
                res.status(401).json('authentication failed');
            }
        }).catch(next);
    }
  });

  router.get('/:userName/favourites', (req, res, next) => {
    const user = req.params.userName;
    User.find( {username: user}).then(
        user => res.status(201).send(user.favourites)
    ).catch(next);
  });
export default router;