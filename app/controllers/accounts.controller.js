const logger = require("../services/logAction");
const checkDetailsService = require("../services/dbRequests");
const db = require("../models");

exports.importAccounts = (req, res) => {
    fetchData(req, res);
};
exports.fetchAccounts = (req, res) => {
    fetchAccounts(req, res);
};
exports.assignAccounts = (req, res) => {
    assignAccounts(req, res);
};
exports.bulkAssignAccounts = (req, res) => {
    bulkAssignAccounts(req, res);
};
exports.fetchLogs = (req, res) => {
    fetchLogs(req, res);
};
exports.assignRisk = (req, res) => {
    assignRisk(req, res);
};
exports.fetchBulkAccounts = (req, res) => {
    fetchBulkAccounts(req, res);
};
exports.fetchWorkResetAccounts = (req, res) => {
    fetchWorkResetAccounts(req, res);
};

exports.fetchBulkReviews = (req, res) => {
    fetchBulkReviews(req, res);
};

exports.getBulkCertifyAccount = (req, res) => {
    getBulkCertifyAccount(req, res);
};
exports.reviewActions = (req, res) => {
    reviewActions(req, res);
};

exports.zeroBalanceCount = (req, res) => {
    zeroBalanceCount(req, res);
};

exports.zeroBalanceReset = (req, res) => {
    zeroBalanceReset(req, res);
};

exports.balanceSheet = (req, res) => {
    balanceSheet(req, res);

};
exports.incomeStatements = (req, res) => {
    incomeStatements(req, res);

};
exports.balanceSheetCount = (req, res) => {
    balanceSheetCount(req, res);

};
exports.incomeStatementCount = (req, res) => {
    incomeStatementCount(req, res);
};
exports.switchAccountType = (req, res) => {
    switchAccountType(req, res);
};
exports.ppiAssignPartnercode = (req, res) => {
    ppiAssignPartnercode(req, res);
};
exports.ppiMappings = (req, res) => {
    ppiMappings(req, res);
};
exports.deleteMapping = (req, res) => {
    deleteMapping(req, res);
};
exports.dcmAssignAgentId = (req, res) => {
    dcmAssignAgentId(req, res);
};
exports.searchAgentId = (req, res) => {
    searchAgentId(req, res);
};
exports.dcmMappings = (req, res) => {
    dcmMappings(req, res);
};
exports.deleteDcmMapping = (req, res) => {
    deleteDcmMapping(req, res);
};
exports.lastSync = (req, res) => {
    lastSync(req, res);
};
exports.loanAccountsMapping = (req, res) => {
    loanAccountsMapping(req, res);
};
exports.createAccountsLoanMapping = (req, res) => {
    createAccountsLoanMapping(req, res);
};
exports.deleteloanAccountsMapping = (req, res) => {
    deleteloanAccountsMapping(req, res);
};
exports.balanceSheetBalance = (req, res) => {
    balanceSheetBalance(req, res);
};
exports.incomeStatementBalance = (req, res) => {
    incomeStatementBalance(req, res);
};
exports.fetchBulkReviewsIncomeStatement = (req, res) => {
    fetchBulkReviewsIncomeStatement(req, res);
};
exports.fetchBulkReviewsBalanceStatement = (req, res) => {
    fetchBulkReviewsBalanceStatement(req, res);
};
exports.fetchBulkCertifyIncomeStatement = (req, res) => {
    fetchBulkCertifyIncomeStatement(req, res);
};
exports.fetchBulkCertifyBalanceStatement = (req, res) => {
    fetchBulkCertifyBalanceStatement(req, res);
};
exports.importAccounts2 = (req, res) => {
    fetchData2(req, res);
};


async function fetchData(req, res) {
    try {
        let returnObj = {};
        let companyObj = {};
        let database = '';

        //Calculate final day of previous month
        const d = new Date();
        d.setDate(1);
        d.setHours(-1);

        const prevMonth = d.toISOString().slice(0, 10);

        if (req.query.company_id) {
            const where = {
                id: req.query.company_id,
                active: 1
            };
            await checkDetailsService.dbRequests.getCompanies(where, 'one', res)
                .then(companies => {
                    companyObj[companies['dataValues'].company_name] = {
                        'database': companies['dataValues'].sql_server_db,
                        'id': companies['dataValues'].id
                    }

                }).catch(err => {
                    return res.status(500).send({message: err.message});
                });
        } else {
            const where = {active: 1};
            await checkDetailsService.dbRequests.getCompanies(where, 'all', res)
                .then(companies => {
                    for (const key in companies) {
                        for (const key2 in companies[key]['dataValues']) {
                            companyObj[companies[key]['dataValues'].company_name] = {
                                'database': companies[key]['dataValues'].sql_server_db,
                                'id': companies[key]['dataValues'].id
                            }
                        }
                    }
                }).catch(err => {
                    return res.status(500).send({message: err.message});
                });
        }

        for (const key in companyObj) {
            const sql = require('mssql');
            const sqlConfig = {
                user: process.env.SQL_SERVER_USER,
                password: process.env.SQL_SERVER_PASS,
                server: process.env.SQL_SERVER_HOST,
                database: companyObj[key].database,
                driver: 'msnodesqlv8',
                pool: {
                    max: 10,
                    min: 0,
                    idleTimeoutMillis: 300000
                },
                options: {
                    trustedConnection: process.env.TRUSTED_CONNECTION,
                    trustServerCertificate: true
                }
            };

            database = companyObj[key].database;

            if (key === 'Hellostores') {
                const request2 = `select '${key}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], CONCAT (b.Segment_0, b.Segment_1) as account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (fccredit) as foreignBalance, case
                                      when b.ActCurr = '##' then 'ZAR' else b.ActCurr
                end
                as [Account Currency]
            from [2023_HelloStores].[dbo].[JDT1] as a, [2023_HelloStores].[dbo].[OACT] as b
                    where a.RefDate <= '${prevMonth}' and a.account = b.AcctCode
                    group by a.Account, b.AcctName, b.ActCurr, b.Segment_0, b.Segment_1,
                    CONCAT(b.Segment_0,b.Segment_1)
                    order by account DESC`;

                console.log('SAP Hellostores Query:: ', request2);

                await sql.on('error', err => {
                    return res.status(403).send({message: err.originalError.info.message});
                });
                await sql.connect(sqlConfig).then(pool => {
                    return pool.request().query(request2)
                }).then(result => {
                    returnObj[companyObj[key].id] = result['recordset'];
                }).catch(err => {
                    return res.status(403).send({message: err});
                });
                await sql.close();
            } else {

                const request = `select '${key}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], a.account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (fccredit) as foreignBalance, b.ActCurr as currency
                                 from JDT1 as a, OACT as b
                                 where a.RefDate <= ('${prevMonth}') and a.account = b.AcctCode
                                 group by a.Account, b.AcctName, b.ActCurr
                                 order by Account`;

                console.log('SAP Query:: ', request)

                await sql.on('error', err => {
                    return res.status(403).send({message: err.originalError.info.message});
                });
                await sql.connect(sqlConfig).then(pool => {
                    return pool.request()
                        .query(request)
                }).then(result => {
                    returnObj[companyObj[key].id] = result['recordset'];
                }).catch(err => {
                    return res.status(403).send({message: err});
                });
                await sql.close();
            }
        }
        const result = await importData(returnObj, req.user_id, database, res);
        return res.status(200).send({result});
    } catch (err) {
        console.error('fetchData function', err);
        return res.status(500).send({message: err});
    }
}

async function importData(data, userId, database, res) {
    try {
        const Accounts = db.accounts;
        const Captures = db.captures;
        const Workpaper = db.workpaper;
        let companyName = '';
        let account_created_obj = {};
        let account_type = '2';
        let isPrev = false;
        let previousAccount = {};
        let previousMonthAccounts = {};
        const Company = db.companies

        for (const company in data) {

            const companiesWhere = {active: 1, id: company};
            await checkDetailsService.dbRequests.getCompanies(companiesWhere, 'one', res)
                .then(companyDetails => {
                    if (!companyDetails) {
                        err_msg["company"] = "Company not found.";
                    } else {
                        companyName = companyDetails.company_name;
                    }
                }).catch(err => {
                    res.status(500).send({message: err.message});
                });

            for (const account in data[company]) {

                const accountWherePreviousMonth = {
                    company_id: company,
                    year: data[company][account].Year,
                    month: data[company][account].Month - 1,
                    account_id: companyName + 'TB.' + data[company][account].account
                };

                await checkDetailsService.dbRequests.getAccounts(accountWherePreviousMonth, 'one', res)
                    .then(prevAccounts => {
                        if (prevAccounts != null) {
                            previousAccount = prevAccounts;
                            if (previousAccount.status !== 4) {
                                Company.update(
                                    {isContolChecked: true},
                                    {where: {id: previousAccount.company_id}}
                                ).then(company_updated => {
                                        isPrev = true;
                                        return res.status(400).send({
                                            message: 'Cannot sync company due to accounts not yet finalised.'
                                        });
                                    }
                                ).catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                            }
                        }
                    })
                    .catch(err => {
                        console.error('Error occurred:', err);
                        res.status(500).send({message: err.message});
                    });

            }

            if (isPrev === true) {
                process.exit();
            }

            for (const account in data[company]) {
                let firstChar = data[company][account].account.charAt(0);
                if (['1', '2', '3'].includes(firstChar)) {
                    account_type = '1';
                } else {
                    account_type = '2';
                }


                const accountWhere = {
                    company_id: company,
                    year: data[company][account].Year,
                    month: data[company][account].Month,
                    account_id: companyName + 'TB.' + data[company][account].account
                };

                const accountWherePreviousMonth = {
                    company_id: company,
                    year: data[company][account].Year,
                    month: data[company][account].Month - 1,
                    account_id: companyName + 'TB.' + data[company][account].account
                };

                await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
                    .then(async accounts => {

                        let checkExistingAccount = await existingAccount(companyName + 'TB.' + data[company][account].account, parseFloat(data[company][account].balance), data[company][account].Month, res);


                        if (!accounts) {

                            const account_details = {
                                company_id: company,
                                account_id: companyName + 'TB.' + data[company][account].account,
                                account_name: data[company][account].AcctName,
                                year: data[company][account].Year,
                                month: data[company][account].Month,
                                balance: parseFloat(data[company][account].balance),
                                currency: data[company][account].currency,
                                status: 1,
                                risk: 'High',
                                accounts_type: account_type,
                                foreignBalance: parseFloat(data[company][account].foreignBalance)
                            };

                            if (!checkExistingAccount[0]) {
                                Accounts.create(account_details)
                                    .then(account_created => {
                                        account_created_obj[account_created.id] = {
                                            account: companyName + 'TB.' + data[company][account].account,
                                            account_id: account_created.id
                                        };
                                        logger.logAction(companyName + 'TB.' + data[company][account].account, 0, null, 'Created Monthly Account', null, null, parseFloat(data[company][account].balance), data[company][account].Month, data[company][account].Year, company);
                                    })
                                    .catch(err => {
                                        console.error('Accounts create', err);
                                        res.status(500).send({message: err.message});
                                    });
                            }

                        } else {
                            if ((parseFloat(accounts.balance) !== parseFloat(data[company][account].balance)) && accounts.balance !== null && data[company][account] !== null) {

                                await checkDetailsService.dbRequests.getAccounts(accountWherePreviousMonth, 'one', res)
                                    .then(async prevAccounts => {
                                        if (prevAccounts != null) {
                                            previousMonthAccounts = prevAccounts;
                                        }
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });


                                let captureDetails = {};
                                const captureSelectWhere = {
                                    year: data[company][account].Year,
                                    month: data[company][account].Month,
                                    account_id: companyName + 'TB.' + data[company][account].account
                                };
                                await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                                    .then(capture => {
                                        if (capture) {
                                            captureDetails = capture;
                                        }
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });

                                Accounts.update({
                                    balance: data[company][account].balance,
                                    status: 2,
                                    foreignBalance: data[company][account].foreignBalance,
                                    risk: previousMonthAccounts.risk,
                                    accounts_type: previousMonthAccounts.accounts_type
                                }, {
                                    where: {
                                        id: accounts.id
                                    },
                                }).then(account_updated => {
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });

                                if (captureDetails.id) {

                                    Workpaper.update({
                                        status: 0
                                    }, {
                                        where: {
                                            linked_capture: captureDetails.id,
                                            status: 1
                                        },
                                    }).then(workpaper_updated => {
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });

                                    Captures.update({
                                        balance: data[company][account].balance,
                                        status: 2,
                                        foreignBalance: data[company][account].foreignBalance
                                    }, {
                                        where: {
                                            id: captureDetails.id
                                        }
                                    }).then(capture_updated => {
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });
                                }
                                const desc = 'Balance different(Old:' + accounts.currency + ' ' + accounts.balance + '/New:' + data[company][account].currency + ' ' + data[company][account].balance + '). Updating balance and resetting status';
                                logger.logAction(companyName + 'TB.' + data[company][account].account, 0, null, 'Updated Monthly Account', desc, null, data[company][account].balance, data[company][account].Month, data[company][account].Year, company, data[company][account].currency, data[company][account].foreignBalance);

                            } else {
                                await zeroBalance(data[company][account], userId, res);
                            }
                        }
                        return accounts;

                    }).then(async accounts => {
                        await corporateAccountCertify(data[company][account], userId, res);
                        return accounts;
                    }).then(async accounts => {
                        await loanAccountCertify(data[company][account], userId, database, res);
                        return accounts;
                    }).then(async accounts => {
                        await ppiAccountCertify(data[company][account], userId, database, res);
                        return accounts;
                    }).then(async accounts => {
                        await dcmAutoCertify(data[company][account], userId, database, res);
                        return accounts;
                    }).catch(err => {
                        console.error('getAccounts', err);
                        return res.status(500).send({message: err.message});
                    });

            }
            if (Object.keys(account_created_obj).length) {
                await autoAssignAccounts(Accounts, account_created_obj);
            }
        }
        return "Success";
    } catch (err) {
        console.error('import function: ', err);
        return res.status(500).send({message: err.message});
    }
}

