const mongoose = require('mongoose');
const { settings, events } = require('./models');
const jwt = require('jsonwebtoken');

const event = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  events.aggregate([
    { "$match": { business_users_id: decoded.id, "date": req.body.date } },
    { $sort: { "start": 1 } },
    {
      $addFields: {
        "serviceId": { "$toObjectId": "$service_id" }, "customerId": { "$toObjectId": "$customer_id" },
        "userid": { "$toObjectId": "$business_users_id" }
      }
    },
    { $lookup: { from: "business_services", localField: "serviceId", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "service.customer", } },
  ])
    .then(data => {
      res.send(data);
    });
}

const createPause = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  events.insertMany({
    business_users_id: decoded.id,
    customer_id: new mongoose.Types.ObjectId,
    type: 0,
    service_id: new mongoose.Types.ObjectId,
    date: req.body.date,
    start: req.body.start,
    end: req.body.end
  })
    .then(() => {
      res.send("pause insert");
    });
}

const createEvents = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
  events.insertMany({
    business_users_id: decoded.id,
    customer_id: req.body.customer_id,
    type: 1,
    service_id: req.body.service_id,
    date: req.body.date,
    start: req.body.start,
    end: req.body.end
  })
    .then(() => {
      res.send("event insert");
    });
}

const deleteEvents = (req, res) => {
  events.deleteOne({ _id: req.body.id })
    .then(() => {
      res.send("event delete");
    });
}

const getEvents = (req, res) => {
  events.aggregate([
    { "$match": { business_users_id: req.body.business_users_id, "date": req.body.date } },
    { $sort: { "start": 1 } },
    {
      $addFields: {
        "serviceId": { "$toObjectId": "$service_id" }, "customerId": { "$toObjectId": "$customer_id" },
        "userid": { "$toObjectId": "$business_users_id" }
      }
    },
    { $lookup: { from: "business_services", localField: "serviceId", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "service.customer", } },
  ])
    .then(data => {
      res.send(data);
    });
}

const customerCreateEvent = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY_CUSTOMERS);
  events.insertMany({
    business_users_id: req.body.business_users_id,
    customer_id: decoded.id,
    type: 1,
    service_id: req.body.service_id,
    date: req.body.date,
    start: req.body.start,
    end: req.body.end
  })
    .then(() => {
      res.send("event insert");
    });
}

const getBookings = (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY_CUSTOMERS);
  events.aggregate([
    { "$match": { customer_id: decoded.id } },
    { $sort: { "start": 1 } },
    {
      $addFields: {
        "serviceId": { "$toObjectId": "$service_id" },
        "userid": { "$toObjectId": "$business_users_id" }
      }
    },
    { $lookup: { from: "business_services", localField: "serviceId", foreignField: "_id", as: "service" } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
  ])
    .then(data => {
      res.send(data);
    });
}

const customerDeleteEvent = (req, res) => {
  events.deleteOne({ _id: req.body.id })
    .then(() => {
      res.send("event insert");
    });
}

module.exports = {
  event: event, createEvents: createEvents, createPause:createPause, deleteEvents: deleteEvents, getEvents,
  customerCreateEvent: customerCreateEvent, getBookings: getBookings, customerDeleteEvent: customerDeleteEvent
};