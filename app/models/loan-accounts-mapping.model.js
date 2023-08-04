module.exports = (sequelize, Sequelize) => {
    const loanAccountsMapping = sequelize.define("loan-accounts-mapping", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        database1: {
            type: Sequelize.STRING
        },
        company1: {
            type: Sequelize.STRING
        },
        account1: {
            type: Sequelize.STRING,
            unique: true
        },
        currency1: {
            type: Sequelize.STRING
        },
        account_id1: {
            type: Sequelize.STRING,
            unique: true
        },
        database2: {
            type: Sequelize.STRING
        },
        company2: {
            type: Sequelize.STRING
        },
        account2: {
            type: Sequelize.STRING,
            unique: true
        },
        currency2: {
            type: Sequelize.STRING
        },
        account_id2: {
            type: Sequelize.STRING,
            unique: true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        },

    });
    return loanAccountsMapping;
};
