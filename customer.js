const { events, customers } = require('./models');
const jwt = require('jsonwebtoken');

const customer = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    customers.find({
        business_users_id: decoded.id,
    })
        .then(data => {
            res.send(data);
        });
}

const createCustomer = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    customers.insertMany({
        business_users_id: decoded.id,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    })
        .then(() => {
            res.send("customer insert");
        });
}

const updateCustomer = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    customers.findOneAndUpdate({ _id: req.body.id },
        {
            "$set": {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                password: req.body.password
            }
        })
        .then((users) => {
            console.log(users);
            res.send(`the customer update`);
        }
        );
}

const deleteCustomer = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    customers.deleteOne({ _id: req.body.id })
        .then(() => {
            events.deleteMany({ customer_id: req.body.id })
                .then(() => {
                    res.send(`the customer delete`);
                });
        });
}

module.exports = {
    customer: customer, createCustomer: createCustomer, updateCustomer: updateCustomer, deleteCustomer: deleteCustomer
};