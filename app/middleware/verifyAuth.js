const db = require("../models");
const ROLES = db.ROLES;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    const CheckDetailsService = require("../services/dbRequests");
    await CheckDetailsService.dbRequests.getRole(req.user_id)
        .then(async current_role => {
            req.current_user_role = current_role.name;
        });

    if(req.current_user_role === 'Administrator' && req.url === '/api/auth/edit-user') {
        if(req.body.username) {
            await CheckDetailsService.dbRequests.checkExistingUser(req.body.email,req.body.username,req.body.user_id)
                .then(editUserResponse => {
                if (editUserResponse.code !== 200) {
                    return res.status(editUserResponse.code).send({
                        message: editUserResponse.message
                    });
                } else {
                    next();
                }
            })
                .catch(err => {
                    return res.status(500).send({message: "Internal server error"});
                });
        } else {
            next();
        }
    } else if(req.current_user_role === 'Administrator') {
        // Username
        await CheckDetailsService.dbRequests.checkExistingUser(req.body.email,req.body.username)
            .then(addUserResponse => {
                if (addUserResponse.code !== 200) {
                    return res.status(addUserResponse.code).send({
                        message: addUserResponse.message
                    });
                } else {
                    next();
                }
            })
            .catch(err => {
                return res.status(500).send({message: "Internal server error"});
            });
    } else {
        next();
    }
};
const checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (const element of req.body.roles) {
            if (!ROLES.includes(element)) {
                res.status(400).send({
                    message: "Failed! Role does not exist = " + element
                });
                return;
            }
        }
    }

    next();
};
const editUser = (req, res, next) => {

    let err_msg = {};
    if (!req.body.user_id) {
        err_msg["id"] = "User id is required"
    }
    if (req.body.username && req.body.username === '') {
        err_msg["username"] = "Username is required";
    }
    if (req.body.email) {
        if (req.body.email === '') {
            err_msg["email"] = "Email is required";
        } else if(validateEmail(req.body.email) === false) {
            err_msg["emailInvalid"] = "Invalid email provided"
        }
    }
    if (!req.body.firstName) {
        err_msg["firstName"] = "FirstName is required"
    }
    if (!req.body.surname) {
        err_msg["surname"] = "Surname is required"
    }
    if (req.body.password) {
        if (req.body.password === '') {
            err_msg["password"] = "Password cannot be blank"
        }
        const validation = checkPassword(req.body.password);
        if (validation !== null) {
            err_msg["validation"] = validation;
        }
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const removeUser = (req, res, next) => {
    let err_msg = {};
    if (!req.body.id) {
        err_msg["id"] = "User id is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const addUser = (req, res, next) => {
    let err_msg = {};
    if (!req.body.username) {
        err_msg["username"] = "Username is required"
    }
    if (!req.body.email) {
        err_msg["email"] = "Email is required"
    }
    if (!req.body.firstName) {
        err_msg["firstName"] = "FirstName is required"
    }
    if (!req.body.surname) {
        err_msg["surname"] = "Surname is required"
    }
    if (!req.body.password) {
        err_msg["password"] = "Password cannot be blank";
    }
    if(req.body.email && validateEmail(req.body.email) === false) {
        err_msg["emailInvalid"] = "Invalid email provided"
    }
    if (req.body.password) {
        const validation = checkPassword(req.body.password);
        if (validation !== null) {
            err_msg["validation"] = validation;
        }
        if (req.body.password.length > 40) {
            err_msg["length"] = "Password cannot be longer than 40 characters.";
        }
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
function checkPassword(password) {
    let response = null;
    const passwordReg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#\$%\^&\*])(?=.{8,})";
    const strongRegex = new RegExp(passwordReg);
    if(!strongRegex.test(password)) {
        response = "Password must contain at least:<br/> 1 lowercase alphabetical character,<br/> 1 uppercase alphabetical character,<br/> 1 numeric character,<br/>1 special character,<br/> Be eight characters or longer";
    }
    return response;
}
function validateEmail(email)
{
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return !!email.match(mailFormat);
}

const verifyAuth = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
    checkRolesExisted: checkRolesExisted,
    editUser:editUser,
    addUser:addUser,
    removeUser:removeUser
};
module.exports = verifyAuth;
