const { authJwt } = require("../middleware");
const { verifyCapture } = require("../middleware");
const controller = require("../controllers/capture.controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.post(
        "/api/captures/capture-workpaper",
        [authJwt.verifyToken, verifyCapture.captureWorkpaper ],
        controller.captureWorkpaper
    );
    app.post(
        "/api/captures/update-capture",
        [authJwt.verifyToken, verifyCapture.updateCapture ],
        controller.updateCapture
    );
    app.post(
        "/api/captures/assign-capture",
        [authJwt.verifyToken, authJwt.isUser, verifyCapture.assignCapture ],
        controller.assignCapture
    );
    app.get(
        "/api/captures/fetch-workpaper",
        [authJwt.verifyToken, verifyCapture.fetchWorkpaper ],
        controller.fetchWorkpaper
    );
    app.get(
        "/api/captures/fetch-file",
        [authJwt.verifyToken ],
        controller.fetchFile
    );
    app.post(
        "/api/captures/bulk-certify",
        [authJwt.verifyToken, authJwt.isUser, verifyCapture.bulkCertify ],
        controller.bulkCertify
    );
    app.post(
        "/api/captures/bulk-review",
        [authJwt.verifyToken, authJwt.isUser, verifyCapture.bulkReview ],
        controller.bulkReview
    );
    app.post(
        "/api/captures/work-flow-reset",
        [authJwt.verifyToken, authJwt.isAdmin, verifyCapture.workFlowReset ],
        controller.workFlowReset
    );

};
