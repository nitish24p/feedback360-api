const __DEV__ = process.env.NODE_ENV !== 'production';

const Logger = {
  log: function() {
    if (__DEV__) {
      console.log.apply(console, arguments);
    }
  }
};

module.exports = Logger;
