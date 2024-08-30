import { Sequelize } from 'sequelize';
import { getDbConfig } from './config';

const { name, user, password, host, port, dialect } = getDbConfig();

export const sequelize = new Sequelize(name, user, password, {
    host,
    dialect,
    port,
});

export const connectDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Unable to connect to the database:', error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        } else {
            console.error('An unknown error occurred while connecting to the database.');
            throw new Error('Database connection failed due to an unknown error.');
        }
    }
};
