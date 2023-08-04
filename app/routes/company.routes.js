const { authJwt } = require("../middleware");
const { verifyCompany } = require("../middleware");
const controller = require("../controllers/company.controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get(
        "/api/company/fetch-companies",
        [authJwt.verifyToken],
        controller.getCompanies
    );
    app.get(
        "/api/company/fetch-active-companies",
        [authJwt.verifyToken],
        controller.fetchActiveCompanies
    );
    app.post(
        "/api/company/assign-company",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.assignCompany
    );
    app.post(
        "/api/company/unassign-company",
        [authJwt.verifyToken, authJwt.isAdmin],
        controller.unAssignCompany
    );
    app.post(
        "/api/company/add-company",
        [authJwt.verifyToken, authJwt.isAdmin, verifyCompany.companyDetails],
        controller.addCompany
    );
    app.post(
        "/api/company/edit-company",
        [authJwt.verifyToken, authJwt.isAdmin, verifyCompany.companyDetails],
        controller.updateCompany
    );
    app.get(
        "/api/company/remove-company",
        [authJwt.verifyToken, authJwt.isAdmin, verifyCompany.companyExists],
        controller.removeCompany
    );
    app.get(
        "/api/company/fetch-company-dates",
        [authJwt.verifyToken, verifyCompany.companyExists],
        controller.fetchCompanyDates
    );
    app.get(
        "/api/company/fetch-company",
        [authJwt.verifyToken],
        controller.fetchCompany
    );
    app.get(
        "/api/company/fetch-loan-company",
        [authJwt.verifyToken],
        controller.fetchLoanCompany
    );
};
