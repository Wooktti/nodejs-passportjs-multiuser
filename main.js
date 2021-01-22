const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
app.use(helmet());
const session = require('express-session');
const LowdbStore = require('lowdb-session-store')(session);
const flash = require('connect-flash');
const port = 3000;
const db = require('./lib/db');
const sessiondb = require('./lib/sessiondb');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(compression());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new LowdbStore(sessiondb, {ttl: 900}),
  cookie: {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + 900000) 
  }
}));
app.use(flash());

const passport = require('./lib/passport')(app);

app.get('*', function(request, response, next) {
  request.list = db.get('topics').value();
  next();
});

const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  res.status(404).send(`Sorry can't find that!`);
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});