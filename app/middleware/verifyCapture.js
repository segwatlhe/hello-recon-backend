const err_msg = {};

const captureWorkpaper = (req, res, next) => {

    if (!req.body.description) {
        err_msg["description"] = "Description is required"
    }
    if (!req.body.account_id) {
        err_msg["account_id"] = "Account id is required"
    }
    if (!req.body.company_id) {
        err_msg["company_id"] = "Company id is required"
    }
    if (!req.body.year) {
        err_msg["Year"] = "Year is required"
    }
    if (!req.body.month) {
        err_msg["Month"] = "Month is required"
    }
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const updateCapture = (req, res, next) => {

    if (!req.body.description) {
        err_msg["description"] = "Description is required"
    }
    if (!req.body.capture_id) {
        err_msg["capture_id"] = "Capture id is required"
    }
    if (!req.body.status) {
        err_msg["status"] = "Status is required"
    }
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const assignCapture = (req, res, next) => {
    if (!req.body.capture_id) {
        err_msg["capture_id"] = "Capture id is required"
    }
    if (!req.body.role) {
        err_msg["role"] = "Role is required"
    }
    if (!req.body.account_id) {
        err_msg["account_id"] = "Account id is required"
    }
    if (!req.body.company_id) {
        err_msg["company_id"] = "Company id is required"
    }
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};
const fetchWorkpaper = (req, res, next) => {
    if (!req.query.file_id) {
        err_msg["file_id"] = "Workpaper id is required"
    }
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const bulkCertify = (req, res, next) => {
    if (!req.body.capture_id) {
        err_msg["capture_id"] = "Capture id is required"
    }
    if (!req.body.description) {
        err_msg["description"] = "Description is required"
    }
    if (!req.body.status) {
        err_msg["status"] = "Status id is required"
    }
    if (!req.body.action) {
        err_msg["action"] = "Action id is required"
    }
    if (!req.body.certify) {
        err_msg["certify"] = "Certify check is required"
    }

    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};


const bulkReview = (req, res, next) => {

    if (!req.body.capture_id) {
        err_msg["capture_id"] = "Capture id is required"
    }
    if (!req.body.description) {
        err_msg["description"] = "Description is required"
    }
    if (!req.body.status) {
        err_msg["status"] = "Status id is required"
    }
    if (!req.body.action) {
        err_msg["action"] = "Action id is required"
    }

    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const workFlowReset = (req, res, next) => {

    if (!req.body.status) {
        err_msg["status"] = "Status id is required"
    }
    if (Object.keys(err_msg).length) {
        res.status(400).send({
            message: err_msg
        });
        return;
    }
    next();
};

const verifyCapture = {
    captureWorkpaper: captureWorkpaper,
    updateCapture: updateCapture,
    fetchWorkpaper: fetchWorkpaper,
    assignCapture: assignCapture,
    bulkCertify: bulkCertify,
    bulkReview: bulkReview,
    workFlowReset : workFlowReset
};
module.exports = verifyCapture;
