const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config');
const timeStamp = new Date().getTime();
const speakeasy = require('speakeasy');
var QRCode = require('qrcode');
function tokenForUser(user) {
  return jwt.sign({ sub: user.id, iat: timeStamp }, config.secret, {
    expiresIn: '1hr'
  });
}
exports.signup = (req, res, next) => {
  const { email, password, key } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .send({ error: 'You must provide both email and pasword' });
  }
  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return res.status(422).send({ error: 'Email already in use' });
    }
    const user = new User({
      email,
      password,
      key
    });
    user.save(err => {
      if (err) {
        return next(user);
      }
      res.json({ token: tokenForUser(user) });
    });
  });
};

exports.signin = function(req, res, next) {
  res.send({
    token: tokenForUser(req.user),
    twoFactorEnabled: req.user.twoFactorEnabled
  });
};

exports.setup = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return done(err);
    }
    if (user.key) {
      QRCode.toDataURL(user.key.otpauth_url, function(err, image_data) {
        res.send({ qrCode: image_data, msg: 'already set up' });
      });
    } else {
      const secret = speakeasy.generateSecret({
        length: 20,
        name: req.user.email
      });

      // save the key
      User.findByIdAndUpdate(
        { _id: req.user.id },
        { key: secret },
        { new: true },
        function(err, updatedUser) {
          if (err) {
            return console.log('Error while updating');
          }
          QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
            console.log('image', image_data);
            res.send({ qrCode: image_data, msg: 'first time' });
          });
        }
      );
    }
  });
};
exports.code = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err);
    }

    const code = req.body.code;
    const secret = user.key.base32;
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code
    });
    verified
      ? res.json({ success: true })
      : res.status(422).send({ error: 'Invalid code' });
  });
};

exports.reset_password = function(req, res, next) {
  req.user.comparePassword(req.body.password, function(err, isMatch) {
    if (err) {
      return err;
    }
    if (!isMatch) {
      return res.send({ error: 'Invalid Password' });
    }
    req.user.password = req.body.new_password;
    req.user.save(function(err, updatedUser) {
      if (err) {
        return err;
      }
      res.send({ success: true });
    });
  });
};

exports.getUser = function(req, res, next) {
  res.send({ twoFactorEnabled: req.user.twoFactorEnabled });
};
exports.change_2f_setting = function(req, res, next) {
  console.log('am here');
  const status = req.body.status;
  User.findByIdAndUpdate(
    { _id: req.user.id },
    { twoFactorEnabled: status },
    function(err) {
      if (err) {
        return next(err);
      }
      return res.send({ success: true });
    }
  );
};
