import { Request, Response, NextFunction } from 'express';
import { validateUploadData } from '../src/middlewares/validationMiddleware';

// Testa se a validação passa para dados corretos
describe('validateUploadData', () => {
  it('should call next() for valid data', () => {
    const req = {
      body: {
        image: 'base64string',
        customer_code: 'customer123',
        measure_datetime: '2024-08-27T10:00:00Z',
        measure_type: 'WATER'
      }
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    validateUploadData(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // Adicione mais testes para verificar erros de validação
});