async function existingAccount(account_id, balance, month, res) {

    const Accounts = db.accounts;

    let datePeriods;
    await Accounts.findAll({
        order: [['updatedAt', 'DESC']],
        limit: 1,
        where: {
            account_id: account_id,
            balance: balance,
            month: month
        }
    }).then(existingAccount => {
        datePeriods = existingAccount;
    }).catch(err => {
        return res.status(500).send({message: err.message});
    });
    return datePeriods;
}


const cron = require('node-cron');
const {Op} = require("sequelize");
const sql = require("mssql");
cron.schedule('0 0 7 * * *', async function (req, res) {
    console.log('CRON SCHEDULE:::::::::::::::::::::::');

    const Company = db.companies;
    const companyKeys = [];
    let companyKey = {};
    let companyObj = {};
    let returnObj = {};
    let database = '';
    let companyId;
    let userId = {};

    // find admin user
    const User = db.user;
    let usernameWhere = {
        username: 'hello_recon_admin',
    };
    await User.findOne({
        where: usernameWhere
    }).then(user => {
        userId = {
            id: user['dataValues'].id,
        };
    });

    //Calculate final day of previous month
    const d = new Date();
    d.setDate(1);
    d.setHours(-1);
    const prevMonth = d.toISOString().slice(0, 10);

    await Company.findAll({
        where: {
            active: 1,
            [Op.or]: [
                {
                    isContolChecked: {
                        [Op.eq]: false
                    }
                },
                {
                    isContolChecked: {
                        [Op.is]: null
                    }
                }
            ]
        }
    }).then(companies => {
        for (const key in companies) {
            for (const key2 in companies[key]['dataValues']) {
                companyObj[companies[key]['dataValues'].company_name] = {
                    'database': companies[key]['dataValues'].sql_server_db,
                    'id': companies[key]['dataValues'].id,
                    'company_name': companies[key]['dataValues'].company_name
                }
            }
        }
    });

    const keys = [];
    for (let key1 in companyObj) {
        let key = {
            database: companyObj[key1].database,
            id: companyObj[key1].id,
            company_name: companyObj[key1].company_name
        };
        keys.push(key);
    }

    for (let key of keys) {
        const sqlConfig = {
            user: process.env.SQL_SERVER_USER,
            password: process.env.SQL_SERVER_PASS,
            server: process.env.SQL_SERVER_HOST,
            database: key.database,
            driver: 'msnodesqlv8',
            pool: {
                max: 99,
                min: 0,
                idleTimeoutMillis: 300000 // 5 minutes
            },
            options: {
                trustedConnection: process.env.TRUSTED_CONNECTION,
                trustServerCertificate: true
            }
        };
        companyKey = {
            companyId: key.id
        };
        companyKeys.push(companyKey);
        database = key.database;
        companyId = key.id;

        let request;
        if (key.company_name === 'Hellostores') {
            // SQL query for the 'Hellostores' company
            request = `select '${key.company_name}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], CONCAT (b.Segment_0, b.Segment_1) as account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (a.fccredit) as foreignBalance, case
                           when b.ActCurr = '##' then 'ZAR'
                           else b.ActCurr
            end
            as [Account Currency]
                       from [
            ${key.database}
            ]
            .
            [
            dbo
            ]
            .
            [
            JDT1
            ]
            as
            a,
            [
            ${key.database}
            ]
            .
            [
            dbo
            ]
            .
            [
            OACT
            ]
            as
            b
            where
            a
            .
            RefDate
            <=
            '${prevMonth}'
            and
            a
            .
            account
            =
            b
            .
            AcctCode
            group
            by
            a
            .
            Account,
            b
            .
            AcctName,
            b
            .
            ActCurr,
            b
            .
            Segment_0,
            b
            .
            Segment_1,
            CONCAT
            (
            b
            .
            Segment_0,
            b
            .
            Segment_1
            )
            order
            by
            account
            DESC`;
        } else {
            // SQL query for other companies
            request = `select '${key.company_name}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], a.account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (a.fccredit) as foreignBalance, b.ActCurr as currency
                       from [${key.database}].[dbo].[JDT1] as a, [${key.database}].[dbo].[OACT] as b
                       where a.RefDate <= ('${prevMonth}') and a.account = b.AcctCode
                       group by a.Account, b.AcctName, b.ActCurr
                       order by Account`;
        }

        console.log('CRON:: SAP Query', request);

        try {
            await sql.on('error', err => {
                console.log('CRON Establish Connection:::::::::::::::::::::::', err);
                throw err;
            });
            const pool = await sql.connect(sqlConfig);
            const result = await pool.request().query(request);
            returnObj[key.id] = result['recordset'];
            await sql.close();
        } catch (err) {
            console.error('CRON ERROR:::::::::::::::::::::::', err);
            return res.status(403).send({message: err});
        }
    }

    const result = await importData(returnObj, userId.id, database, res);
    if (result === 'Success') {
        for (let companyKey of companyKeys) {
            await lastSync2(companyKey.companyId, res);
        }
    }
    return res.status(200).send({result});
});


async function autoAssignAccounts(Accounts, account_created_obj) {
    for (const account in account_created_obj) {
        let linked_account_obj = {};
        //assign if previous account assigned
        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
            "FROM accounts a\n" +
            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
            "LEFT JOIN users u on u.id = la.user_id\n" +
            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
            "WHERE account_id = '" + account_created_obj[account].account + "'\n" +
            "ORDER BY a.id DESC\n" +
            "LIMIT 1";
        await checkDetailsService.dbRequests.customSelectQuery(query)
            .then(async linked_account => {
                linked_account_obj = {
                    // preparer_id: linked_account[0].preparer_id ? linked_account[0].preparer_id : null,
                    // reviewer_id: linked_account[0].reviewer_id ? linked_account[0].reviewer_id : null,
                    administrator_id: linked_account[0].administrator_id ? linked_account[0].administrator_id : null
                };

                const administratorInsert = linked_account_obj.administrator_id ? "('" + account_created_obj[account].account_id + "', '" + linked_account_obj.administrator_id + "', 'administrator')," : '';
                const preparerInsert = linked_account_obj.preparer_id ? "('" + account_created_obj[account].preparer_id + "', '" + linked_account_obj.preparer_id + "', 'preparer')," : '';
                const reviewerInsert = linked_account_obj.reviewer_id ? "('" + account_created_obj[account].reviewer_id + "', '" + linked_account_obj.reviewer_id + "', 'reviewer')," : '';

                if (Object.keys(linked_account_obj).length) {
                    const insert_query = "INSERT INTO linked_accounts (acc_id, user_id, role) VALUES\n" + administratorInsert + preparerInsert + reviewerInsert;

                    await checkDetailsService.dbRequests.customSelectQuery(insert_query)
                        .then(linked_account => {
                        })
                        .catch(err => {
                            return err;
                        });
                }
            }).catch(err => {
                return res.status(500).send({message: err.message});
            });
        const risk_query = "SELECT id, risk \n" +
            "FROM accounts a \n" +
            "WHERE account_id = '" + account_created_obj[account].account + "' \n" +
            "AND risk IS NOT null AND risk != '' \n" +
            "ORDER BY a.id DESC LIMIT 1";
        await checkDetailsService.dbRequests.customSelectQuery(risk_query)
            .then(account => {
                if (account[0]) {
                    Accounts.update({
                        risk: account[0].risk
                    }, {
                        where: {
                            id: account[0].id
                        },
                    })
                }
            });
    }
    return "Success";
}

