require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_incident_management';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully at:', mongoURI);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error('API Error:', err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.path.startsWith('/users') || req.headers.accept?.includes('application/json')) {
    return res.status(err.status || 500).json({
      message: err.message,
      error: req.app.get('env') === 'development' ? err.stack : {}
    });
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const startServer = () => {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log('Express server listening on port', port);
  });
};

setImmediate(startServer);

module.exports = app;
