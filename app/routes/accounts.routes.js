const {authJwt, verifyCapture} = require("../middleware");
const {verifyAccounts} = require("../middleware");
const {verifyCompany} = require("../middleware");
const controller = require("../controllers/accounts.controller");
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get(
        "/api/accounts/sync-data",
        [authJwt.verifyToken, authJwt.isImporterOrAdmin],
        controller.importAccounts
    );
    app.get(
        "/api/accounts/fetch-accounts",
        [authJwt.verifyToken],
        controller.fetchAccounts
    );
    app.post(
        "/api/accounts/assign-account",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.assignAccounts ],
        controller.assignAccounts
    );
    app.post(
        "/api/accounts/bulk-assign-accounts",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.bulkAssignAccounts ],
        controller.bulkAssignAccounts
    );
    app.get(
        "/api/accounts/fetch-logs",
        [authJwt.verifyToken, verifyAccounts.fetchLogs ],
        controller.fetchLogs
    );
    app.get(
        "/api/accounts/assign-risk",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.assignRisk ],
        controller.assignRisk
    );
    app.get(
        "/api/accounts/fetch-bulk-accounts",
        [authJwt.verifyToken],
        controller.fetchBulkAccounts
    );
    app.get(
        "/api/accounts/fetch-work-reset-accounts",
        [authJwt.verifyToken , authJwt.isAdmin],
        controller.fetchWorkResetAccounts
    );
    app.get(
        "/api/accounts/fetch-bulk-reviews",
        [authJwt.verifyToken],
        controller.fetchBulkReviews
    );
    app.get(
        "/api/accounts/bulk-certify-account",
        [authJwt.verifyToken, verifyAccounts.getBulkCertifyAccount],
        controller.getBulkCertifyAccount
    );
    app.get(
        "/api/accounts/reviewActions",
        [authJwt.verifyToken, verifyAccounts.reviewActions ],
        controller.reviewActions
    );
    app.get(
        "/api/accounts/zero-balance-count",
        [authJwt.verifyToken, verifyAccounts.zeroBalanceCount],
        controller.zeroBalanceCount
    );
    app.get(
        "/api/accounts/zero-balance-reset",
        [authJwt.verifyToken, verifyAccounts.zeroBalanceReset],
        controller.zeroBalanceReset
    );
    app.get(
        "/api/accounts/balance-sheet",
        [authJwt.verifyToken, verifyAccounts.balanceSheet],
        controller.balanceSheet
    );
    app.get(
        "/api/accounts/income-statements",
        [authJwt.verifyToken, verifyAccounts.incomeStatements],
        controller.incomeStatements
    );
    app.get(
        "/api/accounts/balance-sheet-count",
        [authJwt.verifyToken, verifyAccounts.balanceSheetCount],
        controller.balanceSheetCount
    );
    app.get(
        "/api/accounts/income-statement-count",
        [authJwt.verifyToken, verifyAccounts.incomeStatementCount],
        controller.incomeStatementCount
    );
    app.get(
        "/api/accounts/switch-account-type",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.switchAccountType],
        controller.switchAccountType
    );
    app.post(
        "/api/accounts/ppi-assign-partnercode",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.ppiAssignPartnercode ],
        controller.ppiAssignPartnercode
    );
    app.get(
        "/api/accounts/ppi-mappings",
        [authJwt.verifyToken, verifyAccounts.ppiMappings],
        controller.ppiMappings
    );
    app.get(
        "/api/accounts/delete-mapping",
        [authJwt.verifyToken, verifyAccounts.deleteMapping],
        controller.deleteMapping
    );
    app.post(
        "/api/accounts/dcm-assign-agent_id",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.dcmAssignAgentId ],
        controller.dcmAssignAgentId
    );
    app.get(
        "/api/accounts/search-agent-id",
        [authJwt.verifyToken, verifyAccounts.searchAgentId],
        controller.searchAgentId
    );
    app.get(
        "/api/accounts/dcm-mappings",
        [authJwt.verifyToken, verifyAccounts.dcmMappings],
        controller.dcmMappings
    );
    app.get(
        "/api/accounts/delete-dcm-mapping",
        [authJwt.verifyToken, verifyAccounts.deleteDcmMapping],
        controller.deleteDcmMapping
    );
    app.get(
        "/api/accounts/last-sync",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.lastSync],
        controller.lastSync
    );
    app.post(
        "/api/accounts/loan-account-assign",
        [authJwt.verifyToken, authJwt.isAdmin, verifyAccounts.createAccountsLoanMapping ],
        controller.createAccountsLoanMapping
    );
    app.get(
        "/api/accounts/loan-accounts-mappings",
        [authJwt.verifyToken, verifyAccounts.loanAccountsMapping],
        controller.loanAccountsMapping
    );
    app.get(
        "/api/accounts/delete-loan-accounts-mapping",
        [authJwt.verifyToken, verifyAccounts.deleteloanAccountsMapping],
        controller.deleteloanAccountsMapping
    );
    app.get(
        "/api/accounts/balance-sheet-balance",
        [authJwt.verifyToken, verifyAccounts.balanceSheetBalance],
        controller.balanceSheetBalance
    );
    app.get(
        "/api/accounts/income-statement-balance",
        [authJwt.verifyToken, verifyAccounts.incomeStatementBalance],
        controller.incomeStatementBalance
    );
    app.get(
        "/api/accounts/fetch-bulk-reviews-income-statement",
        [authJwt.verifyToken],
        controller.fetchBulkReviewsIncomeStatement
    );
    app.get(
        "/api/accounts/fetch-bulk-reviews-balance-statement",
        [authJwt.verifyToken],
        controller.fetchBulkReviewsBalanceStatement
    );
    app.get(
        "/api/accounts/fetch-certify-income-statement",
        [authJwt.verifyToken],
        controller.fetchBulkCertifyIncomeStatement
    );
    app.get(
        "/api/accounts/fetch-certify-balance-statement",
        [authJwt.verifyToken],
        controller.fetchBulkCertifyBalanceStatement
    );
    app.get(
        "/api/accounts/sync-data2",
        [authJwt.verifyToken, authJwt.isImporterOrAdmin],
        controller.importAccounts2
    );
};
