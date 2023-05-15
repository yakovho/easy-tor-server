const { settings } = require('./models');
const jwt = require('jsonwebtoken');

const setting = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    settings.find({
        business_users_id: decoded.id,
    })
        .then(data => {
            res.send(data);
        });
};

const updateSettings = (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.TOKEN_KEY);
    settings.findOneAndUpdate({ business_users_id: decoded.id },
        {
            "$set": {
                weekly: req.body.weekly
            }
        }
    )
        .then(data => {
            console.log(data);
            res.send("settings");
        });
};

const getSettings = (req, res) => {
    settings.find({
        business_users_id: req.body.business_users_id,
    })
        .then(data => {
            res.send(data);
        });
};

module.exports = { setting: setting, updateSettings: updateSettings, getSettings };