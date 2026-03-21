export interface SummaryData {
  overview: string;
  useCase: string;
  techStack: string[];
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  platform: 'GitHub' | 'Hugging Face' | 'Kaggle' | 'LinkedIn' | 'Other';
  url: string;
  tags: string[];
  stars?: string | number;
  isPublisher?: boolean;
  liveUrl?: string;
  demoUrl?: string;
  type?: 'project' | 'readme';
  aiSummary?: SummaryData;
  homepage?: string;
  license?: string;
  stargazers_count?: number;
  forks_count?: number;
  language?: string;
  owner?: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
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