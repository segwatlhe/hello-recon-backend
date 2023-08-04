const express = require("express");
if(process.env.NODE_ENV) {
    require('dotenv').config({path: './environments/' + process.env.NODE_ENV + '/.env'});
} else {
    require('dotenv').config({path: './environments/.env'});
}
const cors = require("cors");
const app = express();
const fileUpload = require('express-fileupload');

let corsOptions = {
    origin: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({}));

app.use(function(req, res, next) {
    const origin = req.header('Origin');
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Recon application." });
});
// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/accounts.routes')(app);
require('./app/routes/company.routes')(app);
require('./app/routes/capture.routes')(app);
const db = require("./app/models");
db.sequelize.sync();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
