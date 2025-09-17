import api from "./api";

export interface Catalog {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pollsApi = {
  // Catalogs
  async getCatalogs(): Promise<Catalog[]> {
    const response = await api.get("/api/polls/catalogs");
    return response.data.catalogs;
  },

  async createCatalog(data: {
    name: string;
    description?: string;
  }): Promise<Catalog> {
    const response = await api.post("/api/polls/catalogs", data);
    return response.data.catalog;
  },

  async updateCatalog(
    id: number,
    data: { name: string; description?: string }
  ): Promise<Catalog> {
    const response = await api.put(`/api/polls/catalogs/${id}`, data);
    return response.data.catalog;
  },

  async deleteCatalog(id: number): Promise<void> {
    await api.delete(`/api/polls/catalogs/${id}`);
  },

  // Questions
  async getQuestions(catalogId: number): Promise<Question[]> {
    const response = await api.get(`/api/polls/catalogs/${catalogId}/questions`);
    return response.data.questions;
  },

  async createQuestion(
    catalogId: number,
    data: { title: string; content: string }
  ): Promise<Question> {
    const response = await api.post(
      `/api/polls/catalogs/${catalogId}/questions`,
      data
    );
    return response.data.question;
  },

  async updateQuestion(
    id: number,
    data: { title: string; content: string }
  ): Promise<Question> {
    const response = await api.put(`/api/polls/questions/${id}`, data);
    return response.data.question;
  },

  async deleteQuestion(id: number): Promise<void> {
    await api.delete(`/api/polls/questions/${id}`);
  },

  // Options
  async getOptions(questionId: number): Promise<Option[]> {
    const response = await api.get(`/api/polls/questions/${questionId}/options`);
    return response.data.options;
  },

  async createOption(
    questionId: number,
    data: { text: string; isCorrect: boolean }
  ): Promise<Option> {
    const response = await api.post(
      `/api/polls/questions/${questionId}/options`,
      data
    );
    return response.data.option;
  },

  async updateOption(
    id: number,
    data: { text: string; isCorrect: boolean }
  ): Promise<Option> {
    const response = await api.put(`/api/polls/options/${id}`, data);
    return response.data.option;
  },

  async deleteOption(id: number): Promise<void> {
    await api.delete(`/api/polls/options/${id}`);
  },
};
