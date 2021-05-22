const express = require('express');
const session = require('express-session');
const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = express();

const SERVER_PORT = 3001;
const SWAPI_URL = 'https://swapi.dev/api/people/';

const accessGrantedList = [
  '$2a$10$RJNlrbVZ9KumAp0z1CVP/OsD/OweAsoUA50C.Ws7DjDQalH3Tjz4K',
  '$2a$10$AtshmUR.lEK6FAkTFDSrHefGSxPtKrhvP/18ft4Fv6OsWKP3rSKs2',
  '$2a$10$9QGmoNht7RBY4C8fl3I6heNKrSf4DH9IpU.iRBtLXOia9nFJMHsvC',
  '$2a$10$2mTVe4nDp4t5kQSZlJjqMeQoLTMyfxeniDIx6rDFeBevw4xLTxS9u',
  '$2a$10$IK8L0pUE0o7vpdJmcF9G1ehXHRAJ2ke4DZ7jxUc.Tl2v2vn1XuDnq',
  '$2a$10$SjGuEXNzqfYwkwkynz5TrODJXTlvGto7BRvZ4mILIz2M.o/xKbH52',
];

app.use(
  express.json(),
  session({
    resave: false,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: {
      maxAge: 999999999,
    },
  }),
);

function checkIfAuthorized(req, res, next) {
  if (req.session.isAuthorized) {
    next();
  } else {
    res
      .status(404)
      .send('this is no moon, and you arent who you say you are! rebel scum!!');
  }
}

app.post('/api/auth', (req, res) => {
  const { code } = req.body;
  let isAuthorized = false;
  accessGrantedList.forEach((hash) => {
    if (bcrypt.compareSync(code, hash)) {
      isAuthorized = true;
    }
  });

  req.session.isAuthorized = isAuthorized;
  res.send('ok');
});

app.get('/api/nextBounty', checkIfAuthorized, async (req, res) => {
  const randomNumber = Math.ceil(Math.random() * 50);
  const { data } = await axios.get(SWAPI_URL + randomNumber + '/');
  const homeworld = await axios
    .get(data.homeworld)
    .then((res) => res.data.name);
  const { name, mass, height, gender, birth_year, films } = data;

  const reward = films.length * 5000;

  const bounty = {
    name,
    height,
    mass,
    gender,
    birth_year,
    reward,
    lastSeen: homeworld,
  };

  res
    .status(200)
    .send({ message: 'hello hunter, here is your next target.', bounty });
});

app.listen(SERVER_PORT, () => {
  console.log(`server is up and running on ${SERVER_PORT}`);
});
