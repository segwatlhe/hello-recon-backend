module.exports = (sequelize, Sequelize) => {
    const Capture = sequelize.define("captures", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        description: {
            type: Sequelize.STRING
        },
        account_id: {
            type: Sequelize.STRING
        },
        allocated_preparer: {
            type: Sequelize.INTEGER
        },
        allocated_reviewer: {
            type: Sequelize.INTEGER
        },
        month: {
            type: Sequelize.INTEGER
        },
        year: {
            type: Sequelize.INTEGER
        },
        balance: {
            type: Sequelize.STRING
        },
        foreignBalance: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.INTEGER
        },
        certify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }
    });
    return Capture;
};
