import { Router } from 'express';
import { uploadMeasure, confirmMeasure, listMeasures } from '../controllers/measureController';
import { validateUploadData, validateConfirmData } from '../middlewares/validationMiddleware';

const router = Router();

// Rota de boas-vindas para a API
router.get('/', (req, res) => {
  res.send('Welcome to the Measure API');
});

// Rota para upload de uma nova medida
router.post('/upload', validateUploadData, uploadMeasure);

// Rota para confirmar uma medida existente
router.patch('/confirm', validateConfirmData, confirmMeasure);

// Rota para listar as medidas de um cliente específico
router.get('/:customer_code/list', listMeasures);

export default router;
