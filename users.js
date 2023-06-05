const { users, settings, phoneAuth, customers } = require('./models');
const { createToken, createTokenSms } = require('./tokens');
const jwt = require('jsonwebtoken');
const axios = require('axios');


const sendSMS = (sms) => {
  axios.post('https://sapi.itnewsletter.co.il/api/restApiSms/sendSmsToRecipients', {
    ApiKey: process.env.TOKEN_SMS,
    txtOriginator: "Easy-tor",
    "destinations": sms.phone,
    "txtSMSmessage": `קוד ההתחברות שלך הוא ${sms.code}`,
    "dteToDeliver": "",
    "txtAddInf": ""
  })
}

const signup = (req, res) => {
  //בודק אם המייל או הטלפון כבר קיימים במערכת
  users.find({
    "$or": [{ email: req.body.email }, { phone: req.body.phone }]
  })
    .then((data) => {
      if (data.length === 0) {
        const sms = { code: createTokenSms(), phone: req.body.phone };
        phoneAuth.insertMany({
          phone: req.body.phone,
          sms_token: sms.code,
        })
          .then(() => {
            sendSMS(sms)
            res.status(200).json('נשלח קוד לאימות');
          });
      }
      else { res.status(401).json('כתובת המייל/הטלפון כבר קיימים במערכת'); }
    })
};

