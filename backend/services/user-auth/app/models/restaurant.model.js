export default (sequelize, DataTypes) => {
    return sequelize.define("restaurants", {
        restaurant_id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        type: {
            type: DataTypes.BIGINT,
            references: {
                model: "restaurant_type",
                key: "restaurant_type_id",
            },
        },
        address_id: {
            type: DataTypes.BIGINT,
            references: {
                model: "addresses",
                key: "address_id",
            },
        },
        opening_hours: {
            type: DataTypes.TEXT,
        },
        opening_days: {
            type: DataTypes.TEXT,
        },
        rating: {
            type: DataTypes.DECIMAL(2, 1),
            defaultValue: 0.0,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
    });
};