import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Measure extends Model {
    public customer_code!: string;
    public measure_datetime!: Date;
    public measure_type!: string;
    public measure_value!: number;
    public image_url!: string;
    public measure_uuid!: string;
    public has_confirmed!: boolean;
}

Measure.init({
    customer_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    measure_datetime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    measure_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    measure_value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    measure_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    has_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Measure',
    tableName: 'measures',
    timestamps: false
});
