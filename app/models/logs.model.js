module.exports = (sequelize, Sequelize) => {
    const Logger = sequelize.define("capture_logs", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        capture_id: {
            type: Sequelize.INTEGER
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        account_id: {
            type: Sequelize.STRING
        },
        action: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        workpaper_id: {
            type: Sequelize.INTEGER
        },
        balance: {
            type: Sequelize.STRING
        },
        foreignBalance: {
            type: Sequelize.STRING
        },
        year: {
            type: Sequelize.STRING
        },
        month: {
            type: Sequelize.STRING
        },
        company: {
            type: Sequelize.STRING
        },
        currency: {
            type: Sequelize.STRING
        }

    });
    return Logger;
};
