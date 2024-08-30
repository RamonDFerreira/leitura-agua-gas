import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Definindo os atributos da medida
interface MeasureAttributes {
    customer_code: string;
    measure_datetime: Date;
    measure_type: string;
    measure_value: number;
    image_url: string;
    measure_uuid: string;
    has_confirmed: boolean;
}

// Atributos opcionais para operações de criação
interface MeasureCreationAttributes extends Optional<MeasureAttributes, 'measure_uuid'> {}

// Classe do Modelo Measure
export class Measure extends Model<MeasureAttributes, MeasureCreationAttributes> implements MeasureAttributes {
    public customer_code!: string;
    public measure_datetime!: Date;
    public measure_type!: string;
    public measure_value!: number;
    public image_url!: string;
    public measure_uuid!: string;
    public has_confirmed!: boolean;
}

// Inicializando o modelo
Measure.init({
    customer_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    measure_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    measure_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    measure_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    measure_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    has_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Measure',
    tableName: 'measures',
    timestamps: false,
});
