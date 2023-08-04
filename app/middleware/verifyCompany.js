const err_msg = {};

const companyDetails = (req, res, next) => {
    if (!req.body.company_name) {
        err_msg["company_name"] = "Company name is required"
    }
    if (!req.body.company_db) {
        err_msg["company_db"] = "Company database is required"
    }
    if (req.url === '/api/company/update-company') {
        if (!req.body.company_id) {
            err_msg["company_id"] = "Company ID is required"
        }
        if (!req.body.status) {
            err_msg["company_status"] = "Company Status is required"
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
const companyExists = (req, res, next) => {
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
const verifyCompany = {
    companyDetails: companyDetails,
    companyExists: companyExists
};
module.exports = verifyCompany;
