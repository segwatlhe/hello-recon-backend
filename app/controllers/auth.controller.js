const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const CheckDetailsService = require("../services/dbRequests");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.addUser = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        surname: req.body.surname,
        password: bcrypt.hashSync(req.body.password, 8),
        status: 1,
        canReview: req.body.canReview === true ? 1 : 0
    })
        .then(user => {
            Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            }).then(roles => {
                user.setRoles(roles).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }).catch(err => {
                return res.status(500).send({ message: err.message });
            });
        })
        .catch(err => {
            return res.status(500).send({ message: err.message });
        });
};
exports.signin = async (req, res) => {
    const where = {
        username: req.body.username,
        status: 1
    };
    await CheckDetailsService.dbRequests.getUsers(where, 'one', res)
        .then(user => {
            if (!user) {
                return res.status(404).send({message: "User Not found."});
            }
            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }
            let authorities = [];
            user.getRoles().then(roles => {
                for (const element of roles) {
                    authorities.push("ROLE_" + element.name.toUpperCase());
                }
                const expires = authorities[0] === "ROLE_IMPORTER"? 31556952100 : 86400;
                const token = jwt.sign({id: user.id}, config.secret, {
                    expiresIn: expires
                });
                return res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
};
exports.activateUser = async (req, res) => {
    const userID = CheckDetailsService.dbRequests.getUserID(req);
    const status = req.body.status;
    if (userID === '') {
        return res.status(401).send({message: "Unauthorized."});
    }
    if (status !== 0 && status !== 1) {
        return res.status(401).send({message: "Unknown status."});
    }
    const where = {
        id: req.body.id
    };
    await CheckDetailsService.dbRequests.getUsers(where, 'one', res)
        .then(user => {
            if (!user) {
                return res.status(404).send({message: "User Not found."});
            }
            if (user.id === userID) {
                return res.status(403).send({message: "Current user cannot be activated/deactivated."});
            }
            User.update({
                status: status,
            }, {
                where: {id: user.id},
            });
            return res.status(200).send({message: "User activated/deactivated."});
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};
exports.removeUser = async(req, res) => {
    let err_msg = {};
    const userWhere =  {
        id: req.body.id
    };
    await CheckDetailsService.dbRequests.getUsers(userWhere, 'all').then(async user => {
        if (user) {
            await CheckDetailsService.dbRequests.getRole(req.body.id)
                .then(async current_role => {
                    if (current_role.name === 'Administrator') {
                        const query = 'SELECT COUNT(*) as `count` FROM user_roles WHERE roleId = ' + current_role.roleId;
                        await CheckDetailsService.dbRequests.customSelectQuery(query)
                            .then(count => {
                                if(count[0].count === 1) {
                                    err_msg["final_admin"] = "Cannot remove final administrator, there must always be one.";
                                }
                            }).catch(err => {
                                res.status(500).send({message: err.message});
                            });
                    }
                    if (req.user_id === req.body.id) {
                        err_msg["user"] = "Cannot delete yourself.";
                    }
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });
        }
    })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }
    User.destroy({
        where: {
            id: req.body.id
        }
    })
        .then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            if(rowDeleted === 1){
                res.status(200).send({ message: "User successfully deleted." });
            } else {
                res.status(403).send({ message: "Failed to delete: user does not exist." });
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    };
exports.refreshToken = (req, res) => {
    let bearer_token = req.headers["authorization"];
    let tokenArr = bearer_token.split(" ");
    let token = tokenArr[1];
    let refreshToken = '';
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        refreshToken = jwt.sign({id: decoded.id}, config.secret, {
            expiresIn: 86400
        });
    });
    res.status(200).send({ refreshToken: refreshToken });
};
exports.getUsers = async (req, res) => {
    const companyJoin = req.body.company_id ? 'LEFT JOIN linked_companies lc on lc.user_id = u.id' : '';
    const role = req.body.role && req.body.role !== 'all' ? " WHERE r.name='" + req.body.role + "'" : " WHERE r.name!='Importer'";
    const amount = req.body.amount && req.body.user_id && req.body.amount === 'one' ? ' AND u.id=' + req.body.user_id : '';
    const companyWhere = req.body.company_id ? ' AND lc.company_id = ' + req.body.company_id : '';
    const query = 'SELECT u.id, username, email, firstName, surname, status, canReview, r.name as `role`, r.id as `role_id`\n' +
        'FROM users u \n' +
        'LEFT JOIN user_roles ur on ur.userId = u.id\n' +
        'LEFT JOIN roles r on r.id = ur.roleId\n' +
        companyJoin + role + amount + companyWhere;
    await CheckDetailsService.dbRequests.customSelectQuery(query)
        .then(users => {
            res.status(200).send({users});
        }).catch(err => {
            res.status(400).send({message: err.message});
        });
};
exports.editUser = async (req, res) => {
    let err_msg = {};
    let userDetails = {};
    const userWhere = {
        id: req.body.user_id
    };
    await CheckDetailsService.dbRequests.getUsers(userWhere, 'one').then(user => {
        if (!user) {
            err_msg["user"] = "User not found.";
        } else {
            userDetails = user;
        }
    })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    if (req.body.password) {
        if (req.body.password.length > 40) {
            err_msg["user"] = "Password cannot be longer than 40 characters.";
        }
    }
    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }
    await User.update({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        surname: req.body.surname,
        password: req.body.password ? bcrypt.hashSync(req.body.password, 8) : userDetails.password,
        canReview: req.body.canReview === true ? 1 : 0
    }, {
        where: {id: req.body.user_id},
    })
        .then(user => {
            res.send({message: "User updated successfully"});
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};
exports.pickupReviews = async (req, res) => {
    let err_msg = {};
    await CheckDetailsService.dbRequests.getRole(req.user_id)
        .then(async current_role => {
            if (current_role.name === 'Administrator') {
                err_msg["user"] = "Administrators cannot review.";
            } else {
                const userWhere = {
                    id: req.user_id,
                    canReview: 1
                };
                await CheckDetailsService.dbRequests.getUsers(userWhere, 'one').then(user => {
                    if (user) {
                        return res.status(200).send({message: true});
                    } else {
                        return res.status(200).send({message: false});
                    }
                })
                    .catch(err => {
                        return res.status(500).send({message: err.message});
                    });
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });

    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }


};
