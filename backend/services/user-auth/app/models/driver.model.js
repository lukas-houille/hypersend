export default (sequelize, DataTypes) => {
    return sequelize.define("drivers", {
        driver_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {isEmail: true},
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        driver_license: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        rating: {
            type: DataTypes.DECIMAL(2, 1),
            defaultValue: 0.0,
        },
        address_id: {
            type: DataTypes.BIGINT,
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