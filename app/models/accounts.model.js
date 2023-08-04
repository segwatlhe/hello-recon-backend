module.exports = (sequelize, Sequelize) => {
    const Account = sequelize.define("accounts", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        company_id: {
            type: Sequelize.INTEGER
        },
        account_id: {
            type: Sequelize.STRING
        },
        account_name: {
            type: Sequelize.STRING
        },
        year: {
            type: Sequelize.INTEGER
        },
        month: {
            type: Sequelize.INTEGER
        },
        balance: {
            type: Sequelize.STRING
        },
        foreignBalance: {
            type: Sequelize.STRING
        },
        currency: {
            type: Sequelize.STRING
        },
        risk: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.INTEGER
        },
        autoPrepared: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        accounts_type: {
            type: Sequelize.STRING
        }
    });
    return Account;
};
