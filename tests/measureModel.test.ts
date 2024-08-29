import { Measure } from '../src/models/measure';

describe('Measure Model', () => {
  it('should create a new measure', async () => {
    const measure = await Measure.create({
      customer_code: 'customer123',
      measure_datetime: new Date(),
      measure_type: 'WATER',
      measure_value: 123,
      image_url: 'http://example.com/image.jpg',
      measure_uuid: 'uuid-1234'
    });

    expect(measure.customer_code).toBe('customer123');
    expect(measure.measure_value).toBe(123);
  });

  // Adicione mais testes para verificar outros métodos e validações
});
