import { getMeasureValueFromImage } from '../src/services/geminiService';
import axios from 'axios';

jest.mock('axios');

describe('getGeminiReading', () => {
  it('should fetch reading from Gemini API', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        value: 123,
        image_url: 'http://example.com/image.jpg',
        guid: 'uuid-1234'
      }
    });

    const result = await getMeasureValueFromImage('base64string');

    expect(result).toEqual({
      value: 123,
      image_url: 'http://example.com/image.jpg',
      guid: 'uuid-1234'
    });
  });

  // Adicione mais testes para verificar erros e respostas inesperadas
});
