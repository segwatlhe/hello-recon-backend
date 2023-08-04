const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const verifyToken = (req, res, next) => {
    let auth_token = req.headers["authorization"];
    if (!auth_token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    let tokenArr = auth_token.split(" ");
    let token = tokenArr[1];
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.user_id = decoded.id;
        next();
    });
};
const isAdmin = (req, res, next) => {
    User.findByPk(req.user_id).then(user => {
        user.getRoles().then(roles => {
            for (const element of roles) {
                if (element.name === "Administrator") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Requires Admin Role!"
            });
        });
    });
};
const isImporterOrAdmin = (req, res, next) => {
    User.findByPk(req.user_id).then(user => {
        user.getRoles().then(roles => {
            for (const element of roles) {
                if (element.name === "Importer" || element.name === "Administrator") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Requires Importer or Admin Role!"
            });
        });
    });
};
const isUser = (req, res, next) => {
    User.findByPk(req.user_id).then(user => {
        user.getRoles().then(roles => {
            for (const element of roles) {
                if (element.name === "User") {
                    next();
                    return;
                }
            }
            res.status(403).send({
                message: "Requires Preparer Role!"
            });
        });
    });
};
const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isUser: isUser,
    isImporterOrAdmin: isImporterOrAdmin,
};
module.exports = authJwt;