const signupAuth = (req, res) => {
  //בודק אם המייל או הטלפון כבר קיימים במערכת
  users.find({
    "$or": [{ email: req.body.email }, { phone: req.body.phone }]
  })
    .then((data) => {
      if (data.length === 0) {
        //בודק את הקוד
        phoneAuth.find({
          phone: req.body.phone,
          sms_token: req.body.sms_token
        })
          .then((data) => {
            if (data.length == 0) {
              res.status(401).json('הקוד לא נכון');
            }
            else {
              users.insertMany({
                name: req.body.name,
                business_name: req.body.business_name,
                email: req.body.email,
                phone: req.body.phone,
                business_token: createToken()
              })
                .then((data) => {
                  const token = jwt.sign({ id: data[0]._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
                  res.header('Access-Control-Allow-Credentials', true);
                  res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
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
              //מוחק את הקוד סמס של הלקוח
              phoneAuth.deleteOne({ sms_token: req.body.sms_token })
                .then((data) => {
                  console.log(data);
                });
            }
          });
      }
      else { res.status(401).json('כתובת המייל/הטלפון כבר קיימים במערכת'); }
    })
};

const login = (req, res) => {
  users.find({
    phone: req.body.phone,
  })
    .then((users) => {
      if (users.length == 0) {
        res.status(401).json('המספר לא מופיע במערכת');
      }
      else {
        const sms = { code: createTokenSms(), phone: req.body.phone };
        phoneAuth.insertMany({
          phone: req.body.phone,
          sms_token: sms.code,
        })
          .then(() => {
            sendSMS(sms),
              res.status(200).json('נשלח קוד לאימות');
          });
      }
    }
    );
}

const loginAuth = (req, res) => {
  //בודק את הקוד
  phoneAuth.find({
    phone: req.body.phone,
    sms_token: req.body.sms_token
  })
    .then((data) => {
      if (data.length == 0) {
        res.status(401).json('הקוד לא נכון');
      }
      else {
        users.find({
          phone: req.body.phone,
        })
          .then((users) => {
            const token = jwt.sign({ id: users[0]._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
            res.header('Access-Control-Allow-Credentials', true);
            res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
            res.status(200).json('התחברת בהצלחה');
            //מוחק את הקוד סמס של הלקוח
            phoneAuth.deleteOne({ sms_token: req.body.sms_token })
              .then((data) => {
                console.log(data);
              });
          });
      }
    });
}

//כניסה חופשית לסביבת טסטים
const loginTest = (req, res) => {
  users.find({
    phone: '0509651818',
  })
    .then((users) => {
      if (users.length == 0) {
        res.status(401).json('לקוח טסטים לא קיים');
      }
      else {
        const token = jwt.sign({ id: users[0]._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
        res.header('Access-Control-Allow-Credentials', true);
        res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
        res.status(200).json('התחברת בהצלחה');
      }
    });
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
        phone: req.body.phone
      }
    })
    .then((users) => {
      console.log(users);
      res.send(`the user update`);
    }
    );
}

//חלק לקוחות העסק
const getUser = (req, res) => {
  users.find({
    business_token: req.params.token
  })
    .then(data => {
      res.send(data);
    });
};

const customerSignup = (req, res) => {
  //בודק אם הטלפון כבר קיים במערכת
  customers.find({ phone: req.body.phone, business_users_id: req.body.business_users_id })
    .then((data) => {
      if (data.length === 0) {
        const sms = { code: createTokenSms(), phone: req.body.phone };
        phoneAuth.insertMany({
          phone: req.body.phone,
          sms_token: sms.code,
        })
          .then(() => {
            sendSMS(sms)
            res.status(200).json('נשלח קוד לאימות');
          });
      }
      else { res.status(401).json('הטלפון כבר קיים במערכת'); }
    })
};

const customerSignupAuth = (req, res) => {
  //בודק אם הטלפון כבר קיים במערכת
  customers.find({ phone: req.body.phone, business_users_id: req.body.business_users_id })
    .then((data) => {
      if (data.length === 0) {
        //בודק את הקוד
        phoneAuth.find({
          phone: req.body.phone,
          sms_token: req.body.sms_token
        })
          .then((data) => {
            if (data.length == 0) {
              res.status(401).json('הקוד לא נכון');
            }
            else {
              customers.insertMany({
                business_users_id: req.body.business_users_id,
                name: req.body.name,
                phone: req.body.phone,
              })
                .then((data) => {
                  const token = jwt.sign({ id: data[0]._id }, process.env.TOKEN_KEY_CUSTOMERS, { expiresIn: '24h' });
                  res.header('Access-Control-Allow-Credentials', true);
                  res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
                  res.status(200).json(`הלקוח ${data[0].name} נוסף בהצלחה`);
                });
              //מוחק את הקוד סמס של הלקוח
              phoneAuth.deleteOne({ sms_token: req.body.sms_token })
                .then((data) => {
                  console.log(data);
                });
            }
          });
      }
      else { res.status(401).json('הטלפון כבר קיים במערכת'); }
    })
};

const customerLogin = (req, res) => {
  customers.find({ phone: req.body.phone, business_users_id: req.body.business_users_id })
    .then((users) => {
      if (users.length == 0) {
        res.status(401).json('המספר לא מופיע במערכת');
      }
      else {
        const sms = { code: createTokenSms(), phone: req.body.phone };
        phoneAuth.insertMany({
          phone: req.body.phone,
          sms_token: sms.code,
        })
          .then(() => {
            sendSMS(sms),
              res.status(200).json('נשלח קוד לאימות');
          });
      }
    }
    );
}

const customerLoginAuth = (req, res) => {
  //בודק את הקוד
  phoneAuth.find({
    phone: req.body.phone,
    sms_token: req.body.sms_token
  })
    .then((data) => {
      if (data.length == 0) {
        res.status(401).json('הקוד לא נכון');
      }
      else {
        customers.find({ phone: req.body.phone, business_users_id: req.body.business_users_id })
          .then((users) => {
            const token = jwt.sign({ id: users[0]._id }, process.env.TOKEN_KEY_CUSTOMERS, { expiresIn: '24h' });
            res.header('Access-Control-Allow-Credentials', true);
            res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
            res.status(200).json('התחברת בהצלחה');
            //מוחק את הקוד סמס של הלקוח
            phoneAuth.deleteOne({ sms_token: req.body.sms_token })
              .then((data) => {
                console.log(data);
              });
          });
      }
    });
}



module.exports = {
  signup: signup, signupAuth: signupAuth, login: login, loginAuth: loginAuth,
  loginTest: loginTest, user: user, updateUser: updateUser, getUser: getUser,
  customerSignup: customerSignup, customerSignupAuth: customerSignupAuth,
  customerLogin: customerLogin, customerLoginAuth: customerLoginAuth
};