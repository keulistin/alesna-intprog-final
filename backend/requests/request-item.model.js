const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        quantity: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        }
    };

    const options = {
        defaultScope: {
            attributes: { exclude: [] }
        }
    };

    return sequelize.define('RequestItem', attributes, options);
} 