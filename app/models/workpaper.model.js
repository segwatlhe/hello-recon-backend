module.exports = (sequelize, Sequelize) => {
    const Workpaper = sequelize.define("workpapers", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        linked_account: {
            type: Sequelize.STRING
        },
        linked_capture: {
            type: Sequelize.INTEGER
        },
        s3_id: {
            type: Sequelize.INTEGER
        },
        extension: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.INTEGER
        }
    });
    return Workpaper;
};
