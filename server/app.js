const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./routes');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use('/', router.router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.message = 'Not Found';
  err.status = 404;
  res.send('Not Found');
});

//error handler
app.use((err, req, res, next) => {
  //res.status();
  res
    .status(err.status || 500)
    .send({ status: err.status ? `${err.status}` : 500, message: err.message });
  next(err);
});
/**
 * This function is used to get a valid json object while parsing objects
 **/
process.common = (function() {
  let response = {};
  response.getJSONObject = val => {
    if (typeof val === 'object') {
      return val;
    } else if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        logger.log('%s', val);
        return {};
      }
    }
  };
  return response;
})();

/**
 * response interceptor for checking if the headers have already been set or not.
 **/

/* istanbul ignore next */
app.use((req, res, next) => {
  let _send = res.send;
  let sent = false;
  res.send = data => {
    if (sent) return;
    _send.bind(res)(data);
    sent = true;
  };
  next();
});

module.exports = app;
