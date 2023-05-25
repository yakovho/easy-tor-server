const express = require('express')
const http = require('http')
const PORT = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
require('dotenv').config()
const mongoose = require('mongoose');
const { signup, signupAuth, login, loginAuth, loginTest, user, updateUser, getUser,
  customerSignup, customerSignupAuth, customerLogin, customerLoginAuth } = require('./users');
const { setting, updateSettings, getSettings } = require('./setting');
const { event, createEvents, deleteEvents, getEvents } = require('./event');
const { service, createServices, updateServices, deleteServices, getServies } = require('./service');
const { customer, createCustomer, updateCustomer, deleteCustomer } = require('./customer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { checkAuth } = require('./tokens');

app.use(cors({
  credentials: true,
  origin: true,
  methods: ['GET', 'PUT', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  maxAge: 600,
  exposedHeaders: ['*', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*
במידה ואני רוצה להגיש את הצד לקוח דרך השרת
const path = require("path");
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});
*/

mongoose.connect(`mongodb+srv://yakov:${process.env.PASSWORD}@easy-tor.njghjtw.mongodb.net/easyTor?retryWrites=true&w=majority`)
  .then(() => {
    console.log('Connected!')
  });

app.post('/signup', signup);

app.post('/signup_auth', signupAuth);

app.post('/login', login);

app.post('/login_auth', loginAuth);

app.post('/login_test', loginTest);

app.get('/user', checkAuth, user);

app.post('/updateUser', checkAuth, updateUser);

app.get('/settings', checkAuth, setting);

app.post('/updateSettings', checkAuth, updateSettings);

app.post('/events', checkAuth, event);

app.post('/createEvents', checkAuth, createEvents);

app.post('/deleteEvents', checkAuth, deleteEvents);

app.get('/services', checkAuth, service);

app.post('/createServices', checkAuth, createServices);

app.post('/updateServices', checkAuth, updateServices);

app.post('/deleteServices', checkAuth, deleteServices);

app.get('/customers', checkAuth, customer);

app.post('/createCustomer', checkAuth, createCustomer);

app.post('/updateCustomer', checkAuth, updateCustomer);

app.post('/deleteCustomer', checkAuth, deleteCustomer);

//חלק לקוחות העסק
app.get('/getUser/:token', getUser);

app.post('/getSettings', getSettings);

app.post('/getServies', getServies);

app.post('/getEvents', getEvents);

app.post('/customerSignup', customerSignup);

app.post('/customerSignupAuth', customerSignupAuth);

app.post('/customerLogin', customerLogin);

app.post('/customerLoginAuth', customerLoginAuth);


server.listen(PORT, err => {
  if (err) console.log(err)
  console.log('Server running on Port ', PORT)
})
