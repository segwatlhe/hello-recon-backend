const logger = require("../services/logAction");
const checkDetailsService = require("../services/dbRequests");
const db = require("../models");
const Companies = db.companies;
const LinkedCompanies = db.linkedCompanies;
const Accounts = db.accounts;
exports.getCompanies = (req, res) => {
    fetchCompanies(req, res);
};
exports.assignCompany = (req, res) => {
    assignCompany(req, res);
};
exports.unAssignCompany = (req, res) => {
    unAssignCompany(req, res);
};
exports.addCompany = (req, res) => {
    addCompany(req, res);
};
exports.updateCompany = (req, res) => {
    updateCompany(req, res);
};
exports.removeCompany = (req, res) => {
    removeCompany(req, res);
};
exports.fetchCompanyDates = (req, res) => {
    fetchCompanyDates(req, res);
};
exports.fetchActiveCompanies = (req, res) => {
    fetchActiveCompanies(req, res);
};
exports.fetchCompany = (req, res) => {
    fetchCompany(req, res);
};
exports.fetchLoanCompany = (req, res) => {
    fetchLoanCompany(req, res);
};


async function fetchCompanies(req, res) {
    if (req.query.user) {
        const query = "SELECT * FROM companies c " +
            "LEFT JOIN linked_companies lc on lc.company_id =  c.id\n" +
            "WHERE lc.user_id = " + req.query.user + " ORDER BY c.company_name ASC";
        await checkDetailsService.dbRequests.customSelectQuery(query)
            .then(companies => {
                return res.status(200).send({companies});
            }).catch(err => {
                return res.status(500).send({message: err.message});
            });
    } else {
        const companyWhere = req.query.active ? {active: req.query.active} : {};
        await checkDetailsService.dbRequests.getCompanies(companyWhere, 'all', res)
            .then(companies => {
                return res.status(200).send({companies});
            }).catch(err => {
                return res.status(500).send({message: err.message});
            });
    }

}

async function assignCompany(req, res) {
    let user_name = '';
    let companyName = '';
    let err_msg = {};
    const userWhere = {
        id: req.body.user_id,
        status: 1
    };
    await checkDetailsService.dbRequests.getUsers(userWhere, 'one').then(user => {
        if (!user) {
            err_msg["user"] = "User not found.";
        } else {
            user_name = user.firstName + ' ' + user.surname;
        }
    })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    const companyWhere = {
        id: req.body.company_id,
        active: 1
    };
    await checkDetailsService.dbRequests.getCompanies(companyWhere, 'one', res)
        .then(company => {
            if (!company) {
                err_msg["company"] = "Company not found.";
            } else {
                companyName = company.company_name;
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    const linkedCompanyWhere = {
        user_id: req.body.user_id,
        company_id: req.body.company_id
    };
    await checkDetailsService.dbRequests.getLinkedCompanies(linkedCompanyWhere, 'one', res)
        .then(linkedCompany => {
            if (linkedCompany) {
                err_msg["assigned"] = "Company already assigned to user.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }

    await LinkedCompanies.create({
        user_id: req.body.user_id,
        company_id: req.body.company_id
    })
        .then(linked => {
            res.send({message: "Company assigned successfully"});
            logger.logAction(null, req.user_id, null, 'Assigned Company to user', 'Company(' + companyName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ')', null, null, null, null, req.body.company_id);
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

}

async function unAssignCompany(req, res) {
    let err_msg = {};
    const userWhere = {
        id: req.body.user_id,
        status: 1
    };
    await checkDetailsService.dbRequests.getUsers(userWhere, 'one').then(user => {
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
    await checkDetailsService.dbRequests.getCompanies(companyWhere, 'one', res)
        .then(company => {
            if (!company) {
                err_msg["company"] = "Company not found.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }

    await LinkedCompanies.destroy({
        where: {
            user_id: req.body.user_id,
            company_id: req.body.company_id
        }
    })
        .then(function (rowDeleted) {
            if (rowDeleted === 1) {
                return res.status(200).send({message: "Company successfully unassigned."});
            } else {
                return res.status(403).send({message: "Failed to unassign: company not assigned to user."});
            }
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });

}

async function addCompany(req, res) {
    let err_msg = {};
    const companyWhere = {
        company_name: req.body.company_name
    };
    await checkDetailsService.dbRequests.getCompanies(companyWhere, 'one', res)
        .then(company => {
            if (company) {
                err_msg["company"] = "Company already exists.";
            }
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });

    const sql = require('mssql');
    const sqlConfig = {
        user: process.env.SQL_SERVER_USER,
        password: process.env.SQL_SERVER_PASS,
        server: process.env.SQL_SERVER_HOST,
        database: 'master',
        driver: 'msnodesqlv8',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 120000
        },
        options: {
            trustedConnection: process.env.TRUSTED_CONNECTION,
            trustServerCertificate: true
        }
    };

    const request = `SELECT name
                     FROM master.dbo.sysdatabases`;

    await sql.on('error', err => {
        return res.status(403).send({message: err});
    });
    await sql.connect(sqlConfig).then(pool => {
        return pool.request()
            .query(request)
    }).then(result => {
        let continueAdd = false;
        const dbResults = result.recordset;
        for (const element of dbResults) {
            if (element.name === req.body.company_db) {
                continueAdd = true;
            }
        }

        if (continueAdd === false) {
            err_msg["database"] = "Database does not exist.";
        }
    }).catch(err => {
        return res.status(403).send({message: err});
    });
    await sql.close();


    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }
    Companies.create({
        company_name: req.body.company_name,
        sql_server_db: req.body.company_db,
        active: 1
    })
        .then(company => {
            return res.send({message: "Company added successfully!"});
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function updateCompany(req, res) {
    Companies.update({
        company_name: req.body.company_name,
        sql_server_db: req.body.company_db,
        active: req.body.status
    }, {
        where: {
            id: req.body.company_id
        }
    })
        .then(company => {
            return res.send({message: "Company updated successfully!"});
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function removeCompany(req, res) {
    Companies.destroy({
        where: {
            id: req.query.company_id
        }
    })
        .then(company => {
            return res.send({message: "Company removed successfully!"});
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function fetchCompanyDates(req, res) {
    const years = await getDates('year', req.query.company_id, res);
    return res.status(200).send({message: {years: years}});
}

async function getDates(datePeriod, company_id, res) {
    let datePeriods;
    await Accounts.findAll({
        attributes: [datePeriod],
        group: datePeriod,
        order: [['year', 'DESC']],
        where: {
            company_id: company_id
        }
    })
        .then(date => {
            datePeriods = date;
        })
        .catch(err => {
            return res.status(500).send({message: err.message});
        });
    return datePeriods;
}

async function fetchActiveCompanies(req, res) {
    await Companies.findAll({
        where: {
            active: 1
        }
    }).then(companies => {
        return res.status(200).send({companies});
    }).catch(err => {
        return res.status(500).send({message: err.message});
    });
}

async function fetchCompany(req, res) {

    await Companies.findOne({
        where: {
            id: req.query.id
        }
    }).then(company => {
        return res.status(200).send({company});
    }).catch(err => {
        return res.status(500).send({message: err.message});
    });
}
async function fetchLoanCompany(req, res) {

    const id = req.query.id;
    const id2 = req.query.id2;

    try {
        const company1 = await Companies.findOne({
            where: {
                id: id
            }
        });

        const company2 = await Companies.findOne({
            where: {
                id: id2
            }
        });
        return res.status(200).send({ company1, company2 });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
}

