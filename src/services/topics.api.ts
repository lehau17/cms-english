import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334/api';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty: string;
  isActive: boolean;
  isFeatured: boolean;
  usageCount: number;
  trendScore: number;
  createdAt: string;
  updatedAt: string;
  isTrending?: boolean;
}

export interface CreateTopicDto {
  name: string;
  description?: string;
  category?: string;
  difficulty: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateTopicDto {
  name?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  usageCount?: number;
  trendScore?: number;
}

export interface TopicFilter {
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  trending?: boolean;
}

class TopicsAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAll(filters?: TopicFilter): Promise<Topic[]> {
    const response = await axios.get(`${API_BASE_URL}/topics`, {
      headers: this.getAuthHeaders(),
      params: filters,
    });
    return response.data;
  }

  async getById(id: string): Promise<Topic> {
    const response = await axios.get(`${API_BASE_URL}/topics/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async create(data: CreateTopicDto): Promise<Topic> {
    const response = await axios.post(`${API_BASE_URL}/topics`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async update(id: string, data: UpdateTopicDto): Promise<Topic> {
    const response = await axios.put(`${API_BASE_URL}/topics/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/topics/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const topicsAPI = new TopicsAPI();
