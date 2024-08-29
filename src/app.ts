import express from 'express';
import measureRoutes from './routes/measureRoutes';
import { connectDatabase } from './config/database';
import dotenv from 'dotenv';
import path from 'path';



// Carregar variáveis do arquivo .env
dotenv.config();

const app = express();

app.use(express.json());
app.use('/', measureRoutes);

// Configuração para servir arquivos estáticos
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Exporta a instância do Express
export default app;

// Função para iniciar o servidor
const startServer = async () => {
    await connectDatabase();
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
};

// Inicia o servidor apenas se o arquivo for executado diretamente
if (require.main === module) {
    startServer();
}
