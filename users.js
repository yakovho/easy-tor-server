const { users, settings } = require('./models');
const { createToken } = require('./tokens');
const jwt = require('jsonwebtoken');

const signup = (req, res) => {
  //בודק אם כתובת המייל כבר קיימת
  users.find({
    email: req.body.email,
  })
    .then((data) => {
      if (data.length === 0) {
        users.insertMany({
          name: req.body.name,
          business_name: req.body.business_name,
          email: req.body.email,
          password: req.body.password,
          business_token: createToken()
        })
          .then((data) => {
            const token = jwt.sign({ id: data[0]._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
            res.header('Access-Control-Allow-Credentials', true);
            res.cookie("token", token, { sameSite: 'none', secure: true });
            res.status(200).json(`הלקוח ${data[0].name} נוסף בהצלחה`);
            //מקים ללקוח הגדרות עבודה ברירת מחדל
            settings.insertMany({
              business_users_id: data[0]._id.toString(),
              weekly: [{ start: 480, end: 1020 },
              { start: 480, end: 1020 },
              { start: 480, end: 1020 },
              { start: 480, end: 1020 },
              { start: 480, end: 1020 },
              { start: -1, end: -1 },
              { start: -1, end: -1 }]
            })
          });
      }
      else { res.status(401).json('כתובת המייל כבר קיימת במערכת'); }
    })
};

const login = (req, res) => {
  users.find({
    email: req.body.email,
    password: req.body.password
  })
    .then((users) => {
      if (users.length == 0) {
        res.status(401).json('שם משתמש או סיסמה שגויים');
      }
      else {
        const token = jwt.sign({ id: users[0]._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
        res.header('Access-Control-Allow-Credentials', true);
        res.cookie("token", token, { sameSite: 'none', secure: true });
        res.status(200).json('התחברת בהצלחה');
      }
    }
    );
}

const user = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  users.find({
    _id: decoded.id
  })
    .then(data => {
      res.send(data);
    });
};

const updateUser = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  users.findOneAndUpdate({ _id: decoded.id },
    {
      "$set": {
        name: req.body.name,
        business_name: req.body.business_name,
        email: req.body.email,
        password: req.body.password
      }
    })
    .then((users) => {
      console.log(users);
      res.send(`the user update`);
    }
    );
}
module.exports = { signup: signup, login: login, user: user, updateUser: updateUser };