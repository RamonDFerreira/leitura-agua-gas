import { Dialect } from 'sequelize';

interface DbConfig {
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    dialect: Dialect;
}

export const getDbConfig = (): DbConfig => ({
    name: process.env.DB_NAME || 'measures',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres' as Dialect,
});
