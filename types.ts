export interface Project {
  name: string;
  description: string;
  platform: 'GitHub' | 'Hugging Face' | 'Kaggle' | 'Other';
  url: string;
  tags: string[];
  stars?: string | number; // Optional simulated star count if available
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface SearchResult {
  summary: string;
  projects: Project[];
  groundingSources: GroundingSource[];
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}