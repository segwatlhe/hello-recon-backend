module.exports = (sequelize, Sequelize) => {
    const Companies = sequelize.define("companies", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        company_name: {
            type: Sequelize.STRING
        },
        sql_server_db: {
            type: Sequelize.STRING
        },
        active: {
            type: Sequelize.INTEGER
        },
        last_sync: {
            type: Sequelize.DATE
        },
        isContolChecked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }
    });
    return Companies;
};
