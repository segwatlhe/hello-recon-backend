const logger = require("../services/logAction");
const checkDetails = require("../services/dbRequests");
const db = require("../models");
const Captures = db.captures;
const Workpaper = db.workpaper;
const Accounts = db.accounts;
const LinkedAccounts = db.linkedAccounts;
const axios = require('axios');
const FormData = require('form-data');
const mime = require('mime-types');

exports.captureWorkpaper = (req, res) => {
    captureWorkpaper(req, res);
};
exports.updateCapture = (req, res) => {
    updateCapture(req, res);
};
exports.assignCapture = (req, res) => {
    assignCapture(req, res);
};

exports.fetchWorkpaper = (req, res) => {
    fetchWorkpaper(req, res);
};

exports.fetchFile = (req, res) => {
    fetchFile(req, res);
};

exports.bulkCertify = (req, res) => {
    bulkCertify(req, res);
};

exports.bulkReview = (req, res) => {
    bulkReview(req, res);
};
exports.workFlowReset = (req, res) => {
    workFlowReset(req, res);
}


exports.getReviewActions = (req, res) => {
    getReviewActions(req, res);
};

async function captureWorkpaper(req, res) {
    let err_msg = {};
    let balance = null;
    const where = {
        id: req.user_id,
        status: 1
    };
    await checkDetails.dbRequests.getUsers(where, 'one', res)
        .then(user => {
            if (!user) {
                err_msg["user"] = "User not found.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    const companyWhere = {
        id: req.body.company_id,
        active: 1
    };

    await checkDetails.dbRequests.getCompanies(companyWhere, 'one', res)
        .then(company => {
            if (!company) {
                err_msg["company"] = "Company not found.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    const userWhere = {
        account_id: req.body.account_id,
        year: req.body.year,
        month: req.body.month
    };
    await checkDetails.dbRequests.getAccounts(userWhere, 'one', res)
        .then(account => {
            if (!account) {
                err_msg["account"] = "Account not found.";
            } else {
                balance = account.balance;
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    const duplicateCaptureWhere = {
        account_id: req.body.account_id,
        year: req.body.year,
        month: req.body.month
    };
    await checkDetails.dbRequests.getCaptures(duplicateCaptureWhere, 'one', res)
        .then(duplicateCapture => {
            if (duplicateCapture) {
                err_msg["capture"] = "Capture for this account has already been created.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    if (Object.keys(err_msg).length) {
        return res.status(400).send({
            message: err_msg
        });
    }

    Captures.create({
        account_id: req.body.account_id,
        description: req.body.description,
        allocated_preparer: req.body.allocated_preparer,
        allocated_reviewer: req.body.allocated_reviewer,
        balance: balance,
        month: req.body.month,
        year: req.body.year,
        status: 1,
    })
        .then(capture => {

            logger.logAction(req.body.account_id, req.user_id, capture.id, 'Capture created', 'Capture created', null, balance, req.body.month, req.body.year, req.body.company_id);
            return res.status(200).send({message: capture.id});

        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

}

async function updateCapture(req, res) {
    let err_msg = {};
    let captureDetails = {};
    let currentAccount = {};
    let currentWorkpaperID = null;
    let currentWorkpaperStatus = 0;
    let user_name = '';
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let current_role = '';
    let action = req.body.action ? req.body.action : 'Update capture';
    let responseMessage = 'Update successful';
    let responseCode = 200;
    let logDesc = req.body.description;

    const where = {
        id: req.user_id,
        status: 1
    };

    await checkDetails.dbRequests.getUsers(where, 'one', res)
        .then(user => {
            if (!user) {
                err_msg["user"] = "User not found.";
            } else {
                let authorities = [];
                user.getRoles().then(roles => {
                    for (const element of roles) {
                        authorities.push("ROLE_" + element.name.toUpperCase());
                    }
                    current_role = authorities[0];
                });
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    const captureWhere = {
        id: req.body.capture_id
    };
    await checkDetails.dbRequests.getCaptures(captureWhere, 'one', res)
        .then(capture => {
            if (!capture) {
                err_msg["capture"] = "Capture not found.";
            } else {
                captureDetails = capture;
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    if (Object.keys(captureDetails).length) {
        const accountWhere = {
            account_id: captureDetails.account_id,
            month: captureDetails.month,
            year: captureDetails.year,
        };
        await checkDetails.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(account => {
                if (!account) {
                    err_msg["account"] = "Account not found.";
                } else {
                    currentAccount = account;
                    accountName = account.account_name;
                    accountCurrency = account.currency;
                    accountBalance = account.balance;
                    accountYear = account.year;
                    accountMonth = account.month;
                }
            })
            .catch(err => {
                return res.status(500).send({message: err.message});
            });
        if (captureDetails.status === 2 && parseInt(req.body.status) !== 2 && parseInt(req.user_id) !== parseInt(captureDetails.allocated_preparer) && captureDetails.allocated_preparer !== null) {
            err_msg["permissions1"] = "User not authorized for action";
        }
        if (captureDetails.status === 2 && parseInt(req.body.status) !== 2 && parseInt(req.user_id) === parseInt(captureDetails.allocated_reviewer)) {
            err_msg["permissions2"] = "User not authorized for action";
        }
        if (captureDetails.status === 3 && parseInt(req.body.status) !== 3 && parseInt(req.user_id) !== parseInt(captureDetails.allocated_reviewer) && captureDetails.allocated_reviewer !== null) {
            err_msg["permissions3"] = "User not authorized for action";
        }
        if (captureDetails.status === 3 && parseInt(req.body.status) !== 3 && parseInt(req.user_id) === parseInt(captureDetails.allocated_preparer)) {
            err_msg["permissions4"] = "User not authorized for action";
        }
    }

    if (req.files && parseInt(captureDetails.status) > 2) {
        err_msg["workpaper"] = "Cannot load another workpaper while another is pending approval or Approved";
    }
    if (Object.keys(err_msg).length) {
        return res.status(400).send({
            message: err_msg
        });
    }

    const workpaperWhere = {
        linked_capture: captureDetails.id,
        linked_account: captureDetails.account_id,
        status: 1
    };
    await checkDetails.dbRequests.getWorkpaper(workpaperWhere, 'one', res)
        .then(workpaper => {
            if (workpaper) {
                currentWorkpaperID = workpaper.s3_id;
                currentWorkpaperStatus = workpaper.status;
            }
        })

        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    if (action === 'Submit Capture') {
        Workpaper.update({
            status: 0
        }, {
            where: {
                s3_id: currentWorkpaperID
            }
        });
        currentWorkpaperStatus = 0;
    }


    if (action === 'Reject capture') {
        Workpaper.update({
            status: 0
        }, {
            where: {
                s3_id: currentWorkpaperID
            }
        });
        currentWorkpaperStatus = 0;
    }

    let accountsNewDetails = {
        description: req.body.description,
        status: req.body.status
    };


    let captureNewDetails = {
        description: req.body.description,
        status: req.body.status
    };
    let role = '';


    if (captureDetails.status === 1 && current_role !== 'ROLE_ADMINISTRATOR') {
        if (captureDetails.allocated_preparer === null) {
            captureNewDetails['allocated_preparer'] = req.user_id;
        }
        role = 'preparer';
    }
    if (captureDetails.status === 2 && current_role !== 'ROLE_ADMINISTRATOR') {
        if (captureDetails.allocated_preparer === null) {
            captureNewDetails['allocated_preparer'] = req.user_id;
        }
        role = 'preparer';
    }

    if (captureDetails.status === 3 && captureDetails.allocated_reviewer === null && current_role !== 'ROLE_ADMINISTRATOR') {
        if (captureDetails.allocated_reviewer === null) {
            captureNewDetails['allocated_reviewer'] = req.user_id;
        }
        role = 'reviewer';
    }
    if (captureDetails.status === 1 || captureDetails.status === 2 || captureDetails.status === 3) {
        const linkedWhere = {
            acc_id: currentAccount.id,
            role: role
        };
        let currentLinkedAccount = {};
        await checkDetails.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
            .then(linkedAccount => {
                if (linkedAccount) {
                    currentLinkedAccount = linkedAccount;
                    if (parseInt(linkedAccount.user_id) === parseInt(req.user_id)) {
                        err_msg["linkedAccount"] = "Account already assigned to user.";
                    }
                }
            })
            .catch(err => {
                return res.status(500).send({message: err.message});
            });

        if (currentLinkedAccount.id) {
            await LinkedAccounts.update({
                user_id: req.user_id
            }, {
                where: {
                    acc_id: currentAccount.id,
                    role: role
                }
            })
                .then(linked => {
                    logger.logAction(accountName, req.user_id, req.body.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ') as ' + req.body.role, null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });
        } else {
            await LinkedAccounts.create({
                user_id: req.user_id,
                acc_id: currentAccount.id,
                role: role
            })
                .then(linked => {
                    logger.logAction(accountName, req.user_id, req.body.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ')', null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });
        }
    }

    if (req.files && req.body.status === '3') {
        const formData = new FormData();
        formData.append('fkHelloDocTypeID', '1');
        formData.append('fkHelloDocSubTypeID', '');
        formData.append('clientId', process.env.S3_CLIENT_ID);
        formData.append('customerId', process.env.S3_CUSTOMER_ID);
        formData.append('clientUniqueId', req.body.capture_id);
        formData.append('upload_file', req.files.file.data, req.files.file.name);

        const ext = mime.extension(req.files.file.mimetype);
        await axios({
            method: 'post',
            url: process.env.S3_UPLOAD_URL,
            headers: {
                'X-JWT-Assertion': process.env.S3_UPLOAD_JWT,
                'Authorization': process.env.S3_UPLOAD_BEARER
            },
            data: formData,
        })
            .then(function (response) {
                currentWorkpaperID = response.data.fileUploadId;
                if (currentWorkpaperStatus === 0) {
                    Workpaper.create({
                        linked_account: captureDetails.account_id,
                        linked_capture: req.body.capture_id,
                        s3_id: currentWorkpaperID,
                        extension: ext,
                        status: 1
                    }, res)
                        .then(workpaper => {
                        })
                        .catch(err => {
                            res.status(500).send({message: err.message});
                        })
                } else {
                    throw new Error("Here we stop");
                }
            })
            .catch(function (err) {
                accountsNewDetails['description'] = 'With preparer';
                accountsNewDetails['status'] = 2;
                captureNewDetails['description'] = 'With preparer';
                captureNewDetails['status'] = 2;
                responseMessage = 'File upload failed, please try again';
                responseCode = 500;
                logDesc = 'File upload failed';
            });
    }

    Accounts.update(accountsNewDetails, {
        where: {
            account_id: captureDetails.account_id,
            year: captureDetails.year,
            month: captureDetails.month,
        },
    }, res)
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    Captures.update(captureNewDetails, {
        where: {
            id: req.body.capture_id
        },
    }, res)
        .then(capture => {
            //update old file
            logger.logAction(captureDetails.account_id, req.user_id, req.body.capture_id, action, logDesc, currentWorkpaperID, accountBalance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
            res.status(responseCode).send({message: responseMessage});
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function bulkCertify(req, res) {
    let err_msg = {};
    let captureDetails = {};
    let currentAccount = {};
    let currentWorkpaperID = null;
    let currentWorkpaperStatus = 0;
    let user_name = '';
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let current_role = '';
    let action = req.body.action;
    let responseMessage = 'Update successful';
    let responseCode = 200;
    let logDesc = req.body.description;

    const keys = [];

    let key = {
        description: req.body.description,
        capture_id: req.body.capture_id,
        status: req.body.status,
        action: req.body.action,
        file: req.body.file,
        certify: req.body.certify
    };
    keys.push(key);

    for (const key of keys) {

        const where = {
            id: req.user_id,
            status: 1
        };
        checkDetails.dbRequests.getUsers(where, 'one', res)
            .then(user => {
                if (!user) {
                    err_msg["user"] = "User not found.";
                } else {
                    let authorities = [];
                    user.getRoles().then(roles => {
                        for (const element of roles) {
                            authorities.push("ROLE_" + element.name.toUpperCase());
                        }
                        current_role = authorities[0];
                    });
                }
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });

        const captureWhere = {
            id: key.capture_id
        };
        console.log('captureWhere********', captureWhere);
        await checkDetails.dbRequests.getCaptures(captureWhere, 'one', res)
            .then(capture => {
                if (!capture) {
                    err_msg["capture"] = "Capture not found.";
                } else {
                    captureDetails = capture;
                }
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });

        if (Object.keys(captureDetails).length) {
            const accountWhere = {
                account_id: captureDetails.account_id,
                month: captureDetails.month,
                year: captureDetails.year
            };

            console.log('accountWhere********', accountWhere);

            await checkDetails.dbRequests.getAccounts(accountWhere, 'one', res)
                .then(account => {
                    if (!account) {
                        err_msg["account"] = "Account not found.";
                    } else {
                        currentAccount = account;
                        accountName = account.account_name;
                        accountCurrency = account.currency;
                        accountBalance = account.balance;
                        accountYear = account.year;
                        accountMonth = account.month;
                    }
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });

            if (captureDetails.status === 3 && parseInt(key.status) !== 3 && parseInt(req.user_id) !== parseInt(captureDetails.allocated_reviewer) && captureDetails.allocated_reviewer !== null) {
                err_msg["permissions"] = "User not authorized for action";
            }
            if (captureDetails.status === 3 && parseInt(key.status) !== 3 && parseInt(req.user_id) === parseInt(captureDetails.allocated_preparer)) {
                err_msg["permissions"] = "User not authorized for action";
            }


            if (req.files && parseInt(captureDetails.status) > 2) {
                err_msg["workpaper"] = "Cannot load another workpaper while another is pending approval or Approved";
            }

            let accountsNewDetails = {
                description: key.description,
                status: key.status
            };
            let captureNewDetails = {
                description: key.description,
                status: key.status,
                certify: key.certify,
                allocated_preparer: req.user_id,
                allocated_reviewer: captureDetails.allocated_reviewer
            };
            let role = '';

            if (captureDetails.status === 1 && current_role !== 'ROLE_ADMINISTRATOR') {
                captureNewDetails['allocated_preparer'] = req.user_id;
                role = 'preparer';
            }
            if (captureDetails.status === 2 && current_role !== 'ROLE_ADMINISTRATOR') {
                captureNewDetails['allocated_preparer'] = req.user_id;
                role = 'preparer';
            }

            if (captureDetails.status === 1 || captureDetails.status === 2 || captureDetails.status === 3) {
                const linkedWhere = {
                    acc_id: currentAccount.id,
                    role: role
                };
                let currentLinkedAccount = {};
                await checkDetails.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
                    .then(linkedAccount => {
                        if (linkedAccount) {
                            currentLinkedAccount = linkedAccount;
                            if (parseInt(linkedAccount.user_id) === parseInt(req.body.user_id)) {
                                err_msg["linkedAccount"] = "Account already assigned to user.";
                            }
                        }
                    })
                    .catch(err => {
                        res.status(500).send({message: err.message});
                    });
                console.log('xxxxxxxxxxxxxxxxxxxxxxxxxx', currentLinkedAccount.id)

                if (currentLinkedAccount.id) {
                    await LinkedAccounts.update({
                        user_id: req.user_id
                    }, {
                        where: {
                            acc_id: currentAccount.id,
                            role: role
                        }
                    })
                        .then(linked => {
                            logger.logAction(accountName, req.user_id, key.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ') as ' + req.body.role, null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                        })
                        .catch(err => {
                            res.status(500).send({message: err.message});
                        });
                } else {
                    await LinkedAccounts.create({
                        user_id: req.user_id,
                        acc_id: currentAccount.id,
                        role: role
                    })
                        .then(linked => {
                            logger.logAction(accountName, req.user_id, key.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ')', null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                        })
                        .catch(err => {
                            res.status(500).send({message: err.message});
                        });
                }
            }

            if (req.files && key.status === '3') {
                const formData = new FormData();
                formData.append('fkHelloDocTypeID', '1');
                formData.append('fkHelloDocSubTypeID', '');
                formData.append('clientId', process.env.S3_CLIENT_ID);
                formData.append('customerId', process.env.S3_CUSTOMER_ID);
                formData.append('clientUniqueId', key.capture_id);
                formData.append('upload_file', req.files.file.data, req.files.file.name);

                const ext = mime.extension(req.files.file.mimetype);
                await axios({
                    method: 'post',
                    url: process.env.S3_UPLOAD_URL,
                    headers: {
                        'X-JWT-Assertion': process.env.S3_UPLOAD_JWT,
                        'Authorization': process.env.S3_UPLOAD_BEARER
                    },
                    data: formData,
                })
                    .then(function (response) {
                        currentWorkpaperID = response.data.fileUploadId;
                        if (req.files && currentWorkpaperStatus === 0) {
                            Workpaper.create({
                                linked_account: captureDetails.account_id,
                                linked_capture: key.capture_id,
                                s3_id: currentWorkpaperID,
                                extension: ext,
                                status: 1
                            }, res)
                                .then(workpaper => {
                                })
                                .catch(err => {
                                    res.status(500).send({message: err.message});
                                })
                        } else {
                            throw new Error("Here we stop");
                        }
                    })
                    .catch(function (err) {
                        accountsNewDetails['description'] = 'With preparer';
                        accountsNewDetails['status'] = 2;
                        captureNewDetails['description'] = 'With preparer';
                        captureNewDetails['status'] = 2;
                        responseMessage = 'File upload failed, please try again';
                        responseCode = 500;
                        logDesc = 'File upload failed';
                    });
            }

            Accounts.update(accountsNewDetails, {
                where: {
                    account_id: captureDetails.account_id,
                    year: captureDetails.year,
                    month: captureDetails.month,
                },
            }, res)
                .then(account => {
                })
                .catch(err => {
                    return res.status(500).send({message: err.message});
                });

            Captures.update(captureNewDetails, {
                where: {
                    id: key.capture_id,
                    year: captureDetails.year,
                    month: captureDetails.month,
                },
            }, res)
                .then(capture => {
                    //update old file
                    // logger.logAction(captureDetails.account_id, req.user_id, req.body.capture_id, action, logDesc, currentWorkpaperID, captureDetails.balance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
                    // return res.status(responseCode).send({message: responseMessage});
                })
                .catch(err => {
                    console.error(err)
                    return res.status(500).send({message: err.message});
                });
            //update old file
            logger.logAction(captureDetails.account_id, req.user_id, key.capture_id, action, logDesc, currentWorkpaperID, accountBalance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
        }
    }
    res.status(responseCode).send({message: responseMessage});
}

async function bulkReview(req, res) {

    let err_msg = {};
    let captureDetails = {};
    let currentAccount = {};
    let currentWorkpaperID = null;
    let user_name = '';
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let current_role = '';
    let action = req.body.action ? req.body.action : 'Update capture';
    let responseMessage = 'Update successful';
    let responseCode = 200;
    let logDesc = req.body.description;

    const keys = [];

    let key = {
        description: req.body.description,
        capture_id: req.body.capture_id,
        status: req.body.status,
        action: req.body.action,
    };
    keys.push(key);

    for (const key of keys) {

        const where = {
            id: req.user_id,
            status: 1
        };
        await checkDetails.dbRequests.getUsers(where, 'one', res)
            .then(user => {
                if (!user) {
                    err_msg["user"] = "User not found.";
                } else {
                    let authorities = [];
                    user.getRoles().then(roles => {
                        for (const element of roles) {
                            authorities.push("ROLE_" + element.name.toUpperCase());
                        }
                        current_role = authorities[0];
                    });
                }
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });

        const captureWhere = {
            id: key.capture_id
        };
        console.log('bulkReview captureWhere:', captureWhere);
        await checkDetails.dbRequests.getCaptures(captureWhere, 'one', res)
            .then(capture => {
                if (!capture) {
                    err_msg["capture"] = "Capture not found.";
                } else {
                    captureDetails = capture;
                }
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });
        if (Object.keys(captureDetails).length) {
            const accountWhere = {
                account_id: captureDetails.account_id,
                month: captureDetails.month,
                year: captureDetails.year
            };
            await checkDetails.dbRequests.getAccounts(accountWhere, 'one', res)
                .then(account => {
                    if (!account) {
                        err_msg["account"] = "Account not found.";
                    } else {
                        currentAccount = account;
                        accountName = account.account_name;
                        accountCurrency = account.currency;
                        accountBalance = account.balance;
                        accountYear = account.year;
                        accountMonth = account.month;
                    }
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });

            if (captureDetails.status === 3 && parseInt(key.status) !== 3 && parseInt(req.user_id) !== parseInt(captureDetails.allocated_reviewer) && captureDetails.allocated_reviewer !== null) {
                err_msg["permissions"] = "User not authorized for action";
            }
            if (captureDetails.status === 3 && parseInt(key.status) !== 3 && parseInt(req.user_id) === parseInt(captureDetails.allocated_preparer)) {
                err_msg["permissions"] = "User not authorized for action";
            }


            if (req.files && parseInt(captureDetails.status) > 2) {
                err_msg["workpaper"] = "Cannot load another workpaper while another is pending approval or Approved";
            }

            let accountsNewDetails = {
                description: key.description,
                status: key.status
            };

            let captureNewDetails = {
                description: key.description,
                status: key.status,
                allocated_preparer: captureDetails.allocated_preparer,
                allocated_reviewer: req.user_id
            };
            let role = '';

            if (captureDetails.status === 1 && current_role !== 'ROLE_ADMINISTRATOR') {
                captureNewDetails['allocated_preparer'] = req.user_id;
                role = 'preparer';
            }
            if (captureDetails.status === 2 && current_role !== 'ROLE_ADMINISTRATOR') {
                captureNewDetails['allocated_preparer'] = req.user_id;
                role = 'preparer';
            }

            if (captureDetails.status === 3 && current_role !== 'ROLE_ADMINISTRATOR') {
                captureNewDetails['allocated_reviewer'] = req.user_id;
                role = 'reviewer';
            }

            const workpaperWhere = {
                linked_capture: captureDetails.id,
                linked_account: captureDetails.account_id,
                status: 1
            };
            await checkDetails.dbRequests.getWorkpaper(workpaperWhere, 'one', res)
                .then(workpaper => {
                    if (workpaper) {
                        currentWorkpaperID = workpaper.s3_id;
                    }
                })
                .catch(err => {
                    res.status(500).send({message: err.message});
                });

            if (action === 'Reject capture') {
                Workpaper.update({
                    status: 0
                }, {
                    where: {
                        s3_id: currentWorkpaperID
                    }
                });
            }

            if (captureDetails.status === 1 || captureDetails.status === 2 || captureDetails.status === 3) {
                const linkedWhere = {
                    acc_id: currentAccount.id,
                    role: role
                };
                let currentLinkedAccount = {};
                await checkDetails.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
                    .then(linkedAccount => {
                        if (linkedAccount) {
                            currentLinkedAccount = linkedAccount;
                            if (parseInt(linkedAccount.user_id) === parseInt(req.body.user_id)) {
                                err_msg["linkedAccount"] = "Account already assigned to user.";
                            }
                        }
                    })
                    .catch(err => {
                        res.status(500).send({message: err.message});
                    });

                if (currentLinkedAccount.id) {
                    await LinkedAccounts.update({
                        user_id: req.user_id
                    }, {
                        where: {
                            acc_id: currentAccount.id,
                            role: role
                        }
                    })
                        .then(linked => {
                            logger.logAction(accountName, req.user_id, key.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ') as ' + req.body.role, null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                        })
                        .catch(err => {
                            res.status(500).send({message: err.message});
                        });
                } else {
                    await LinkedAccounts.create({
                        user_id: req.user_id,
                        acc_id: currentAccount.id,
                        role: role
                    })
                        .then(linked => {
                            logger.logAction(accountName, req.user_id, key.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ')', null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
                        })
                        .catch(err => {
                            res.status(500).send({message: err.message});
                        });
                }
            }

            Accounts.update(accountsNewDetails, {
                where: {
                    account_id: captureDetails.account_id,
                    year: captureDetails.year,
                    month: captureDetails.month,
                },
            }, res)
                .then(account => {
                })
                .catch(err => {
                    return res.status(500).send({message: err.message});
                });

            Captures.update(captureNewDetails, {
                where: {
                    id: key.capture_id,
                },
            }, res)
                .then(capture => {
                    //update old file
                    // logger.logAction(captureDetails.account_id, req.user_id, req.body.capture_id, action, logDesc, currentWorkpaperID, captureDetails.balance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
                    // return res.status(responseCode).send({message: responseMessage});
                })
                .catch(err => {
                    console.error(err)
                    return res.status(500).send({message: err.message});
                });
            //update old file
            logger.logAction(captureDetails.account_id, req.user_id, key.capture_id, action, logDesc, currentWorkpaperID, captureDetails.balance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
        }
    }
    return res.status(responseCode).send({message: responseMessage});
}

async function assignCapture(req, res) {
    let current_user = '';
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let accountDBId = '';
    let err_msg = {};
    let captureNewUser = {};
    let currentLinkedAccount = {};
    const user_where = {
        id: req.user_id,
        status: 1
    };
    await checkDetails.dbRequests.getUsers(user_where, 'one', res)
        .then(user => {
            if (!user) {
                switch (req.body.role) {
                    case 'preparer':
                        err_msg["preparer"] = "Preparer not found.";
                        break;
                    case 'reviewer':
                        err_msg["reviewer"] = "Reviewer not found.";
                        break;
                    default:
                }
            } else {
                current_user = user;
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
    const captureWhere = {
        id: req.body.capture_id
    };
    await checkDetails.dbRequests.getCaptures(captureWhere, 'one', res)
        .then(capture => {
            if (!capture) {
                err_msg["capture"] = "Capture not found.";
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
    const user_name = current_user.firstName + ' ' + current_user.surname;
    const accountWhere = {
        account_id: req.body.account_id
    };
    await checkDetails.dbRequests.getAccounts(accountWhere, 'one', res)
        .then(account => {
            if (!account) {
                err_msg["accounts"] = "Account not found.";
            } else {
                accountName = account.account_name;
                accountCurrency = account.currency;
                accountBalance = account.balance;
                accountYear = account.year;
                accountMonth = account.month;
                accountDBId = account.id;
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
    const linkedWhere = {
        acc_id: accountDBId,
        role: req.body.role
    };
    await checkDetails.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
        .then(linkedAccount => {
            if (linkedAccount) {
                currentLinkedAccount = linkedAccount;
                if (parseInt(linkedAccount.user_id) === parseInt(req.body.user_id)) {
                    err_msg["linkedAccount"] = "Account already assigned to user.";
                }
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }

    if (currentLinkedAccount.id) {
        await LinkedAccounts.update({
            user_id: req.user_id
        }, {
            where: {
                acc_id: accountDBId,
                role: req.body.role
            }
        })
            .then(linked => {
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });
    } else {
        await LinkedAccounts.create({
            user_id: req.user_id,
            acc_id: accountDBId,
            role: req.body.role
        })
            .then(linked => {
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });
    }

    captureNewUser['allocated_' + req.body.role] = req.user_id;

    Captures.update(captureNewUser, {
        where: {
            id: req.body.capture_id
        },
    }, res)
        .then(capture => {
            logger.logAction(accountName, req.user_id, req.body.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.user_id + ')', null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
            res.status(200).send({message: "Capture assigned successfully"});
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchFile(req, res) {
    const fileUrl = process.env.S3_FETCH_URL + process.env.S3_CUSTOMER_ID + '/fetchFiles/' + req.query.fileId;
    await axios({
        method: 'get',
        url: fileUrl,
        headers: {
            'X-JWT-Assertion': process.env.S3_UPLOAD_JWT,
            'Accept': 'application/json'
        },
        responseType: 'arraybuffer'
    })
        .then(file => {
            const mimeType = file.headers['content-type'];
            const paper = Buffer.from(file.data, 'binary').toString('base64');
            res.status(200).send({base64: paper, type: mimeType});
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function workFlowReset(req, res) {

    let err_msg = {};
    let captureDetails = {};
    let currentAccount = {};
    let currentWorkpaperID = null;
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let current_role = '';
    let responseMessage = 'Update successful';
    let responseCode = 200;
    let logDesc = req.body.description;

    const keys = [];
    let key = {
        description: req.body.description,
        capture_id: req.body.capture_id,
        status: req.body.status,
        action: req.body.action,
    };
    keys.push(key);

    for (const key of keys) {
        const where = {
            id: req.user_id,
            status: 1
        };
        await checkDetails.dbRequests.getUsers(where, 'one', res).then(user => {
            if (!user) {
                err_msg["user"] = "User not found.";
            } else {
                let authorities = [];
                user.getRoles().then(roles => {
                    for (const element of roles) {
                        authorities.push("ROLE_" + element.name.toUpperCase());
                    }
                    current_role = authorities[0];
                });
            }
        }).catch(err => {
            res.status(500).send({message: err.message});
        });

        const captureWhere = {
            id: key.capture_id
        };

        await checkDetails.dbRequests.getCaptures(captureWhere, 'one', res).then(capture => {
            if (!capture) {
                err_msg["capture"] = "Capture not found.";
            } else {
                captureDetails = capture;
            }
        }).catch(err => {
            res.status(500).send({message: err.message});
        });

        if (Object.keys(captureDetails).length) {
            const accountWhere = {
                account_id: captureDetails.account_id,
                month: captureDetails.month,
                year: captureDetails.year
            };
            await checkDetails.dbRequests.getAccounts(accountWhere, 'one', res)
                .then(account => {
                    if (!account) {
                        err_msg["account"] = "Account not found.";
                    } else {
                        currentAccount = account;
                        accountName = account.account_name;
                        accountCurrency = account.currency;
                        accountBalance = account.balance;
                        accountYear = account.year;
                        accountMonth = account.month;
                    }
                }).catch(err => {
                    res.status(500).send({message: err.message});
                });

            let role = '';

            const workpaperWhere = {
                linked_capture: captureDetails.id,
                linked_account: captureDetails.account_id,
                status: 1
            };
            await checkDetails.dbRequests.getWorkpaper(workpaperWhere, 'one', res)
                .then(workpaper => {
                    if (workpaper) {
                        currentWorkpaperID = workpaper.s3_id;
                    }
                }).catch(err => {
                    res.status(500).send({message: err.message});
                });

            if (parseInt(key.status) === 3 || parseInt(key.status) === 4) {
                Workpaper.update({
                    status: 0
                }, {
                    where: {
                        s3_id: currentWorkpaperID
                    }
                });

                const linkedWhere = {
                    acc_id: currentAccount.id,
                    role: role
                };
                console.log(linkedWhere);
                let currentLinkedAccount = {};
                await checkDetails.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
                    .then(linkedAccount => {
                        if (linkedAccount) {
                            currentLinkedAccount = linkedAccount;
                            if (parseInt(linkedAccount.user_id) === parseInt(req.body.user_id)) {
                                err_msg["linkedAccount"] = "Account already assigned to user.";
                            }
                        }
                    }).catch(err => {
                        res.status(500).send({message: err.message});
                    });

                if (currentLinkedAccount.id) {
                    await LinkedAccounts.update({
                        user_id: req.user_id
                    }, {
                        where: {
                            acc_id: currentAccount.id,
                            role: role
                        }
                    }).then(linked => {
                    }).catch(err => {
                        res.status(500).send({message: err.message});
                    });
                }
            }

            Accounts.update(
                {status: 1},
                {
                    where: {
                        account_id: captureDetails.account_id,
                        year: captureDetails.year,
                        month: captureDetails.month,
                    }
                }, res).then(account => {
            }).catch(err => {
                return res.status(500).send({message: err.message});
            });

            Captures.update(
                {status: 1},
                {
                    where: {
                        id: key.capture_id,
                    }
                }, res).then(capture => {
            }).catch(err => {
                console.error(err)
                return res.status(500).send({message: err.message});
            });
            logger.logAction(captureDetails.account_id, req.user_id, key.capture_id, 'Reset-Workflow', logDesc, currentWorkpaperID, captureDetails.balance, captureDetails.month, captureDetails.year, currentAccount.company_id, currentAccount.currency);
        }
    }
    return res.status(responseCode).send({message: responseMessage});
}
