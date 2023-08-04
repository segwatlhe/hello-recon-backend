const authJwt = require("./authJwt");
const verifyAuth = require("./verifyAuth");
const verifyAccounts = require("./verifyAccounts");
const verifyCapture = require("./verifyCapture");
const verifyCompany = require("./verifyCompany");

module.exports = {
    authJwt,
    verifyAuth,
    verifyAccounts,
    verifyCapture,
    verifyCompany
};
