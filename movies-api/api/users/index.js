import express from 'express';
import User from './userModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res) => {
    User.find().then(users =>  res.status(200).json(users));
});

// register
router.post('/', (req, res) => {
        new User(req.body).save().then(user => res.status(200).json({success:true,token:"FakeTokenForNow"}))
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