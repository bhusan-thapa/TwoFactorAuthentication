const passport = require('passport');
const speakEasy = require('speakeasy');

const passportService = require('./services/passport');
const Authentication = require('./controllers/authentication');
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = app => {
  app.get('/', (req, res, next) => {
    res.send('Digital Ident');
  });

  app.post('/signup', Authentication.signup);
  app.get('/feature', requireAuth, (req, res) => {
    res.send({ secret: 'hello' });
  });
  app.post('/signin', requireSignin, Authentication.signin);
  app.get('/2fa_setup', requireAuth, Authentication.setup);
  app.post('/2fa_code', requireAuth, Authentication.code);
  app.post('/reset_password', requireAuth, Authentication.reset_password);
  app.get('/user', requireAuth, Authentication.getUser);
  app.post('/change_2f_setting', requireAuth, Authentication.change_2f_setting);
};
