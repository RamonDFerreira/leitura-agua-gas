import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuration
const api_key = process.env.GEMINI_API_KEY;
if (!api_key) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(api_key);
const generationConfig = { temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 4096 };

// 2. Initialise Model for vision-based generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });

// 3. Generate Content with Image Input
export async function getMeasureValueFromImage(base64Image: string): Promise<number> {
  try {
    // Define parts
    const parts = [
      { text: "Extraia o valor dos medidores de gás e água como um número inteiro. Cada posição é um número. Esse número roda de 0 a 9, sempre em ordem crescente. Quando o número estiver pela metade, avalie quais números podem ser e considere o valor mais baixo:\n" },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      },
    ];

    // Generate content using both text and image input
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const response = await result.response;
    const responseText = await response.text();

    // Log response for debugging
    console.log('Response from Gemini API:', responseText);

    // Extract the number from the response text
    const match = responseText.match(/(\d+(\.\d+)?)/); // Match integer or decimal number

    if (match) {
      const measureValue = parseFloat(match[0]);

      if (isNaN(measureValue)) {
        throw new Error('Response is not a valid number');
      }

      return measureValue;
    } else {
      throw new Error('No valid number found in the response');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to call Gemini API');
  }
}
