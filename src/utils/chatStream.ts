import { GoogleGenerativeAI } from "@google/generative-ai";
import endent from 'endent';

const createPrompt = (inputCode: string): string => {
  return endent`${inputCode}`;
};

export const GeminiStream = async (
  inputCode: string,
  model: string,
  key: string | undefined,
): Promise<ReadableStream> => {
  if (!inputCode) {
    throw new Error('Input code is required');
  }

  const apiKey = key || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!apiKey.startsWith('AIzaSy')) {
    throw new Error('Invalid API key format. Gemini API keys should start with "AIzaSy"');
  }

  try {
    console.log('Initializing Gemini API...');
    // Initialiser l'API Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Créer le prompt
    const prompt = createPrompt(inputCode);
    console.log('Prompt created:', prompt);
    
    // Générer le contenu
    console.log('Generating content...');
    const result = await geminiModel.generateContent(prompt);
    console.log('Content generated, getting response...');
    const response = await result.response;
    console.log('Response received, getting text...');
    const text = response.text();
    console.log('Text extracted successfully');

    // Créer un stream à partir du texte
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        try {
          const chunks = text.split(' ');
          let index = 0;
          
          const sendNextChunk = () => {
            if (index < chunks.length) {
              const chunk = chunks[index] + ' ';
              controller.enqueue(encoder.encode(chunk));
              index++;
              setTimeout(sendNextChunk, 50); // Envoyer le prochain chunk après 50ms
            } else {
              controller.close();
            }
          };
          
          sendNextChunk();
        } catch (error) {
          console.error('Stream Error:', error);
          controller.error(error);
        }
      },
    });

    return stream;
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw error;
  }
};
