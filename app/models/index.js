const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: config.dialect,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        },
        dialectOptions: {
            //useUTC: false, //for reading from database
            dateStrings: true,
            typeCast: function (field, next) { // for reading from database
                if (field.type === 'DATETIME') {
                    return field.string()
                }
                return next()
            },
        },
        timezone: '+02:00', // for writing to database
    }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.accounts = require("../models/accounts.model.js")(sequelize, Sequelize);
db.companies = require("../models/companies.model.js")(sequelize, Sequelize);
db.linkedCompanies = require("../models/linked-companies.model.js")(sequelize, Sequelize);
db.linkedAccounts = require("../models/linked-accounts.model.js")(sequelize, Sequelize);
db.captureLogs = require("../models/logs.model.js")(sequelize, Sequelize);
db.captures = require("../models/captures.model.js")(sequelize, Sequelize);
db.workpaper = require("../models/workpaper.model.js")(sequelize, Sequelize);
db.ppiMapping = require("../models/ppi-mapping.model.js")(sequelize, Sequelize);
db.dcmMapping = require("../models/dcm-mapping.model.js")(sequelize, Sequelize);
db.loanAccountsMapping = require("../models/loan-accounts-mapping.model")(sequelize, Sequelize);
db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId"
});
db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId"
});
db.ROLES = process.env.ROLES;
module.exports = db;
