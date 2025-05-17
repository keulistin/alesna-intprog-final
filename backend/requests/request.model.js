const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: { 
            type: DataTypes.STRING, 
            allowNull: false,
            validate: {
                isIn: [['Equipment', 'Leave', 'Training', 'Other']]
            }
        },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Pending',
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected', 'Completed']]
            }
        }
    };

    const options = {
        defaultScope: {
            attributes: { exclude: [] }
        }
    };

    return sequelize.define('Request', attributes, options);
} 