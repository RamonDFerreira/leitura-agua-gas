import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'measures',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'db',
        dialect: 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
    }
);

export const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};
