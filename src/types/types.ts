export type AIModel = 'gemini-1.5-flash';

export interface ChatBody {
  inputCode: string;
  model: AIModel;
  apiKey?: string | undefined;
}
