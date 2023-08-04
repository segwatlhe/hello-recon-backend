module.exports = (sequelize, Sequelize) => {
    const LinkedAccounts = sequelize.define("linked_accounts", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        acc_id: {
            type: Sequelize.INTEGER
        },
        role: {
            type: Sequelize.STRING
        },

    },{
        timestamps: false
    });
    return LinkedAccounts;
};
