const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const Accounts = db.accounts;
const Company = db.companies;
const Users = db.user;
const LinkedAccount = db.linkedAccounts;
const LinkedCompanies = db.linkedCompanies;
const Captures = db.captures;
const CaptureLogs = db.captureLogs;
const Workpaper = db.workpaper;
const User = db.user;
const PpiMapping = db.ppiMapping;
const { QueryTypes } = require('sequelize');
let returnMessage;

function getUserID(req) {
    let bearer_token = req.headers["authorization"];
    let tokenArr = bearer_token.split(" ");
    let token = tokenArr[1];
    let userId = null;
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return false;
        }
        userId = decoded.id;
    });
    return userId
}

async function getRole(user_id) {
    const User = db.user;
    let roleObj = {};
    let userObj = {};

    await User.findOne({
        where: {
            id: user_id,
            status: 1
        }
    }).then(user => {
        if (!user) {
            return {400: "User does not exist"}
        } else {
            userObj = user;
        }
    });
    const sqlQuery = "SELECT r.id as `roleId`, ur.userId, `name` \n" +
        "FROM roles r\n" +
        "INNER JOIN user_roles ur ON ur.roleId = r.id \n" +
        "WHERE ur.userId = " + userObj.id;
    await db.sequelize.query(sqlQuery, { type: QueryTypes.SELECT
    })
        .then(role => {
            roleObj["id"] = role[0].userId;
            roleObj["name"] = role[0].name;
            roleObj["roleId"] = role[0].roleId;
        }).catch(err => {
            return {500: err.message };
        });
    return roleObj;
}

async function getCompanies(where, amount, res) {
    if (amount === 'all') {
        await Company.findAll({
            where: where
        }).then(companies => {
            returnMessage = companies;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await Company.findOne({
            where: where
        }).then(companies => {
            returnMessage = companies;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getAccounts(where, amount, res) {
    if (amount === 'all') {
        await Accounts.findAll({
            where: where
        }).then(accounts => {
            returnMessage = accounts;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await Accounts.findOne({
            where: where
        }).then(account => {
            returnMessage = account;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getUsers(where, amount, res) {
    if (amount === 'all') {
        await Users.findAll({
            where: where
        }).then(users => {
            returnMessage = users;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await Users.findOne({
            where: where
        }).then(user => {
            returnMessage = user;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getLinkedAccounts(where, amount, res) {
    if (amount === 'all') {
        await LinkedAccount.findAll({
            where: where
        }).then(linkedAccounts => {
            returnMessage = linkedAccounts;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await LinkedAccount.findOne({
            where: where
        }).then(linkedAccounts => {
            returnMessage = linkedAccounts;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getLinkedCompanies(where, amount, res) {
    if (amount === 'all') {
        await LinkedCompanies.findAll({
            where: where
        }).then(linkedCompanies => {
            returnMessage = linkedCompanies;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await LinkedCompanies.findOne({
            where: where
        }).then(linkedCompany => {
            returnMessage = linkedCompany;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getCaptures(where, amount, res) {
    if (amount === 'all') {
        await Captures.findAll({
            where: where
        }).then(captures => {
            returnMessage = captures;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    } else {
        await Captures.findOne({
            where: where
        }).then(capture => {
            returnMessage = capture;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
    }
    return returnMessage;
}

async function getLogs(where, res) {
    await CaptureLogs.findAll({
        where: where
    }).then(logs => {
        returnMessage = logs;
    }).catch(err => {
        return res.status(500).send({message: err.message});
    });
    return returnMessage;
}

async function getWorkpaper(where, res) {
    await Workpaper.findOne({
        where: where
    }).then(workpaper => {
        returnMessage = workpaper;
    }).catch(err => {
        return res.status(500).send({message: err.message});
    });
    return returnMessage;
}

async function customSelectQuery(query, res) {
    await db.sequelize.query(query, { type: QueryTypes.SELECT
    })
        .then(response => {
            returnMessage = response;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });

    return returnMessage;
}
async function checkExistingUser(email, username, userId=null) {
    const Op = db.Sequelize.Op;
    let usernameWhere = {};
    let emailWhere = {};
    let responseCode = 200;
    let responseMessage = '';

    if (userId !== null) {
        usernameWhere = {
            username: username,
            id: {
                [Op.ne]: userId
            }
        };
        emailWhere = {
            email: email,
            id: {
                [Op.ne]: userId
            }
        };
    } else {
        usernameWhere = {
            username: username
        };
        emailWhere = {
            email: email
        };
    }

    await User.findOne({
        where: usernameWhere
    }).then(async user => {
        if (user) {
            responseCode = 400;
            responseMessage = "Username is already in use!";
        } else {
            // Email
            await User.findOne({
                where: emailWhere
            }).then(userEmail => {
                if (userEmail) {
                    responseCode = 400;
                    responseMessage = "Email is already in use!";
                }
            });
        }
    });
    return {code: responseCode, message: responseMessage};
}

async function customDeleteQuery(query, res) {
    await db.sequelize.query(query, { type: QueryTypes.DELETE
    })
        .then(response => {
            returnMessage = response;
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });

    return returnMessage;
}


const dbRequests = {
    getUserID: getUserID,
    getRole: getRole,
    getCompanies: getCompanies,
    getUsers: getUsers,
    getAccounts: getAccounts,
    getLinkedAccounts: getLinkedAccounts,
    getCaptures: getCaptures,
    getLinkedCompanies: getLinkedCompanies,
    getLogs: getLogs,
    getWorkpaper: getWorkpaper,
    customSelectQuery: customSelectQuery,
    checkExistingUser: checkExistingUser,
    customDeleteQuery: customDeleteQuery
};
module.exports = {dbRequests};


//Find user
//find company
//Find account
