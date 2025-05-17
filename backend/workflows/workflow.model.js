const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: { 
            type: DataTypes.STRING, 
            allowNull: false,
            validate: {
                isIn: [['Transfer', 'Department Transfer', 'Request Approval', 'RequestApproval', 'Request Edit', 'Onboarding', 'Offboarding']]
            }
        },
        details: { 
            type: DataTypes.TEXT, 
            allowNull: true,
            set(value) {
                // If value is an object or array, JSON stringify it
                if (value !== null && typeof value === 'object') {
                    this.setDataValue('details', JSON.stringify(value));
                } else {
                    this.setDataValue('details', value);
                }
            }
        },
        status: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: 'Pending',
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        }
    };

    const options = {
        defaultScope: {
            attributes: { exclude: [] }
        }
    };

    return sequelize.define('Workflow', attributes, options);
} 