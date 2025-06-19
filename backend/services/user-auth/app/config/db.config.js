export default {
    HOST: process.env.DB_HOST || "localhost", // Hardcoded default to localhost testing
    USER: process.env.DB_USER || "postgres", // Hardcoded default to localhost testing do not use in production
    PASSWORD: process.env.DB_PASSWORD || "postgres", // Hardcoded default to localhost testing do not use in production
    DB: process.env.DB_NAME || "hypersend", // Hardcoded default to localhost testing
    dialect: "postgres", // Hardcoded default to localhost testing
    port: process.env.DB_PORT || 5432, // Hardcoded default to localhost testing
    schema: process.env.DB_SCHEMA || "public", // Hardcoded default to localhost testing
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};

//TODO: Remove the hardcoded database configuration