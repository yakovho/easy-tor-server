const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    try {
      jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
      next();
    }
    catch (error) {
      res.status(401).json('הטוקן שגוי');
    }
  }

  const checkAuthCustomers = (req, res, next) => {
    try {
      jwt.verify(req.cookies.token, process.env.TOKEN_KEY_CUSTOMERS);
      next();
    }
    catch (error) {
      res.status(401).json('הטוקן שגוי');
    }
  }
  
  //יוצר טוקן אקראי לכל עסק
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const createToken = () => {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

    //יוצר קוד לסמס
    const numberacters = '0123456789';
    const createTokenSms = () => {
      let result = '';
      const charactersLength = numberacters.length;
      for (let i = 0; i < 4; i++) {
        result += numberacters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

module.exports = { checkAuth: checkAuth, checkAuthCustomers: checkAuthCustomers, createToken: createToken, createTokenSms:createTokenSms};