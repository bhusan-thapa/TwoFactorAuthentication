'user strict';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');

const keys = require('./config/key');

mongoose.set('useCreateIndex', true);
mongoose.connect(
  keys.mongoURI,
  {
    useNewUrlParser: true
  }
);
const router = require('./routes');
const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));
// app.use(passport.initialize());
// app.use(passport.session());
router(app);
const PORT = process.env.PORT || 3090;

const server = http.createServer(app);
server.listen(PORT, () => console.log(`running on ${PORT}`));
