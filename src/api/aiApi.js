import axiosInstance from './axiosInstance';

export const aiApi = {
  /**
   * Ask DevPilot AI a question.
   * Calls POST /ai/ask with { question: string }
   * Returns plain text response from backend.
   */
  ask: async (question) => {
    const response = await axiosInstance.post(
      '/ai/ask',
      { question },
      { timeout: 90000 } // Local Ollama LLM inference can take 15-45 seconds depending on hardware
    );
    return response.data;
  },
};

export default aiApi;
