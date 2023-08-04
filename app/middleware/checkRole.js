const db = require("../models");
const ROLES = db.ROLES;
const checkDetailsService = require("../services/dbRequests");
const checkUserManagement = async (req, res, next) => {
    // Username
    const where = {
        $or: [
            {
                username: req.body.username
            },
            {
                email: req.body.email
            }
        ]
    };
    await checkDetailsService.dbRequests.getUsers(where, 'one', res)
    .then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! User credentials are already in use!"
            });
            return;
        }
        next();
    });
};
const checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (const element of req.body.roles) {
            if (!ROLES.includes(element)) {
                res.status(400).send({
                    message: "Failed! Role does not exist = " + req.body.roles[i]
                });
                return;
            }
        }
    }

    next();
};
const checkRole = {
    checkRolesExisted: checkRolesExisted,
    checkUserManagement: checkUserManagement
};
module.exports = checkRole;
