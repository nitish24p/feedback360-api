const express = require('express');
const router = express.Router();
const feedback = {};
const recursive = require('recursive-readdir');
const { pickRandom } = require('./../utils');

const fs = require('fs');
const ROOT = process.cwd();

const GENDER_PRONOUN_MAP = {
  male: 'His',
  female: 'Her'
};

const GENDER_FIST_PERSON_MAP = {
  male: 'He',
  female: 'She'
};

function loadFeedbacksCb() {
  return new Promise((resolve, reject) => {
    recursive(`${ROOT}/server/feedback`).then(
      function(files) {
        //console.log('files are', files);
        files.forEach(file => {
          const splitFilePath = file.split('/');
          //console.log(splitFilePath, '########');

          const categoryName = splitFilePath[splitFilePath.length - 2]
            .toString()
            .replace(/-([a-z])/g, function(g) {
              return g[1].toUpperCase();
            });

          const tone = splitFilePath[splitFilePath.length - 1];
          const contents = fs.readFileSync(file, 'utf-8');
          feedback[categoryName] = {};
          feedback[categoryName][tone] = contents.split('\n');
        });

        resolve(feedback);
      },
      function(error) {
        console.error('something exploded', error);
        reject(error);
      }
    );
  });
}

function pickFeedbackFromList(name, gender) {
  const genderPronoun = GENDER_PRONOUN_MAP[gender.toLowerCase()];
  const genderFirstPerson = GENDER_FIST_PERSON_MAP[gender.toLowerCase()];
  const response = {};
  Object.keys(feedback).forEach(category => {
    let randomCount;
    if (feedback[category].positive.length > 8) {
      randomCount = 5;
    } else {
      randomCount = 3;
    }
    const randomFeedbackArr = pickRandom(
      feedback[category].positive,
      randomCount
    ).map(feedbackString => {
      return feedbackString
        .replace(/{NAME}/g, name)
        .replace(/{GENDER}/g, genderFirstPerson)
        .replace(/{GENDER_PRONOUN}/g, genderPronoun);
    });
    response[category] = randomFeedbackArr;
  });

  return response;
}

router.get('/feedback', (req, res) => {
  const start = new Date().getTime();
  if (!req.query.name || !req.query.gender) {
    return res.status(400).send({
      message: 'name and gender missing'
    });
  }
  const { name, gender } = req.query;
  const response = pickFeedbackFromList(name, gender);
  const end = new Date().getTime();
  console.log('Processed Request in ', end - start);
  res.send(response);
});

router.get('/', (req, res) => {
  res.send('Ok');
});

module.exports = {
  router,
  loadFeedbacksCb
};