async function fetchAccounts(req, res) {
    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchBulkAccounts(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (1,2)\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchWorkResetAccounts(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (3,4)\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}


async function assignAccounts(req, res) {
    const LinkedAccounts = db.linkedAccounts;
    const Captures = db.captures;
    let user_name = '';
    let accountName = '';
    let accountCurrency = '';
    let accountBalance = '';
    let accountYear = '';
    let accountMonth = '';
    let accountDBId = '';
    let err_msg = {};
    let currentLinkedAccount = {};
    let captureDetails = {};

    const where = {
        id: req.body.user_id,
        status: 1
    };
    await checkDetailsService.dbRequests.getUsers(where, 'one', res)
        .then(user => {
            if (!user) {
                err_msg["user"] = "User not found.";
            } else {
                user_name = user.firstName + ' ' + user.surname;
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
    const captureWhere = {
        id: req.body.capture_id
    };
    await checkDetailsService.dbRequests.getCaptures(captureWhere, 'one', res)
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
    const accountWhere = {
        account_id: captureDetails.account_id,
        month: captureDetails.month,
        year: captureDetails.year
    };
    await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
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
    await checkDetailsService.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
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
    const account_roles = ["administrator", "reviewer", "preparer"];
    if (!account_roles.includes(req.body.role)) {
        err_msg["role"] = "Invalid role specified";
    }
    const logWhere = {
        action: 'Submit Capture',
        capture_id: req.body.capture_id,
        user_id: req.body.user_id
    };
    await checkDetailsService.dbRequests.getLogs(logWhere, 'all')
        .then(logs => {
            if (Object.keys(logs).length && req.body.role === 'reviewer') {
                err_msg["user"] = "A previous preparer cannot be a reviewer";
            }
        })
        .catch(err => {
            return err.message;
        });
    if (req.body.role && req.body.role === 'preparer' && req.body.user_id === captureDetails.reviewer_id) {
        err_msg["user"] = "Preparer cannot be same as reviewer";
    } else if (req.body.role && req.body.role === 'reviewer' && req.body.user_id === captureDetails.preparer_id) {
        err_msg["user"] = "Reviewer cannot be same as preparer";
    }
    if (Object.keys(err_msg).length) {
        return res.status(500).send({message: err_msg});
    }

    const captureUpdate = req.body.role === 'preparer' ? {
        allocated_preparer: req.body.user_id
    } : {
        allocated_reviewer: req.body.user_id
    };
    const captureUpdateWhere = {
        id: req.body.capture_id
    };
    await Captures.update(
        captureUpdate
        , {
            where: captureUpdateWhere

        })
        .then(linked => {
        })
        .catch(err => {
            res.status(500).send({message: err.message});
        });

    if (currentLinkedAccount.id) {
        await LinkedAccounts.update({
            user_id: req.body.user_id
        }, {
            where: {
                acc_id: accountDBId,
                role: req.body.role
            }
        })
            .then(linked => {
                res.send({message: "Account assigned successfully"});
                logger.logAction(accountName, req.user_id, req.body.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ') as ' + req.body.role, null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });
    } else {
        await LinkedAccounts.create({
            user_id: req.body.user_id,
            acc_id: accountDBId,
            role: req.body.role
        })
            .then(linked => {
                res.send({message: "Account assigned successfully"});
                logger.logAction(accountName, req.user_id, req.body.capture_id, 'Assigned Account to user', 'Account(' + accountName + ') assigned to user: ' + user_name + '(ID: ' + req.body.user_id + ')', null, accountBalance, accountMonth, accountYear, req.body.company_id, accountCurrency);
            })
            .catch(err => {
                res.status(500).send({message: err.message});
            });
    }
}

async function bulkAssignAccounts(req, res) {
    const updateObj = req.body.update_details;
    const unsubscribePreparer = updateObj.unsubscribe.preparer;
    const unsubscribeReviewer = updateObj.unsubscribe.reviewer;
    const preparer = updateObj.preparer;
    const reviewer = updateObj.reviewer;
    const LinkedAccounts = db.linkedAccounts;
    const Captures = db.captures;

    for (const key in unsubscribePreparer) {
        await clearLinkedEntry(unsubscribePreparer, res, '');

        const accountWhere = {
            id: key
        };
        await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(account => {
                let captureSet = {};
                if (unsubscribePreparer[key].role === 'preparer') {
                    captureSet = {
                        allocated_preparer: null
                    };
                } else if (unsubscribePreparer[key].role === 'reviewer') {
                    captureSet = {
                        allocated_reviewer: null
                    };
                }
                Captures.update(captureSet, {
                    where: {
                        account_id: account.account_id,
                        month: account.month,
                        year: account.year
                    },
                }, res)
            })
            .catch(err => {
            });
    }

    for (const key in unsubscribeReviewer) {
        await clearLinkedEntry(unsubscribeReviewer, res, '');

        const accountWhere = {
            id: key
        };
        await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(account => {
                let captureSet = {};
                if (unsubscribeReviewer[key].role === 'preparer') {
                    captureSet = {
                        allocated_preparer: null
                    };
                } else if (unsubscribeReviewer[key].role === 'reviewer') {
                    captureSet = {
                        allocated_reviewer: null
                    };
                }
                Captures.update(captureSet, {
                    where: {
                        account_id: account.account_id,
                        month: account.month,
                        year: account.year
                    },
                }, res)
            })
            .catch(err => {
            });
    }

    for (const key in preparer) {
        const accountWhere = {
            id: key
        };

        await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(async account => {
                const captureWhere = {
                    account_id: account.account_id,
                    month: account.month,
                    year: account.year
                };
                await checkDetailsService.dbRequests.getCaptures(captureWhere, 'one', res)
                    .then(capture => {
                        if (capture) {
                            Captures.update({
                                allocated_preparer: preparer[key].user
                            }, {
                                where: captureWhere

                            })
                                .then(linked => {
                                })
                                .catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({message: err.message});
                    })
            })
            .catch(err => {
            });
        const linkedWhere = {
            acc_id: key,
            role: preparer[key].role
        };
        await checkDetailsService.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
            .then(linkedAccount => {
                if (linkedAccount && linkedAccount.id && linkedAccount.user_id !== preparer[key].user) {
                    LinkedAccounts.update({
                            user_id: preparer[key].user
                        },
                        {
                            where: {
                                id: linkedAccount.id,
                                role: preparer[key].role
                            }
                        })
                        .then(linkedUser => {
                        })
                        .catch(err => {
                        });
                } else if (linkedAccount && linkedAccount.id && linkedAccount.user_id === preparer[key].user) {
                    console.log('Account already linked');
                } else {
                    LinkedAccounts.create({
                        acc_id: key,
                        user_id: preparer[key].user,
                        role: preparer[key].role

                    })
                        .then(linkedUser => {
                        })
                        .catch(err => {
                        });
                }
            })
            .catch(err => {
            });
    }


    for (const key in reviewer) {
        const accountWhere = {
            id: key
        };

        await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(async account => {
                const captureWhere = {
                    account_id: account.account_id,
                    month: account.month,
                    year: account.year
                };
                await checkDetailsService.dbRequests.getCaptures(captureWhere, 'one', res)
                    .then(capture => {
                        if (capture) {
                            Captures.update({
                                allocated_reviewer: reviewer[key].user
                            }, {
                                where: captureWhere

                            })
                                .then(linked => {
                                })
                                .catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({message: err.message});
                    })
            })
            .catch(err => {
            });

        console.log('reviewer', reviewer[key]);
        console.log('key.account_id', key);
        const linkedWhere = {
            acc_id: key,
            role: reviewer[key].role
        };
        await checkDetailsService.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
            .then(linkedAccount => {

                if (linkedAccount && linkedAccount.id && linkedAccount.user_id !== key.user) {
                    LinkedAccounts.update({
                            user_id: reviewer[key].user
                        },
                        {
                            where: {
                                id: linkedAccount.id,
                                role: reviewer[key].role
                            }
                        })
                        .then(linkedUser => {
                        })
                        .catch(err => {
                        });
                } else if (linkedAccount && linkedAccount.id && linkedAccount.user_id === reviewer[key].user) {
                    console.log('Account already linked');
                } else {
                    LinkedAccounts.create({
                        acc_id: key,
                        user_id: reviewer[key].user,
                        role: reviewer[key].role

                    })
                        .then(linkedUser => {
                        })
                        .catch(err => {
                        });
                }
            })
            .catch(err => {
            });
    }
    return res.send({message: "Account assigned successfully"});
}

async function clearLinkedEntry(userObj, res, type = null) {
    const LinkedAccounts = db.linkedAccounts;
    for (const key in userObj) {
        let linkedWhere;
        linkedWhere = {
            acc_id: userObj[key].id,
            user_id: userObj[key].user,
            role: userObj[key].role
        };
        await checkDetailsService.dbRequests.getLinkedAccounts(linkedWhere, 'one', res)
            .then(async linkedAccount => {
                if (linkedAccount) {

                    await LinkedAccounts.destroy({
                        where: {
                            id: linkedAccount.id
                        }
                    })
                        .then(company => {
                        })
                        .catch(err => {
                        });
                }
            })
            .catch(err => {
            });
    }
}

async function fetchLogs(req, res) {

    let logWhere = {}; //

    if (req.query.account_id) {
        logWhere.account_id = req.query.account_id;
    }

    if (req.query.capture_id) {
        logWhere.capture_id = req.query.capture_id;
    }

    if (req.query.month) {
        logWhere.month = req.query.month;
    }

    if (req.query.year) {
        logWhere.year = req.query.year;
    }

    if (req.query.company) {
        logWhere.company = req.query.company;
    }

    if (req.query.updatedAt) {
        logWhere.updatedAt = req.query.updatedAt;
    }

    if (Object.keys(logWhere).length === 0) {
        return 'Please provide search parameters';
    }

    const query = "SELECT  distinct cl.id, w.extension, ha.account_id, ha.foreignBalance, cl.action,\n" +
        "concat(ru.firstName , ' ' , ru.surname) AS User,\n" +
        "cl.description, cl.balance, ha.currency, cl.workpaper_id, cl.createdAt      \n" +
        "FROM accounts ha\n" +
        "join capture_logs cl on ha.account_id = cl.account_id\n" +
        "left join users ru on cl.user_id = ru.id\n" +
        "left join workpapers w on w.s3_id= cl.workpaper_id\n" +
        "where ha.account_id = '" + logWhere.account_id + "'\n" +
        "and ha.month  = '" + logWhere.month + "'\n" +
        "and cl.month = '" + logWhere.month + "'\n" +
        "order by createdAt asc;"


    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(logObj => {
            res.status(200).send({logObj});
        }).catch(err => {

            res.status(500).send({message: err.message});
        });
}

async function assignRisk(req, res) {
    const Accounts = db.accounts;
    let accountWhere = {
        id: req.query.id,
    };

    await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
        .then(account => {
            if (account) {
                Accounts.update({
                        risk: req.query.risk
                    },
                    {
                        where: {
                            id: req.query.id
                        }
                    })
            } else {
                res.status(500).send({message: 'Account does not exist'});
            }
        })
        .catch(err => {
        });
    res.status(200).send({message: 'Successfully assigned risk'});
}

async function fetchBulkReviews(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id', c.description as 'description'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (3)\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function getBulkCertifyAccount(req, res) {

    const query = "SELECT distinct ha.account_id, ha.account_name, ha.company_id,la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname)\n" +
        " as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as\n" +
        " 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, C.id as 'capture_id', C.updatedAt, ha.balance, ha.month\n" +
        "        FROM accounts ha\n" +
        "        join capture_logs cl on ha.account_id = cl.account_id\n" +
        "        left join users ru on cl.user_id = ru.id\n" +
        "        left join workpapers w on w.s3_id= cl.workpaper_id and w.status = 1\n" +
        "        left join user_roles ur on ru.id = ur.userId\n" +
        "        left join captures C on cl.capture_id = C.id\n" +
        "        LEFT JOIN linked_accounts la on la.acc_id = ha.id AND la.role = \"reviewer\"\n" +
        "        LEFT JOIN users u on u.id = la.user_id\n" +
        "        LEFT JOIN linked_accounts la2 on la2.acc_id = ha.id AND la2.role = \"preparer\"\n" +
        "        LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "        LEFT JOIN linked_accounts la3 on la3.acc_id = ha.id AND la3.role = \"administrator\"\n" +
        "        LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "        WHERE ha.year = '" + req.query.year + "' AND ha.month = '" + req.query.month + "'\n" +
        "        AND ha.account_id = '" + req.query.account_id + "'\n" +
        "        AND company_id = '" + req.query.company_id + "' ORDER BY ha.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });

}

async function reviewActions(req, res) {

    const query = "select distinct * from capture_logs cl\n" +
        "left join captures c on cl.capture_id = c.id\n" +
        "where cl.action = \"Reject capture\"\n" +
        "and certify = 1\n" +
        "and cl.capture_id  = '" + req.query.capture_id + "'\n" +
        "and status in (1,2)";


    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(logObj => {
            res.status(200).send({logObj});
        }).catch(err => {

            res.status(500).send({message: err.message});
        });
}


async function zeroBalance(data, userId, res) {

    const db = require("../models");
    const Accounts = db.accounts;
    const LinkedAccounts = db.linkedAccounts;
    const Captures = db.captures;

    const keys = [];

    let key = {
        Company: data.Company,
        Year: data.Year,
        Month: data.Month,
        account: data.account,
        AcctName: data.AcctName,
        balance: data.balance,
        currency: data.currency
    }

    keys.push(key);

    let accountWhere, newMonth;

    if (data.Month - 1 === 0) {
        newMonth = 12;

        accountWhere = {
            status: 4,
            year: key.Year - 1,
            month: newMonth,
            balance: 0,
            account_id: key.Company + 'TB.' + key.account
        };
    } else {
        accountWhere = {
            status: 4,
            year: key.Year,
            month: key.Month - 1,
            balance: 0,
            account_id: key.Company + 'TB.' + key.account
        };
    }

    keys.forEach(key => {


        checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
            .then(async firstFilter => {

                if (firstFilter == null) {
                    return;
                }
                const query = "SELECT `id`, `company_id`, `account_id`, `account_name`, `year`, `month`, `balance`, `currency`, `risk`, `status`, `createdAt`, `updatedAt` \n" +
                    "FROM `accounts` AS `accounts` \n" +
                    "WHERE `accounts`.`status` in (1,2) \n" +
                    "AND `accounts`.`year` = '" + key.Year + "' \n" +
                    "AND `accounts`.`month` = '" + key.Month + "' \n" +
                    "AND `accounts`.`balance` = '" + 0 + "'\n" +
                    "AND `accounts`.`account_id` = '" + key.Company + 'TB.' + key.account + "' LIMIT 1";
                await checkDetailsService.dbRequests.customSelectQuery(query)
                    .then(async secondFilter => {

                        if (!secondFilter[0]) {
                            return;
                        }
                        let id = secondFilter[0].id;
                        let year = secondFilter[0].year;
                        let month = secondFilter[0].month;
                        let accountId = secondFilter[0].account_id;
                        let companyId = secondFilter[0].company_id;
                        Accounts.update({
                            status: 3,
                            autoPrepared: true
                        }, {
                            where: {
                                id: id
                            },
                        }).then(account_updated => {
                        }).catch(err => {
                            res.status(500).send({message: err.message});
                        });
                        let captureDetails = {};
                        const captureSelectWhere = {
                            year: year,
                            month: month,
                            account_id: accountId
                        };
                        if (!captureSelectWhere) {
                            return;
                        }
                        await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                            .then(async capture => {
                                if (capture) {

                                    captureDetails = capture;
                                    // LinkedAccounts
                                    //assign if previous account assigned
                                    const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                        "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                        "FROM accounts a\n" +
                                        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                        "LEFT JOIN users u on u.id = la.user_id\n" +
                                        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                        "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                        "WHERE account_id = '" + captureDetails.account_id + "'\n" +
                                        "ORDER BY a.id DESC\n" +
                                        "LIMIT 1";

                                    await checkDetailsService.dbRequests.customSelectQuery(query)
                                        .then(linked_account => {

                                            LinkedAccounts.create({
                                                user_id: userId,
                                                acc_id: linked_account[0].acc_id,
                                                role: 'Default User'
                                            }).then(linked => {
                                            }).catch(err => {
                                                res.status(500).send({message: err.message});
                                            });
                                        }).catch(error => {
                                            res.status(500).send({message: error.message});
                                        });

                                    if (captureDetails == null) {
                                        return;
                                    }
                                    Captures.update({
                                        balance: captureDetails.balance,
                                        status: 3
                                    }, {
                                        where: {
                                            id: captureDetails.id
                                        }
                                    }).then(capture_updated => {
                                        logger.logAction(captureDetails.account_id, userId,
                                            null, 'Auto-Prepared Account',
                                            'Zero Balance', null,
                                            captureDetails.balance, captureDetails.month,
                                            captureDetails.year, companyId, key.currency);
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });
                                } else {

                                    const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                        "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                        "FROM accounts a\n" +
                                        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                        "LEFT JOIN users u on u.id = la.user_id\n" +
                                        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                        "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                        "WHERE account_id = '" + secondFilter[0].account_id + "'\n" +
                                        "ORDER BY a.id DESC\n" +
                                        "LIMIT 1";

                                    await checkDetailsService.dbRequests.customSelectQuery(query)
                                        .then(linked_account => {
                                            LinkedAccounts.create({
                                                user_id: userId,
                                                acc_id: linked_account[0].acc_id,
                                                role: 'Default User'
                                            }).then(linked => {
                                            }).catch(err => {
                                                res.status(500).send({message: err.message});
                                            });
                                        }).catch(error => {
                                            res.status(500).send({message: error.message});
                                        });

                                    Captures.create({
                                        account_id: secondFilter[0].account_id,
                                        description: 'Zero Balance',
                                        allocated_preparer: userId,
                                        allocated_reviewer: null,
                                        balance: secondFilter[0].balance,
                                        month: secondFilter[0].month,
                                        year: secondFilter[0].year,
                                        status: 3,
                                    }).then(capture => {
                                        logger.logAction(secondFilter[0].account_id, userId, null,
                                            'Auto-Prepared Account', 'Zero Balance',
                                            null, secondFilter[0].balance, secondFilter[0].month,
                                            secondFilter[0].year, companyId, key.currency);
                                    }).catch(err => {
                                        res.status(500).send({message: err.message});
                                    });
                                }
                            }).catch(err => {
                                res.status(500).send({message: err.message});
                            });
                    }).catch(error => {
                        res.status(500).send({message: error.message});
                    });
            }).catch(error => {
            res.status(500).send({message: error.message});
        });

    });
}

async function zeroBalanceCount(req, res) {

    const query = "SELECT COUNT(autoPrepared) as count\n" +
        "FROM accounts\n" +
        "where month is not null\n" +
        "and year is not null\n" +
        "and autoPrepared = 1 \n" +
        "and status = 3\n" +
        "and company_id = '" + req.query.company_id + "'\n" +
        "and balance = 0;";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.send({message: "\n" + accounts[0].count + " accounts auto-prepared."});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}


async function zeroBalanceReset(req, res) {

    const db = require("../models");
    const Accounts = db.accounts;

    let query = "SELECT * FROM \n" +
        "accounts \n" +
        "where autoPrepared = true \n" +
        "and company_id = '" + req.query.company_id + "';";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(async accounts => {

            accounts.forEach(account => {

                Accounts.update(
                    {
                        autoPrepared: false
                    }, {
                        where: {
                            id: account.id
                        },
                    }).then(accounts_updated => {
                    res.status(200).send({accounts_updated});
                }).catch(err => {
                });
            });
            res.send({message: accounts.length + " accounts reset."});
        }).catch(error => {
            res.status(500).send({message: error.message});
        });
}

async function balanceSheet(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "AND a.accounts_type = 1\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });

}


async function incomeStatements(req, res) {
    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "AND a.accounts_type = 2\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function balanceSheetCount(req, res) {

    const query = "SELECT COUNT(status) as count\n" +
        "        FROM accounts\n" +
        "        where month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'\n" +
        "        and accounts_type = 1\n" +
        "        and status = 4\n" +
        "        and company_id = '" + req.query.company_id + "'\n" +
        "        union\n" +
        "        SELECT COUNT(status) as count\n" +
        "        FROM accounts\n" +
        "        where month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'\n" +
        "        and accounts_type = 1\n" +
        "        and company_id = '" + req.query.company_id + "'";

    let total;
    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            if (accounts.length === 2) {
                total = accounts[0].count / accounts[1].count * 100;
                res.send({message: Math.round(total)});
            } else {
                if (accounts[0].count === 0) {
                    res.send({message: '0'});
                } else {
                    res.send({message: '100'});
                }
            }
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function incomeStatementCount(req, res) {

    const query = "SELECT COUNT(status) as count\n" +
        "        FROM accounts\n" +
        "        where month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'\n" +
        "        and accounts_type = 2\n" +
        "        and status = 4\n" +
        "        and company_id = '" + req.query.company_id + "'\n" +
        "        union\n" +
        "        SELECT COUNT(status) as count\n" +
        "        FROM accounts\n" +
        "        where month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'\n" +
        "        and accounts_type = 2\n" +
        "        and company_id = '" + req.query.company_id + "'";

    let sum;
    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            if (accounts.length === 2) {
                sum = accounts[0].count / accounts[1].count * 100;
                res.send({message: Math.round(sum)});
            } else {
                if (accounts[0].count === 0) {
                    res.send({message: '0'});
                } else {
                    res.send({message: '100'});
                }
            }
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function switchAccountType(req, res) {
    const Accounts = db.accounts;
    let accountWhere = {
        id: req.query.id,
    };

    await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
        .then(account => {
            if (account) {
                Accounts.update({
                        accounts_type: req.query.accounts_type
                    },
                    {
                        where: {
                            id: req.query.id
                        }
                    })
            } else {
                res.status(500).send({message: 'Account does not exist'});
            }
        })
        .catch(err => {
        });
    res.status(200).send({message: 'Successfully switched account'});
}

async function corporateAccountCertify(data, userId, res) {
    try {
        const db = require("../models");
        const Accounts = db.accounts;
        const LinkedAccounts = db.linkedAccounts;
        const Captures = db.captures;
        const Workpaper = db.workpaper
        const regex = /\((.*?)\)/g;

        const currentMonthKeys = [];
        const keys = [];
        let account_details = {};
        let returnObj = {};

        const d = new Date();
        d.setDate(1);

        const prevMonth = d.toISOString().slice(0, 10);
        const transactionDateFormat = prevMonth.replace('-', '');
        const transactionDate = transactionDateFormat.replace('-', '');

        const sql = require('mssql');
        const sqlConfig = {
            user: process.env.SQL_SERVER_USER_HOST_DATA_WAREHOUSE,
            password: process.env.SQL_SERVER_PASS_DATA_WAREHOUSE,
            server: process.env.DB_DATA_WAREHOUSE,
            database: 'Extract',
            driver: 'msnodesqlv8',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 300000
            },
            options: {
                trustedConnection: process.env.TRUSTED_CONNECTION,
                trustServerCertificate: true
            }
        };

        let key = {
            Company: data.Company,
            Year: data.Year,
            Month: data.Month,
            account: data.account,
            AcctName: data.AcctName,
            balance: data.balance,
            currency: data.currency,
            account_id: data.Company + 'TB.' + data.account,
        }

        keys.push(key);

        let accountWhere, newMonth;

        if (key.Month - 1 === 0) {
            newMonth = 12;

            accountWhere = {
                year: key.Year - 1,
                month: newMonth,
                account_id: key.Company + 'TB.' + key.account
            };
        } else {
            accountWhere = {
                year: key.Year,
                month: key.Month,
                account_id: key.Company + 'TB.' + key.account
            };
        }

        keys.forEach(key => {

            //if (!(key.account_id.includes('2022_HP_LIVE') && key.account_id.includes('FT'))) { // qa
            if (!(key.account_id.includes('2022_HelloPaisa_LIVE') && key.account_id.includes('FT'))) { // prod
                return;
            }
            checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
                .then(async currentMonthAccounts => {

                    const accountName = currentMonthAccounts['dataValues'].account_name

                    const matches = accountName.match(regex);

                    if (matches) {
                        for (const element of matches) {
                            const match = element;
                            const anaNumber = match.substring(1, match.length - 1);  // brackets removing
                            if (anaNumber.includes('3000')) {
                                account_details = {
                                    id: currentMonthAccounts['dataValues'].id,
                                    company_id: currentMonthAccounts['dataValues'].company_id,
                                    account_id: currentMonthAccounts['dataValues'].account_id,
                                    account_name: currentMonthAccounts['dataValues'].account_name,
                                    year: currentMonthAccounts['dataValues'].year,
                                    month: currentMonthAccounts['dataValues'].month,
                                    balance: currentMonthAccounts['dataValues'].balance,
                                    currency: currentMonthAccounts['dataValues'].currency,
                                    status: currentMonthAccounts['dataValues'].status,
                                    accounts_type: currentMonthAccounts['dataValues'].accounts_type,
                                    risk: currentMonthAccounts['dataValues'].risk,
                                    anaNumber: anaNumber,
                                    corporateBalance: ''
                                };
                            }
                        }
                    }

                    if (!(account_details.status === 1 || account_details.status === 2)) {
                        return;
                    }

                    currentMonthKeys.push(account_details);

                    for (const corporateAccounts of currentMonthKeys) {
                        const query = `select distinct sum(atd_Amount) as corporateBalance
                                       FROM [Extract].HelloBank.atd_Acc_Trn_Detail
                                       where ana_Number = '${corporateAccounts.anaNumber}'
                                         and atd_Trans_Date
                                           < '${transactionDate}'`;

                        console.log('corporateAccountsQuery::', query);

                        await sql.on('error', err => {
                            return res.status(403).send({message: err.originalError.info.message});
                        });
                        await sql.connect(sqlConfig).then(pool => {
                            return pool.request().query(query)
                        }).then(result => {
                            returnObj = result['recordset'];
                            corporateAccounts.corporateBalance = returnObj[0].corporateBalance;
                        }).catch(err => {
                            return res.status(403).send({message: err});
                        });


                        if (corporateAccounts.balance == corporateAccounts.corporateBalance) {

                            Accounts.update({
                                status: 3,
                            }, {
                                where: {
                                    id: corporateAccounts.id
                                },
                            }).then(account_updated => {
                            }).catch(err => {
                                return res.status(500).send({message: err.message});
                            });

                            let captureDetails = {};
                            const captureSelectWhere = {
                                year: corporateAccounts.year,
                                month: corporateAccounts.month,
                                account_id: corporateAccounts.account_id
                            };
                            if (!captureSelectWhere) {
                                continue;
                            }
                            await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                                .then(async capture => {
                                    if (capture) {

                                        captureDetails = capture;
                                        // LinkedAccounts
                                        //assign if previous account assigned
                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + captureDetails.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {

                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).then(linked => {
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        if (captureDetails == null) {
                                            return;
                                        }
                                        Workpaper.update({
                                            status: 0
                                        }, {
                                            where: {
                                                linked_capture: captureDetails.id,
                                                status: 1
                                            },
                                        }).then(workpaper_updated => {
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                        Captures.update({
                                            description: 'Corporate Account: Account Balance automatically verified by the system',
                                            status: 3
                                        }, {
                                            where: {
                                                id: captureDetails.id
                                            }
                                        }).then(capture_updated => {
                                            logger.logAction(captureDetails.account_id, userId,
                                                null, 'Account Balance automatically verified by the system',
                                                'Corporate Account', null,
                                                captureDetails.balance, captureDetails.month,
                                                captureDetails.year, corporateAccounts.company_id, corporateAccounts.currency);
                                        }).catch(err => {
                                            return res.status(500).send({message: err.message});
                                        });
                                    } else {

                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + corporateAccounts.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {
                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).then(linked => {
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        Captures.create({
                                            account_id: corporateAccounts.account_id,
                                            description: 'Corporate Account: Account Balance automatically verified by the system',
                                            allocated_preparer: userId,
                                            allocated_reviewer: null,
                                            balance: corporateAccounts.balance,
                                            month: corporateAccounts.month,
                                            year: corporateAccounts.year,
                                            status: 3,
                                        }).then(capture => {
                                            logger.logAction(corporateAccounts.account_id, userId, null,
                                                'Corporate Account', 'Account Balance automatically verified by the system',
                                                null, corporateAccounts.balance, corporateAccounts.month,
                                                corporateAccounts.year, corporateAccounts.company_id, corporateAccounts.currency);
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                    }
                                });
                        }
                    }
                }).catch(err => {
                return res.status(500).send({message: err.message});
            });
        });
        return "Corporate Accounts";
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
    }
}


async function ppiAccountCertify(data, userId, database, res) {
    try {
        const db = require("../models");
        const Accounts = db.accounts;
        const LinkedAccounts = db.linkedAccounts;
        const Captures = db.captures;
        const Workpaper = db.workpaper;


        const keys = [];
        let returnObj = {};
        let company = '';
        let partner_code;

        const sql = require('mssql');
        const sqlConfig = {
            user: process.env.SQL_SERVER_USER_HOST_DATA_WAREHOUSE,
            password: process.env.SQL_SERVER_PASS_DATA_WAREHOUSE,
            server: process.env.DB_DATA_WAREHOUSE,
            database: 'Extract',
            driver: 'msnodesqlv8',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 300000
            },
            options: {
                trustedConnection: process.env.TRUSTED_CONNECTION,
                trustServerCertificate: true
            }
        };

        const d = new Date();
        d.setDate(1);

        const prevMonth = d.toISOString().slice(0, 10);
        const transactionDateFormat = prevMonth.replace('-', '');
        const transactionDate = transactionDateFormat.replace('-', '');

        // prod
        switch (database) {
            case 'Zim_Send':
                company = data.Company;
                break;
            case '2022_DCM_LIVE':
                company = data.Company;
                break;
            case 'Daytona_Malawi_New':
                company = data.Company;
                break;
            case '2022_HelloPaisa_LIVE':
                company = data.Company;
                break;
            case '2022_DC_LIVE': // qa
                company = data.Company;
                break;
            case '2022_HP_LIVE': // qa
                company = data.Company;
                break;
            case 'Malaicha_Logistics_': // prod
                company = data.Company;
                break;
            default:
                return;
        }

        let key = {
            Company: company,
            Year: data.Year,
            Month: data.Month,
            account: data.account,
            AcctName: data.AcctName,
            balance: data.balance,
            currency: data.currency,
            foreignBalance: data.foreignBalance,
            account_id: data.Company + 'TB.' + data.account,
        }

        keys.push(key);

        let accountWhere, newMonth;

        if (key.Month - 1 === 0) {
            newMonth = 12;

            accountWhere = {
                year: key.Year - 1,
                month: newMonth,
                account_id: company + 'TB.' + key.account
            };
        } else {
            accountWhere = {
                year: key.Year,
                month: key.Month,
                account_id: company + 'TB.' + key.account
            };
        }

        for (const key of keys) {

            const query = "SELECT * FROM \n" +
                "ppi_mappings \n" +
                "where account_id = '" + key.account_id + "';";

            await checkDetailsService.dbRequests.customSelectQuery(query)
                .then(mappingTable => {

                    if (mappingTable.length <= 0) {
                        return;
                    }

                    partner_code = mappingTable[0].partner_code;

                    checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
                        .then(async ppiAccounts => {

                            return {
                                id: ppiAccounts['dataValues'].id,
                                company_id: ppiAccounts['dataValues'].company_id,
                                account_id: ppiAccounts['dataValues'].account_id,
                                account_name: ppiAccounts['dataValues'].account_name,
                                year: ppiAccounts['dataValues'].year,
                                month: ppiAccounts['dataValues'].month,
                                balance: ppiAccounts['dataValues'].balance, // recon db
                                currency: ppiAccounts['dataValues'].currency,
                                status: ppiAccounts['dataValues'].status,
                                accounts_type: ppiAccounts['dataValues'].accounts_type,
                                risk: ppiAccounts['dataValues'].risk,
                                current_balance: '', // ppi data warehouse
                                currency_code: '',
                                partner_code: partner_code, // mapping table
                                new_balance: key.balance, // sap LC
                                foreignBalance: key.foreignBalance // sap FC
                            };

                        }).then(async accounts => {

                        const query = `select top 1 current_partner_balance as current_balance, currency_code
                                       from [Extract].[PPI].[ppi_branch_balance_details]
                                       where partner_code = '${accounts.partner_code}'
                                         and created_on
                                           < '${transactionDate}'
                                       order by created_on DESC;`;

                        console.log('ppiQuery::', query);

                        await sql.on('error', err => {
                            return res.status(403).send({message: err.originalError.info.message});
                        });
                        await sql.connect(sqlConfig).then(pool => {
                            return pool.request().query(query)
                        }).then(result => {
                            returnObj = result['recordset'];
                            accounts.current_balance = returnObj[0].current_balance;
                        }).catch(err => {
                            return res.status(403).send({message: err});
                        });

                        if (!(accounts.status === 1 || accounts.status === 2)) {
                            return;
                        }

                        if ((parseFloat(accounts.foreignBalance) || accounts.new_balance) === accounts.current_balance) {

                            Accounts.update({
                                status: 3,
                                foreignBalance: accounts.foreignBalance
                            }, {
                                where: {
                                    id: accounts.id
                                },
                            }).catch(err => {
                                return res.status(500).send({message: err.message});
                            });

                            let captureDetails = {};
                            const captureSelectWhere = {
                                year: accounts.year,
                                month: accounts.month,
                                account_id: accounts.account_id
                            };
                            if (!captureSelectWhere) {
                                return;
                            }
                            await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                                .then(async capture => {
                                    if (capture) {

                                        captureDetails = capture;
                                        // LinkedAccounts
                                        //assign if previous account assigned
                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + captureDetails.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {

                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).then(linked => {
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        if (captureDetails == null) {
                                            return;
                                        }
                                        Workpaper.update({
                                            status: 0
                                        }, {
                                            where: {
                                                linked_capture: captureDetails.id,
                                                status: 1
                                            },
                                        }).then(workpaper_updated => {
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                        Captures.update({
                                            description: 'Account auto-certified, balance matches PPI Branch balance in PPI tables',
                                            status: 3,
                                            foreignBalance: accounts.foreignBalance
                                        }, {
                                            where: {
                                                id: captureDetails.id
                                            }
                                        }).then(async capture_updated => {
                                            logger.logAction(accounts.account_id, userId, null,
                                                'PPI Account', 'Account auto-certified, balance matches PPI Branch balance in PPI tables',
                                                null, accounts.new_balance, accounts.month,
                                                accounts.year, accounts.company_id, accounts.currency, accounts.foreignBalance);
                                        }).catch(err => {
                                            return res.status(500).send({message: err.message});
                                        });
                                    } else {

                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + accounts.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {
                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        Captures.create({
                                            account_id: accounts.account_id,
                                            description: 'Account auto-certified, balance matches PPI Branch balance in PPI tables',
                                            allocated_preparer: userId,
                                            allocated_reviewer: null,
                                            balance: accounts.new_balance,
                                            month: accounts.month,
                                            year: accounts.year,
                                            status: 3,
                                            foreignBalance: accounts.foreignBalance
                                        }).then(async capture => {
                                            logger.logAction(accounts.account_id, userId, null,
                                                'PPI Account', 'Account auto-certified, balance matches PPI Branch balance in PPI tables',
                                                null, accounts.new_balance, accounts.month,
                                                accounts.year, accounts.company_id, accounts.currency, accounts.foreignBalance);
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                    }
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                        }
                    });
                }).catch(err => {
                    res.status(500).send({message: err.message});
                });
        }
        return "PPI Accounts Certified";
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
    }
}


async function ppiAssignPartnercode(req, res) {

    const db = require("../models");
    const Accounts = db.accounts;
    const PPIMapping = db.ppiMapping

    const ppiAccounts = {
        database: req.body.database,
        company: req.body.company,
        account: req.body.account,
        partner_code: req.body.partner_code,
        account_id: req.body.company + 'TB.' + req.body.account
    };
    await Accounts.findOne({
        where: {
            account_id: ppiAccounts.account_id
        }
    }).then(account => {

        if (account !== null) {
            return PPIMapping.create(ppiAccounts).then(async account_created => {
                res.status(200).send({message: account_created});
            }).catch(err => {
                console.error('ppi create error', err);
                res.status(500).send({message: err.message});
            });
        } else {
            return res.status(500).send({message: 'Account Not Found'});
        }

    }).catch(err => {
        console.error('ppi error', err);
        return res.status(500).send({message: err.message});
    });
}

async function dcmAssignAgentId(req, res) {
    const db = require("../models");
    const Accounts = db.accounts;
    const DcmMapping = db.dcmMapping;

    const dcmAccounts = {
        database: req.body.database,
        company: req.body.company,
        account: req.body.account,
        agent_id: req.body.agent_id,
        agent_code: req.body.agent_code,
        account_id: req.body.company + 'TB.' + req.body.account
    };

    try {
        const account = await Accounts.findOne({
            where: {
                account_id: dcmAccounts.account_id
            }
        });

        if (account !== null) {
            return DcmMapping.create(dcmAccounts).then(async account_created => {
                res.status(200).send({message: account_created});
            }).catch(err => {
                console.error('DCM create error', err);
                res.status(500).send({message: err.message});
            });
        } else {
            return res.status(500).send({message: 'Account Not Found'});
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({message: err.message});
    }
}


async function ppiMappings(req, res) {

    const query = "SELECT * FROM ppi_mappings order by id desc";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(ppiMappings => {
            res.status(200).send({ppiMappings});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function deleteMapping(req, res) {

    const query = "DELETE FROM ppi_mappings\n" +
        "WHERE id = '" + req.query.id + "'";

    await checkDetailsService.dbRequests.customDeleteQuery(query)
        .then(ppiMappings => {
            res.status(200).send({ppiMappings});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function searchAgentId(req, res) {

    let agent_id = req.query.agent_id;

    let returnObj = {};

    const sql = require('mssql');
    const sqlConfig = {
        user: process.env.SQL_SERVER_USER_HOST_DATA_WAREHOUSE,
        password: process.env.SQL_SERVER_PASS_DATA_WAREHOUSE,
        server: process.env.DB_DATA_WAREHOUSE,
        database: 'Extract',
        driver: 'msnodesqlv8',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 300000
        },
        options: {
            trustedConnection: process.env.TRUSTED_CONNECTION,
            trustServerCertificate: true
        }
    };

    const agentId = {
        id: null
    };

    const query = `SELECT top 1 ID
                   FROM [Extract].[DCM].[DcmAgentDetails]
                   where Agentid = '${agent_id}'`;

    console.log('query', query);

    await sql.on('error', err => {
        return res.status(403).send({message: err.originalError.info.message});
    });
    await sql.connect(sqlConfig).then(pool => {
        return pool.request().query(query)
    }).then(result => {
        returnObj = result['recordset'];
        agentId.id = returnObj[0].ID;
    }).catch(err => {
        return res.status(403).send({message: err});
    });
    await sql.close();

    const id = agentId.id;

    return res.status(200).send({id});
}

async function dcmMappings(req, res) {

    const query = "SELECT * FROM dcm_mappings order by id desc";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(ppiMappings => {
            res.status(200).send({ppiMappings});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function dcmAutoCertify(data, userId, database, res) {
    try {
        const db = require("../models");
        const Accounts = db.accounts;
        const LinkedAccounts = db.linkedAccounts;
        const Captures = db.captures;
        const Workpaper = db.workpaper;


        const keys = [];
        let returnObj = {};
        let company = '';
        let agent_code;

        const sql = require('mssql');
        const sqlConfig = {
            user: process.env.SQL_SERVER_USER_HOST_DATA_WAREHOUSE,
            password: process.env.SQL_SERVER_PASS_DATA_WAREHOUSE,
            server: process.env.DB_DATA_WAREHOUSE,
            database: 'Extract',
            driver: 'msnodesqlv8',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 300000
            },
            options: {
                trustedConnection: process.env.TRUSTED_CONNECTION,
                trustServerCertificate: true
            }
        };

        const d = new Date();
        d.setDate(1);

        const prevMonth = d.toISOString().slice(0, 10);
        const transactionDateFormat = prevMonth.replace('-', '');
        const transactionDate = transactionDateFormat.replace('-', '');

        // prod     --> DATABASE NAME
        switch (database) {
            case '2022_DC_LIVE': // qa
                company = data.Company;
                break;
                ;
            case '2023_DCM_Live': // prod
                company = data.Company;
                break;
            default:
                return;
        }

        let key = {
            Company: company,
            Year: data.Year,
            Month: data.Month,
            account: data.account,
            AcctName: data.AcctName,
            balance: data.balance,
            currency: data.currency,
            foreignBalance: data.foreignBalance,
            account_id: data.Company + 'TB.' + data.account,
        }

        keys.push(key);

        let accountWhere, newMonth;

        if (key.Month - 1 === 0) {
            newMonth = 12;

            accountWhere = {
                year: key.Year - 1,
                month: newMonth,
                account_id: company + 'TB.' + key.account
            };
        } else {
            accountWhere = {
                year: key.Year,
                month: key.Month,
                account_id: company + 'TB.' + key.account
            };
        }

        for (const key of keys) {

            const query = "SELECT * FROM \n" +
                "dcm_mappings \n" +
                "where account_id = '" + key.account_id + "';";

            await checkDetailsService.dbRequests.customSelectQuery(query)
                .then(mappingTable => {

                    if (mappingTable.length <= 0) {
                        return;
                    }

                    agent_code = mappingTable[0].agent_code;

                    checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
                        .then(async dcmAccounts => {

                            return {
                                id: dcmAccounts['dataValues'].id,
                                status: dcmAccounts['dataValues'].status,
                                company_id: dcmAccounts['dataValues'].company_id,
                                account_id: dcmAccounts['dataValues'].account_id,
                                year: dcmAccounts['dataValues'].year,
                                month: dcmAccounts['dataValues'].month,
                                balance: dcmAccounts['dataValues'].balance, // recon db
                                RemainingUSDBalance: '', // ppi data warehouse
                                agent_code: agent_code, // mapping table
                                new_balance: key.balance, // sap LC
                                foreignBalance: key.foreignBalance // sap FC
                            };

                        }).then(async accounts => {

                        const query = `select top 1 RemainingUSDBalance
                                       from extract.dcm.dcmagentledger
                                       where agentid = '${accounts.agent_code}'
                                         and created_at < '${transactionDate}'
                                       order by id DESC`;

                        console.log('dcmCertifyQuery::', query);

                        await sql.on('error', err => {
                            return res.status(403).send({message: err.originalError.info.message});
                        });
                        await sql.connect(sqlConfig).then(pool => {
                            return pool.request().query(query)
                        }).then(result => {
                            returnObj = result['recordset'];
                            accounts.RemainingUSDBalance = returnObj[0].RemainingUSDBalance;
                        }).catch(err => {
                            return res.status(403).send({message: err});
                        });

                        if (!(accounts.status === 1 || accounts.status === 2)) {
                            return;
                        }


                        if (Math.abs(parseFloat(accounts.foreignBalance)) === Math.abs(accounts.RemainingUSDBalance) ||
                            Math.abs(accounts.new_balance) === Math.abs(accounts.RemainingUSDBalance)) {

                            Accounts.update({
                                status: 3,
                                foreignBalance: accounts.foreignBalance
                            }, {
                                where: {
                                    id: accounts.id
                                },
                            }).catch(err => {
                                return res.status(500).send({message: err.message});
                            });

                            let captureDetails = {};
                            const captureSelectWhere = {
                                year: accounts.year,
                                month: accounts.month,
                                account_id: accounts.account_id
                            };
                            if (!captureSelectWhere) {
                                return;
                            }
                            await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                                .then(async capture => {
                                    if (capture) {

                                        captureDetails = capture;
                                        // LinkedAccounts
                                        //assign if previous account assigned
                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + captureDetails.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {

                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).then(linked => {
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        if (captureDetails == null) {
                                            return;
                                        }
                                        Workpaper.update({
                                            status: 0
                                        }, {
                                            where: {
                                                linked_capture: captureDetails.id,
                                                status: 1
                                            },
                                        }).then(workpaper_updated => {
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                        Captures.update({
                                            description: 'Account auto-certified, balance matches DCM Remaining USD Balance',
                                            status: 3,
                                            foreignBalance: accounts.foreignBalance
                                        }, {
                                            where: {
                                                id: captureDetails.id
                                            }
                                        }).then(async capture_updated => {
                                            logger.logAction(accounts.account_id, userId, null,
                                                'DCM Account', 'Account auto-certified, balance matches DCM Remaining USD Balance',
                                                null, accounts.new_balance, accounts.month,
                                                accounts.year, accounts.company_id, accounts.currency, accounts.foreignBalance);
                                        }).catch(err => {
                                            return res.status(500).send({message: err.message});
                                        });
                                    } else {

                                        const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                            "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                            "FROM accounts a\n" +
                                            "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                            "LEFT JOIN users u on u.id = la.user_id\n" +
                                            "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                            "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                            "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                            "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                            "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                            "WHERE account_id = '" + accounts.account_id + "'\n" +
                                            "ORDER BY a.id DESC\n" +
                                            "LIMIT 1";

                                        await checkDetailsService.dbRequests.customSelectQuery(query)
                                            .then(linked_account => {
                                                LinkedAccounts.create({
                                                    user_id: userId,
                                                    acc_id: linked_account[0].acc_id,
                                                    role: 'Default User'
                                                }).catch(err => {
                                                    res.status(500).send({message: err.message});
                                                });
                                            }).catch(error => {
                                                res.status(500).send({message: error.message});
                                            });

                                        Captures.create({
                                            account_id: accounts.account_id,
                                            description: 'Account auto-certified, balance matches DCM Remaining USD Balance',
                                            allocated_preparer: userId,
                                            allocated_reviewer: null,
                                            balance: accounts.new_balance,
                                            month: accounts.month,
                                            year: accounts.year,
                                            status: 3,
                                            foreignBalance: accounts.foreignBalance
                                        }).then(async capture => {
                                            logger.logAction(accounts.account_id, userId, null,
                                                'DCM Account', 'Account auto-certified, balance matches DCM Remaining USD Balance',
                                                null, accounts.new_balance, accounts.month,
                                                accounts.year, accounts.company_id, accounts.currency, accounts.foreignBalance);
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                    }
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                        }
                    }).catch(err => {
                        res.status(500).send({message: err.message});
                    });
                }).catch(err => {
                    res.status(500).send({message: err.message});
                });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
    }
}


async function deleteDcmMapping(req, res) {

    const query = "DELETE FROM dcm_mappings\n" +
        "WHERE id = '" + req.query.id + "'";

    await checkDetailsService.dbRequests.customDeleteQuery(query)
        .then(ppiMappings => {
            res.status(200).send({ppiMappings});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}


async function lastSync(req, res) {

    const id = req.query.company_id;
    const date = new Date();
    const Companies = db.companies;

    // update last_sync
    Companies.update({
        last_sync: date.toString()
    }, {
        where: {
            id: id
        }
    }).then(companies => {
        res.status(200).send({companies});
    }).catch(err => {
        res.status(500).send({message: err.message});
    });
}

async function lastSync2(companyId, res) {

    const id = companyId;

    const Companies = db.companies;

    const date = new Date();
    // update last_sync
    Companies.update({
        last_sync: date.toString()
    }, {
        where: {
            id: id
        }
    }).catch(err => {
        res.status(500).send({message: err.message});
    });
}

async function loanAccountsMapping(req, res) {

    const query = "SELECT * FROM `loan-accounts-mappings` order by id desc";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(loanAccountsMapping => {
            res.status(200).send({loanAccountsMapping});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function createAccountsLoanMapping(req, res) {
    const db = require("../models");
    const Accounts = db.accounts;
    const LoanAccountMapping = db.loanAccountsMapping;

    const loanAccounts = {
        database1: req.body.database1,
        company1: req.body.company1,
        account1: req.body.account1,
        account_id1: req.body.company1 + 'TB.' + req.body.account1,
        currency1: req.body.currency1,
        database2: req.body.database2,
        company2: req.body.company2,
        account2: req.body.account2,
        account_id2: req.body.company2 + 'TB.' + req.body.account2,
        currency2: req.body.currency2,
    };

    try {
        const account1 = await Accounts.findOne({
            where: {
                account_id: loanAccounts.account_id1
            }
        });

        const account2 = await Accounts.findOne({
            where: {
                account_id: loanAccounts.account_id2
            }
        });

        if (account1 && account2) {
            const account_created = await LoanAccountMapping.create(loanAccounts);
            console.log("account_created:", account_created);
            return res.status(200).send({message: account_created});
        } else {
            return res.status(500).send({message: 'Account Not Found'});
        }
    } catch (err) {
        console.error('loan mapping error', err);
        return res.status(500).send({message: err.message});
    }
}


async function deleteloanAccountsMapping(req, res) {

    const query = "DELETE FROM `loan-accounts-mappings`\n" +
        "WHERE id = '" + req.query.id + "'";

    await checkDetailsService.dbRequests.customDeleteQuery(query)
        .then(loanAccountsMapping => {
            res.status(200).send({loanAccountsMapping});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}


async function loanAccountCertify(data, userId, database, res) {
    try {
        const db = require("../models");
        const Accounts = db.accounts;
        const LinkedAccounts = db.linkedAccounts;
        const Captures = db.captures;
        const Workpaper = db.workpaper;

        const keys = [];
        let company = "";
        let account_id1 = "";
        let account_id2 = "";

        const d = new Date();
        d.setDate(1);

        let key = {
            Company: company,
            Year: data.Year,
            Month: data.Month,
            account: data.account,
            AcctName: data.AcctName,
            balance: data.balance,
            currency: data.currency,
            foreignBalance: data.foreignBalance,
            account_id: data.Company + "TB." + data.account,
        };

        keys.push(key);

        let accountWhere, newMonth;

        if (key.Month - 1 === 0) {
            newMonth = 12;

            accountWhere = {
                year: key.Year - 1,
                month: newMonth,
                account_id: data.Company + "TB." + key.account,
            };
        } else {
            accountWhere = {
                year: key.Year,
                month: key.Month,
                account_id: data.Company + "TB." + key.account,
            };
        }

        for (const key of keys) {
            const query = "SELECT * FROM `loan-accounts-mappings` where account_id1 = '" +
                key.account_id +
                "';";

            await checkDetailsService.dbRequests.customSelectQuery(query).then(async (mappingTable) => {
                if (mappingTable.length <= 0) {
                    return;
                }

                account_id1 = mappingTable[0].account_id1;
                account_id2 = mappingTable[0].account_id2;

                const query1 = "SELECT * FROM \n" +
                    "accounts \n" +
                    "WHERE account_id = '" + account_id1 + "' \n" +
                    "AND month = '" + accountWhere.month + "' \n" +
                    "AND year = '" + accountWhere.year + "';";

                const result1 = await checkDetailsService.dbRequests.customSelectQuery(query1);

                const query2 = "SELECT * FROM \n" +
                    "accounts \n" +
                    "WHERE account_id = '" + account_id2 + "' \n" +
                    "AND month = '" + accountWhere.month + "' \n" +
                    "AND year = '" + accountWhere.year + "';";

                const result2 = await checkDetailsService.dbRequests.customSelectQuery(query2);

                if (!((result1[0].status === 1 || result1[0].status === 2) || (result2[0].status === 1 || result2[0].status === 2))) {
                    return;
                }

                if (Math.abs(result1[0].balance) === Math.abs(result2[0].balance) ||
                    Math.abs(result1[0].balance) === Math.abs(result2[0].foreignBalance) ||
                    Math.abs(result1[0].foreignBalance) === Math.abs(result2[0].balance)) {

                    Accounts.update(
                        {status: 3},
                        {
                            where: {
                                id: [result1[0].id, result2[0].id],
                            },
                        }
                    ).catch(err => {
                        return res.status(500).send({message: err.message});
                    });

                    let captureDetails = {};
                    const captureSelectWhere = {
                        year: [result1[0].year, result2[0].year],
                        month: [result1[0].month, result2[0].month],
                        account_id: [result1[0].account_id, result2[0].account_id]
                    };
                    if (!captureSelectWhere) {
                        return;
                    }
                    await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'all', res)
                        .then(async capture => {
                            if (capture.length > 0) {
                                captureDetails = capture;

                                const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                    "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                    "FROM accounts a\n" +
                                    "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                    "LEFT JOIN users u on u.id = la.user_id\n" +
                                    "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                    "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                    "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                    "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                    "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                    "WHERE account_id in ('" + captureDetails[0].account_id + "','" + captureDetails[1].account_id + "')\n" +
                                    "ORDER BY a.id DESC\n" +
                                    "LIMIT 2";

                                await checkDetailsService.dbRequests.customSelectQuery(query)
                                    .then(linked_account => {
                                        LinkedAccounts.create({
                                            user_id: userId,
                                            acc_id: linked_account[0].acc_id,
                                            role: 'Default User'
                                        }).then(linked => {
                                            LinkedAccounts.create({
                                                user_id: userId,
                                                acc_id: linked_account[1].acc_id,
                                                role: 'Default User'
                                            }).then(linked => {
                                            }).catch(err => {
                                                res.status(500).send({message: err.message});
                                            });
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                    }).catch(error => {
                                        res.status(500).send({message: error.message});
                                    });

                                if (captureDetails == null) {
                                    return;
                                }
                                Workpaper.update({
                                    status: 0
                                }, {
                                    where: {
                                        linked_capture: captureDetails.id,
                                        status: 1
                                    },
                                }).then(workpaper_updated => {
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });

                                Captures.update({
                                    description: 'loan Account auto-certified, balance matches  accounts tables',
                                    status: 3,
                                }, {
                                    where: {
                                        id: [captureDetails[0].id, captureDetails[1].id]
                                    }
                                }).then(async capture_updated => {
                                    logger.logAction(captureDetails[0].account_id, userId, null,
                                        'Loan Account', 'Loan Account auto-certified, balance matches ',
                                        null, captureDetails[0].balance, captureDetails[0].month,
                                        captureDetails[0].year, captureDetails[0].company_id, captureDetails[0].currency, captureDetails[0].foreignBalance);

                                    logger.logAction(captureDetails[1].account_id, userId, null,
                                        'Loan Account', 'Loan Account auto-certified, balance matches ',
                                        null, captureDetails[1].balance, captureDetails[1].month,
                                        captureDetails[1].year, captureDetails[1].company_id, captureDetails[1].currency, captureDetails[1].foreignBalance);
                                }).catch(err => {
                                    return res.status(500).send({message: err.message});
                                });
                            } else {
                                const query = "SELECT a.id as `acc_id`, la.user_id as 'reviewer_id', \n" +
                                    "la2.user_id as 'preparer_id', la3.user_id as 'administrator_id'\n" +
                                    "FROM accounts a\n" +
                                    "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
                                    "LEFT JOIN users u on u.id = la.user_id\n" +
                                    "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
                                    "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
                                    "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
                                    "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
                                    "LEFT JOIN workpapers w on w.linked_account = a.account_id AND w.status = 1\n" +
                                    "WHERE account_id in ('" + result1[0].account_id + "','" + result2[0].account_id + "')\n" +
                                    "ORDER BY a.id DESC\n" +
                                    "LIMIT 2";

                                await checkDetailsService.dbRequests.customSelectQuery(query)
                                    .then(linked_account => {
                                        LinkedAccounts.create({
                                            user_id: userId,
                                            acc_id: linked_account[0].acc_id,
                                            role: 'Default User'
                                        }).then(linked => {
                                            LinkedAccounts.create({
                                                user_id: userId,
                                                acc_id: linked_account[1].acc_id,
                                                role: 'Default User'
                                            }).catch(err => {
                                                res.status(500).send({message: err.message});
                                            });
                                        }).catch(err => {
                                            res.status(500).send({message: err.message});
                                        });
                                    }).catch(error => {
                                        res.status(500).send({message: error.message});
                                    });

                                Captures.create({
                                    account_id: result1[0].account_id,
                                    description: 'Loan Accounts Auto Certify',
                                    allocated_preparer: userId,
                                    allocated_reviewer: null,
                                    balance: result1[0].balance,
                                    month: result1[0].month,
                                    year: result1[0].year,
                                    status: 3,
                                    foreignBalance: result1[0].foreignBalance
                                }).then(async capture => {
                                    logger.logAction(result1[0].account_id, userId, null,
                                        'Loan Account', 'Loan Account auto-certified, balance matches ',
                                        null, result1[0].balance, result1[0].month,
                                        result1[0].year, result1[0].company_id, result1[0].currency, result1[0].foreignBalance);
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });

                                Captures.create({
                                    account_id: result2[0].account_id,
                                    description: 'Loan Accounts Auto Certify',
                                    allocated_preparer: userId,
                                    allocated_reviewer: null,
                                    balance: result2[0].balance,
                                    month: result2[0].month,
                                    year: result2[0].year,
                                    status: 3,
                                    foreignBalance: result2[0].foreignBalance
                                }).then(async capture => {
                                    logger.logAction(result2[0].account_id, userId, null,
                                        'Loan Account', 'Loan Account auto-certified, balance matches ',
                                        null, result2[0].balance, result2[0].month,
                                        result2[0].year, result2[0].company_id, result2[0].currency, result2[0].foreignBalance);
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                            }
                        }).catch(err => {
                            res.status(500).send({message: err.message});
                        });
                }
            }).catch((err) => {
                res.status(500).send({message: err.message});
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
    }
}

async function balanceSheetBalance(req, res) {

    const query = "SELECT sum(balance) as balance \n" +
        "        FROM accounts\n" +
        "        where company_id = '" + req.query.company_id + "'\n" +
        "        and month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'";

    let total;
    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            const balance = accounts[0].balance;
            total = Number(balance).toFixed(2); // Convert to 2 decimal places
            res.send({message: 'TB Balance Check ' + total});
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function incomeStatementBalance(req, res) {

    const query = "SELECT sum(balance) as balance \n" +
        "        FROM accounts\n" +
        "        where company_id = '" + req.query.company_id + "'\n" +
        "        and month = '" + req.query.month + "'\n" +
        "        and year = '" + req.query.year + "'";

    let total;
    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            const balance = accounts[0].balance;
            total = Number(balance).toFixed(2); // Convert to 2 decimal places
            res.send({message: 'TB Balance Check ' + total});
        }).catch(err => {
            return res.status(500).send({message: err.message});
        });
}

async function fetchBulkReviewsIncomeStatement(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (3)\n" +
        "And a.accounts_type = 2\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchBulkReviewsBalanceStatement(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (3)\n" +
        "And a.accounts_type = 1\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchBulkCertifyIncomeStatement(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (1,2)\n" +
        "And a.accounts_type = 2\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchBulkCertifyBalanceStatement(req, res) {

    let role;
    let userWhere = '';
    if (req.query.user) {
        role = await checkDetailsService.dbRequests.getRole(req.query.user);
        userWhere = role.name && role.name === "Administrator" ? "" : "(la.user_id = " + req.query.user + " OR la2.user_id = " + req.query.user + " OR la3.user_id = " + req.query.user + ") AND ";
    }

    const query = "SELECT a.*, la.user_id as 'reviewer_id', CONCAT(u.firstName, ' ', u.surname) as 'reviewer'  , la2.user_id as 'preparer_id', CONCAT(u2.firstName, ' ', u2.surname) as 'preparer', la3.user_id as 'administrator_id', CONCAT(u3.firstName, ' ', u3.surname) as 'administrator', w.s3_id as `workpaper_id`, w.extension as `extension`, c.id as 'capture_id'\n" +
        "FROM accounts a\n" +
        "LEFT JOIN linked_accounts la on la.acc_id = a.id AND la.role = \"reviewer\"\n" +
        "LEFT JOIN users u on u.id = la.user_id\n" +
        "LEFT JOIN linked_accounts la2 on la2.acc_id = a.id AND la2.role = \"preparer\"\n" +
        "LEFT JOIN users u2 on u2.id = la2.user_id\n" +
        "LEFT JOIN linked_accounts la3 on la3.acc_id = a.id AND la3.role = \"administrator\"\n" +
        "LEFT JOIN users u3 on u3.id = la3.user_id\n" +
        "LEFT JOIN captures c on c.account_id = a.account_id AND c.year = '" + req.query.year + "' AND c.month = '" + req.query.month + "'\n" +
        "LEFT JOIN workpapers w on w.linked_capture = c.id AND w.status = 1\n" +
        "WHERE " + userWhere + " a.year = '" + req.query.year + "' AND a.month = '" + req.query.month + "'\n" +
        "And a.status in (1,2)\n" +
        "And a.accounts_type = 1\n" +
        "AND company_id = '" + req.query.company_id + "' ORDER BY a.id ASC";

    await checkDetailsService.dbRequests.customSelectQuery(query)
        .then(accounts => {
            res.status(200).send({accounts});
        }).catch(err => {
            res.status(500).send({message: err.message});
        });
}

async function fetchData2(req, res) {
    let returnObj = {};
    let companyObj = {};
    let database = '';

    //Calculate final day of the month, 2 months back (month-2)
    const d = new Date();
    d.setMonth(d.getMonth() - 1)
    d.setDate(1);
    d.setHours(-1);

    const prevMonth = d.toISOString().slice(0, 10);

    if (req.query.company_id) {
        const where = {
            id: req.query.company_id,
            active: 1
        };

        await checkDetailsService.dbRequests.getCompanies(where, 'one', res)
            .then(companies => {
                companyObj[companies['dataValues'].company_name] = {
                    'database': companies['dataValues'].sql_server_db,
                    'id': companies['dataValues'].id
                }

            }).catch(err => {
                return res.status(500).send({message: err.message});
            });
    } else {
        const where = {active: 1};
        await checkDetailsService.dbRequests.getCompanies(where, 'all', res)
            .then(companies => {
                for (const key in companies) {
                    for (const key2 in companies[key]['dataValues']) {
                        companyObj[companies[key]['dataValues'].company_name] = {
                            'database': companies[key]['dataValues'].sql_server_db,
                            'id': companies[key]['dataValues'].id
                        }
                    }
                }
            }).catch(err => {
                return res.status(500).send({message: err.message});
            });
    }

    for (const key in companyObj) {
        const sql = require('mssql');
        const sqlConfig = {
            user: process.env.SQL_SERVER_USER,
            password: process.env.SQL_SERVER_PASS,
            server: process.env.SQL_SERVER_HOST,
            database: companyObj[key].database,
            driver: 'msnodesqlv8',
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 300000
            },
            options: {
                trustedConnection: process.env.TRUSTED_CONNECTION,
                trustServerCertificate: true
            }
        };
        database = companyObj[key].database;

        if (key === 'Hellostores') {
            const request2 = `select '${key}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], CONCAT (b.Segment_0, b.Segment_1) as account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (fccredit) as foreignBalance, case
                                  when b.ActCurr = '##' then 'ZAR' else b.ActCurr
            end
            as [Account Currency]
                    from [2023_HelloStores].[dbo].[JDT1] as a, [2023_HelloStores].[dbo].[OACT] as b
                    where a.RefDate <= '${prevMonth}' and a.account = b.AcctCode
                    group by a.Account, b.AcctName, b.ActCurr, b.Segment_0, b.Segment_1,
                    CONCAT(b.Segment_0,b.Segment_1)
                    order by account DESC`;

            await sql.on('error', err => {
                return res.status(403).send({message: err.originalError.info.message});
            });
            await sql.connect(sqlConfig).then(pool => {
                return pool.request().query(request2)
            }).then(result => {
                returnObj[companyObj[key].id] = result['recordset'];
            }).catch(err => {
                return res.status(403).send({message: err});
            });
            await sql.close();
        } else {

            const request = `select '${key}' as Company, year ('${prevMonth}') as [Year], month ('${prevMonth}') as [Month], a.account, (b.AcctName), sum (a.debit) - sum (a.credit) as balance, sum (a.fcdebit)- sum (fccredit) as foreignBalance, b.ActCurr as currency
                             from JDT1 as a, OACT as b
                             where a.RefDate <= ('${prevMonth}') and a.account = b.AcctCode
                             group by a.Account, b.AcctName, b.ActCurr
                             order by Account`;

            console.log('SAP Query', request)

            await sql.on('error', err => {
                return res.status(403).send({message: err.originalError.info.message});
            });
            await sql.connect(sqlConfig).then(pool => {
                return pool.request()
                    .query(request)
            }).then(result => {
                returnObj[companyObj[key].id] = result['recordset'];
            }).catch(err => {
                return res.status(403).send({message: err});
            });
            await sql.close();
        }
    }
    const result = await importData2(returnObj, req.user_id, database, res);
    return res.status(200).send({result});
}

async function importData2(data, userId, database, res) {
    const Accounts = db.accounts;
    const Captures = db.captures;
    const Workpaper = db.workpaper;
    let companyName = '';
    let account_created_obj = {};
    let account_type = '2';
    let previousMonthAccounts = {};

    for (const company in data) {

        const companiesWhere = {active: 1, id: company};
        await checkDetailsService.dbRequests.getCompanies(companiesWhere, 'one', res)
            .then(companyDetails => {
                if (!companyDetails) {
                    err_msg["company"] = "Company not found.";
                } else {
                    companyName = companyDetails.company_name;
                }
            }).catch(err => {
                res.status(500).send({message: err.message});
            });

        for (const account in data[company]) {
            let firstChar = data[company][account].account.charAt(0);
            if (['1', '2', '3'].includes(firstChar)) {
                account_type = '1';
            } else {
                account_type = '2';
            }

            const accountWhere = {
                company_id: company,
                year: data[company][account].Year,
                month: data[company][account].Month,
                account_id: companyName + 'TB.' + data[company][account].account
            };

            const accountWherePreviousMonth = {
                company_id: company,
                year: data[company][account].Year,
                month: data[company][account].Month - 1,
                account_id: companyName + 'TB.' + data[company][account].account
            };

            await checkDetailsService.dbRequests.getAccounts(accountWhere, 'one', res)
                .then(async accounts => {

                    let checkExistingAccount = await existingAccount(companyName + 'TB.' + data[company][account].account, parseFloat(data[company][account].balance), data[company][account].Month, res);

                    if (!accounts) {

                        const account_details = {
                            company_id: company,
                            account_id: companyName + 'TB.' + data[company][account].account,
                            account_name: data[company][account].AcctName,
                            year: data[company][account].Year,
                            month: data[company][account].Month,
                            balance: parseFloat(data[company][account].balance),
                            currency: data[company][account].currency,
                            status: 1,
                            risk: 'High',
                            accounts_type: account_type,
                            foreignBalance: parseFloat(data[company][account].foreignBalance)
                        };

                        if (!checkExistingAccount[0]) {
                            Accounts.create(account_details)
                                .then(account_created => {
                                    account_created_obj[account_created.id] = {
                                        account: companyName + 'TB.' + data[company][account].account,
                                        account_id: account_created.id
                                    };
                                    logger.logAction(companyName + 'TB.' + data[company][account].account, 0, null, 'Created Monthly Account', null, null, parseFloat(data[company][account].balance), data[company][account].Month, data[company][account].Year, company);
                                })
                                .catch(err => {
                                    console.error('Accounts create', err);
                                    res.status(500).send({message: err.message});
                                });
                        }

                    } else {
                        if ((parseFloat(accounts.balance) !== parseFloat(data[company][account].balance)) && accounts.balance !== null && data[company][account] !== null) {

                            await checkDetailsService.dbRequests.getAccounts(accountWherePreviousMonth, 'one', res)
                                .then(async prevAccounts => {
                                    if (prevAccounts != null) {
                                        previousMonthAccounts = prevAccounts;
                                    }
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });


                            let captureDetails = {};
                            const captureSelectWhere = {
                                year: data[company][account].Year,
                                month: data[company][account].Month,
                                account_id: companyName + 'TB.' + data[company][account].account
                            };
                            await checkDetailsService.dbRequests.getCaptures(captureSelectWhere, 'one', res)
                                .then(capture => {
                                    if (capture) {
                                        captureDetails = capture;
                                    }
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });

                            Accounts.update({
                                balance: data[company][account].balance,
                                status: 2,
                                foreignBalance: data[company][account].foreignBalance,
                                risk: previousMonthAccounts.risk,
                                accounts_type: previousMonthAccounts.accounts_type
                            }, {
                                where: {
                                    id: accounts.id
                                },
                            }).then(account_updated => {
                            }).catch(err => {
                                res.status(500).send({message: err.message});
                            });

                            if (captureDetails.id) {

                                Workpaper.update({
                                    status: 0
                                }, {
                                    where: {
                                        linked_capture: captureDetails.id,
                                        status: 1
                                    },
                                }).then(workpaper_updated => {
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });

                                Captures.update({
                                    balance: data[company][account].balance,
                                    status: 2,
                                    foreignBalance: data[company][account].foreignBalance
                                }, {
                                    where: {
                                        id: captureDetails.id
                                    }
                                }).then(capture_updated => {
                                }).catch(err => {
                                    res.status(500).send({message: err.message});
                                });
                            }
                            const desc = 'Balance different(Old:' + accounts.currency + ' ' + accounts.balance + '/New:' + data[company][account].currency + ' ' + data[company][account].balance + '). Updating balance and resetting status';
                            logger.logAction(companyName + 'TB.' + data[company][account].account, 0, null, 'Updated Monthly Account', desc, null, data[company][account].balance, data[company][account].Month, data[company][account].Year, company, data[company][account].currency, data[company][account].foreignBalance);

                        }
                    }
                    return accounts;

                }).catch(err => {
                    console.error('getAccounts', err);
                    return res.status(500).send({message: err.message});
                });
        }
        if (Object.keys(account_created_obj).length) {
            //await autoAssignAccounts(Accounts, account_created_obj);
        }
    }
    return "Success";
}










