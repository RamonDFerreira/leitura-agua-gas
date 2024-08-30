import { Request, Response, NextFunction } from 'express';
import { validateUploadData } from '../src/middlewares/validationMiddleware';

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

  it('should return 400 if data is invalid', () => {
    const req = {
      body: {
        image: '',
        customer_code: '',
        measure_datetime: 'invalid_date',
        measure_type: 'INVALID_TYPE'
      }
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    validateUploadData(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "INVALID_DATA",
      error_description: expect.any(String)
    });
  });
});
