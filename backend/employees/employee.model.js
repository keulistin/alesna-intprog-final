const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: { 
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true
        },
        position: { type: DataTypes.STRING, allowNull: false },
        hireDate: { type: DataTypes.DATE, allowNull: true },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Active',
            validate: {
                isIn: [['Active', 'Inactive', 'On Leave']]
            }
        }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: [] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {} }
        },
        indexes: [
            {
                unique: true,
                fields: ['employeeId']
            }
        ]
    };

    return sequelize.define('Employee', attributes, options);
} 