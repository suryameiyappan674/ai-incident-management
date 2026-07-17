require('dotenv').config();
var path = require('path');
var http = require('http');
var logger = require('morgan');
var express = require('express');
var cors = require('cors');
const mongoose = require('mongoose');
var createError = require('http-errors');
var cors = require('cors');
var usersRouter = require('./routes/users');
var incidentsRouter = require('./routes/incidents');
// Import models to ensure schemas are registered with Mongoose
require('./models/Role');
require('./models/User');
require('./models/Incident');
require('./models/IncidentAssignment');
var cookieParser = require('cookie-parser');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_incident_management';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully at:', mongoURI);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

var app = express();
const server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:4000',
    'http://10.68.10.106:4200'
  ],
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/incidents', incidentsRouter);

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
  if (err.status === 404) {
    return res.status(404).json({
      message: "Not Found",
      statusCode: 404
    });
  }
  return res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err.stack : {}
  });
});

const startServer = () => {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log('Express server listening on port', port);
  });
};

setImmediate(startServer);

module.exports = app;
