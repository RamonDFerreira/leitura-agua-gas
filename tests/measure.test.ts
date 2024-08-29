import request from 'supertest'; 
import app from '../src/app'; // Certifique-se de exportar a aplicação Express de `app.ts`
import { Measure } from '../src/models/measure';

// Mock da função `getGeminiReading`
jest.mock('../src/services/geminiService', () => ({
  getGeminiReading: jest.fn().mockResolvedValue({
    value: 123,
    image_url: 'http://example.com/image.jpg',
    guid: 'uuid-1234'
  })
}));

describe('POST /upload', () => {
  it('should return 200 with the measure details', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        image: 'base64string',
        customer_code: 'customer123',
        measure_datetime: '2024-08-27T10:00:00Z',
        measure_type: 'WATER'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      image_url: 'http://example.com/image.jpg',
      measure_value: 123,
      measure_uuid: 'uuid-1234'
    });
  });

  // Adicione mais testes para verificar erros e condições especiais
});
