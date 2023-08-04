module.exports = (sequelize, Sequelize) => {
    const LinkedCompanies = sequelize.define("linked_companies", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        company_id: {
            type: Sequelize.INTEGER
        },

    },{
        timestamps: false
    });
    return LinkedCompanies;
};
