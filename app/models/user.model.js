module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        firstName: {
            type: Sequelize.STRING
        },
        surname: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.INTEGER
        },
        canReview: {
            type: Sequelize.INTEGER
        }
    });
    return User;
};
