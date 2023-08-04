const err_msg = {};

const assignAccounts = (req, res, next) => {
    if (!req.body.user_id) {
        err_msg["user_id"] = "User is required"
    }
    if (!req.body.account_id) {
        err_msg["account_id"] = "Account id is required"
    }
    if (!req.body.capture_id) {
        err_msg["capture_id"] = "Capture id is required"
    }
    if (!req.body.company_id) {
        err_msg["company"] = "Company id is required"
    }
    if (!req.body.role) {
        err_msg["role"] = "Role is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const bulkAssignAccounts = (req, res, next) => {

    if (!req.body.update_details) {
        err_msg["update_details"] = "Update details object is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const fetchAccounts = (req, res, next) => {
    if (!req.query.year) {
        err_msg["year"] = 'Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const fetchLogs = (req, res, next) => {

    let params = 0;

    if (req.query.account_id && req.query.account_id !== ''){
        params++;
    }

    if (req.query.capture_id && req.query.capture_id !== '') {
        params++;
    }

    if (req.query.month && req.query.month !== '') {
        params++;
    }

    if (req.query.year && req.query.year !== '') {
        params++;
    }

    if (req.query.company && req.query.company !== '') {
        params++;
    }

    if(params === 0) {
        res.status(400).send({
            message: 'Please provide search parameters'
        });
        return;
    }
    next();
};
const assignRisk = (req, res, next) => {
    if (!req.query.risk) {
        err_msg["risk"] = 'Risk is required' ;
    }
    if (!req.query.id) {
        err_msg["id"] = 'Id is required';
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const getBulkCertifyAccount = (req, res, next) => {
    if (!req.query.year) {
        err_msg["year"] = 'Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Company ID is required"
    }
    if (!req.query.account_id) {
        err_msg["account_id"] = "Account ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const reviewActions = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const zeroBalanceCount = (req, res, next) => {

    if (!req.query.company_id) {
        err_msg["company_id"] = 'CompanyId is required for Count' ;
    }

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const zeroBalanceReset = (req, res, next) => {

    if (!req.query.company_id) {
        err_msg["company_id"] = 'CompanyId is required for Reset' ;
    }

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const balanceSheet = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Balance Sheet Account: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Balance Sheet Account: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Balance Sheet Account: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const incomeStatements = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Income Statement Account: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Income Statement Account: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Income Statement Account: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const balanceSheetCount = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Balance Sheet Accounts: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Balance Sheet Accounts: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Balance Sheet Accounts: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const incomeStatementCount = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Income Statement Accounts: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Income Statement Accounts: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Income Statement Accounts: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const switchAccountType = (req, res, next) => {

    if (!req.query.id) {
        err_msg["id"] = 'Id is required';
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const ppiAssignPartnercode = (req, res, next) => {

    if (!req.body.partner_code) {
        err_msg["partner_code"] = 'Partner Code is required';
    }

    if (!req.body.company) {
        err_msg["company"] = 'Company is required';
    }

    if (!req.body.database) {
        err_msg["database"] = 'Database is required';
    }

    if (!req.body.account) {
        err_msg["account"] = 'Account is required';
    }

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const ppiMappings = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const deleteMapping = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const dcmAssignAgentId = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const searchAgentId = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const dcmMappings = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const deleteDcmMapping = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const deleteloanAccountsMapping = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const lastSync = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const createAccountsLoanMapping = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const loanAccountsMapping = (req, res, next) => {

    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const balanceSheetBalance = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Balance Sheet Accounts: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Balance Sheet Accounts: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Balance Sheet Accounts: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const incomeStatementBalance = (req, res, next) => {

    if (!req.query.year) {
        err_msg["year"] = 'Income Statement Accounts: Year is required' ;
    }
    if (!req.query.month) {
        err_msg["month"] = 'Income Statement Accounts: Month is required';
    }
    if (!req.query.company_id) {
        err_msg["company_id"] = "Income Statement Accounts: Company ID is required"
    }
    if(Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const verifyAccounts = {
    assignAccounts: assignAccounts,
    fetchAccounts: fetchAccounts,
    fetchLogs: fetchLogs,
    bulkAssignAccounts: bulkAssignAccounts,
    assignRisk: assignRisk,
    getBulkCertifyAccount: getBulkCertifyAccount,
    reviewActions: reviewActions,
    zeroBalanceCount: zeroBalanceCount,
    zeroBalanceReset: zeroBalanceReset,
    balanceSheet: balanceSheet,
    incomeStatements: incomeStatements,
    balanceSheetCount : balanceSheetCount,
    incomeStatementCount:incomeStatementCount,
    switchAccountType: switchAccountType,
    ppiAssignPartnercode : ppiAssignPartnercode,
    ppiMappings: ppiMappings,
    deleteMapping: deleteMapping,
    dcmAssignAgentId: dcmAssignAgentId,
    searchAgentId: searchAgentId,
    dcmMappings: dcmMappings,
    deleteDcmMapping: deleteDcmMapping,
    lastSync: lastSync,
    loanAccountsMapping: loanAccountsMapping,
    createAccountsLoanMapping: createAccountsLoanMapping,
    deleteloanAccountsMapping : deleteloanAccountsMapping,
    balanceSheetBalance : balanceSheetBalance,
    incomeStatementBalance : incomeStatementBalance
};
module.exports = verifyAccounts;

