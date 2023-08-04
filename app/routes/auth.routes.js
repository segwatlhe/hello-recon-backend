const { verifyAuth } = require("../middleware");
const { authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get("/api/auth/token",
        [ authJwt.verifyToken],
        controller.refreshToken
    );
    app.post(
        "/api/auth/add-user",
        [
            authJwt.verifyToken,
            verifyAuth.checkDuplicateUsernameOrEmail,
            verifyAuth.checkRolesExisted,
            verifyAuth.addUser
        ],
        controller.addUser
    );
    app.post("/api/auth/signin", controller.signin);
    app.post("/api/auth/remove-user",
        [ authJwt.verifyToken, authJwt.isAdmin, verifyAuth.removeUser],
        controller.removeUser
    );
    app.post("/api/auth/edit-user",
        [ authJwt.verifyToken, verifyAuth.editUser, verifyAuth.checkDuplicateUsernameOrEmail],
        controller.editUser
    );
    app.post("/api/auth/activate-user",
        [ authJwt.verifyToken, authJwt.isAdmin],
        controller.activateUser
    );
    app.post("/api/users/get-users",
        [ authJwt.verifyToken],
        controller.getUsers
    );
    app.get("/api/auth/can-pickup-reviews",
        [ authJwt.verifyToken, authJwt.isUser],
        controller.pickupReviews
    );
};
