const { events, services } = require('./models');
const jwt = require('jsonwebtoken');

const service = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    services.find({
        business_users_id: decoded.id,
    })
        .then(data => {
            res.send(data);
        });
}

const createServices = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    services.insertMany({
        business_users_id: decoded.id,
        name: req.body.name,
        tyme: req.body.tyme,
        price: req.body.price
    })
        .then(() => {
            res.send("service insert");
        });
}

const updateServices = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    services.findOneAndUpdate({ _id: req.body.id },
        {
            "$set": {
                name: req.body.name,
                tyme: req.body.tyme,
                price: req.body.price,
            }
        })
        .then((users) => {
            console.log(users);
            res.send(`the service update`);
        }
        );
}

const deleteServices = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    services.deleteOne({ _id: req.body.id })
        .then(() => {
            events.deleteMany({ service_id: req.body.id })
                .then(() => {
                    res.send(`the service delete`);
                });
        });
}

const getServies = (req, res) => {
    services.find({
        business_users_id: req.body.business_users_id,
    })
        .then(data => {
            res.send(data);
        });
}

module.exports = {
    service: service, createServices: createServices,
    updateServices: updateServices, deleteServices: deleteServices, getServies:getServies
};