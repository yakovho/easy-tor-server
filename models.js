const mongoose = require('mongoose');

const users = mongoose.Schema({
    name: String,
    business_name: String,
    email: String,
    phone: String,
    business_token: String
});

const phoneAuth = mongoose.Schema({
    phone: String,
    sms_token: String,
});

const settings = mongoose.Schema({
    business_users_id: Object,
    weekly: [{ start: Number, end: Number },
    { start: Number, end: Number },
    { start: Number, end: Number },
    { start: Number, end: Number },
    { start: Number, end: Number },
    { start: Number, end: Number },
    { start: Number, end: Number }]
});

const events = mongoose.Schema({
    business_users_id: Object,
    customer_id: Object,
    type: Number,
    service_id: Object,
    date: String,
    start: Number,
    end: Number,
});

const services = mongoose.Schema({
    business_users_id: Object,
    name: String,
    time: Number,
    price: Number
});

const customers = mongoose.Schema({
    business_users_id: Object,
    name: String,
    phone: String,
    email: String,
    password: String
});

const usersSchema = mongoose.model('business_users', users);
const phoneAuthSchema = mongoose.model('phone_auths', phoneAuth);
const settingsSchema = mongoose.model('business_settings', settings);
const eventsSchema = mongoose.model('business_events', events);
const servicesSchema = mongoose.model('business_services', services);
const customersSchema = mongoose.model('customers', customers);

module.exports = {
    users: usersSchema, phoneAuth: phoneAuthSchema, settings: settingsSchema,
    events: eventsSchema, services: servicesSchema, customers: customersSchema
};