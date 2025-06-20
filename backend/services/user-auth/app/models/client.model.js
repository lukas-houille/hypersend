// backend/services/user-auth/app/models/client.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define("clients", {
        client_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: "addresses",
                key: "address_id",
            },
        },
        registered_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
    });
};