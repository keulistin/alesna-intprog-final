const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true }
    };

    const options = {
        defaultScope: {
            attributes: { exclude: [] }
        }
    };

    return sequelize.define('Department', attributes, options);
} 