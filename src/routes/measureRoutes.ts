import { Router } from 'express';
import { uploadMeasure, confirmMeasure, listMeasures } from '../controllers/measureController';
import { validateUploadData, validateConfirmData } from '../middlewares/validationMiddleware';

const router = Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Measure API');
});
router.post('/upload', validateUploadData, uploadMeasure);
router.patch('/confirm', validateConfirmData, confirmMeasure);
router.get('/:customer_code/list', listMeasures);

export default router;
