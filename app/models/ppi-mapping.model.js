module.exports = (sequelize, Sequelize) => {
    const PpiMapping = sequelize.define("ppi_mapping", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        database: {
            type: Sequelize.STRING
        },
        company: {
            type: Sequelize.STRING
        },
        account: {
            type: Sequelize.STRING,
            unique: true
        },
        partner_code: {
            type: Sequelize.STRING,
            unique: true
        },
        account_id: {
            type: Sequelize.STRING,
            unique: true
        }
    });
    return PpiMapping;
};
