const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    
    try {
        // connect to remote database server - no need to create database
        console.log(`Connecting to MySQL database at ${host}`);
        
        // connect to db with explicit host option
        const sequelize = new Sequelize(database, user, password, { 
            host: host,
            dialect: 'mysql',
            dialectOptions: {
                ssl: false
            },
            logging: console.log
        });

        // init models and add them to the exported db object
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        db.Department = require('../departments/department.model')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize);
        db.Workflow = require('../workflows/workflow.model')(sequelize);
        db.Request = require('../requests/request.model')(sequelize);
        db.RequestItem = require('../requests/request-item.model')(sequelize);

        // define relationships
        // Account relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);
        
        // Account - Employee relationship (one-to-one)
        db.Account.hasOne(db.Employee, { foreignKey: 'userId' });
        db.Employee.belongsTo(db.Account, { foreignKey: 'userId', as: 'User' });
        
        // Department - Employee relationship (one-to-many)
        db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });
        db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });
        
        // Employee - Workflow relationship (one-to-many)
        db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
        db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });
        
        // Employee - Request relationship (one-to-many)
        db.Employee.hasMany(db.Request, { foreignKey: 'employeeId' });
        db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });
        
        // Request - RequestItem relationship (one-to-many)
        db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId', as: 'requestItems', onDelete: 'CASCADE' });
        db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

        // sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}
