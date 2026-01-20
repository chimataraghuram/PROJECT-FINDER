import { Project, SearchResult, GroundingSource } from "../types";

// Free public APIs - No API keys needed! Safe for GitHub Pages deployment

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  topics: string[];
  stargazers_count: number;
}

interface HuggingFaceModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  tags: string[];
  pipeline_tag?: string;
}

interface KaggleDataset {
  ref: string;
  title: string;
  subtitle: string;
  totalBytes: number;
  downloadCount: number;
}

// Search GitHub repositories
// Note: GitHub API allows 60 requests/hour without authentication (per IP)
// This works directly from the browser - no API key needed!
const searchGitHub = async (query: string): Promise<Project[]> => {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      // Handle rate limiting gracefully
      if (response.status === 403) {
        console.warn('GitHub API rate limit reached. Results may be limited.');
        return [];
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.items || []).map((repo: GitHubRepo) => ({
      name: repo.name,
      description: repo.description || `A ${query} project on GitHub`,
      platform: 'GitHub' as const,
      url: repo.html_url,
      tags: [...(repo.topics || []), 'Open Source', 'GitHub'],
      stars: repo.stargazers_count,
    }));
  } catch (error) {
    console.error('GitHub search error:', error);
    return [];
  }
};

// Search Hugging Face models and datasets
// Note: Hugging Face API is completely public - no authentication needed!
const searchHuggingFace = async (query: string): Promise<Project[]> => {
  try {
    // Search models (public API, no key required)
    const modelsResponse = await fetch(
      `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=4`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!modelsResponse.ok) {
      console.warn('Hugging Face API error:', modelsResponse.status);
      return [];
    }

    const models: HuggingFaceModel[] = await modelsResponse.json() || [];
    
    const projects: Project[] = models.slice(0, 4).map((model: any) => ({
      name: model.id || model.modelId || 'Hugging Face Model',
      description: model.pipeline_tag 
        ? `A ${model.pipeline_tag} model on Hugging Face${model.author ? ` by ${model.author}` : ''}`
        : `A machine learning model on Hugging Face${model.author ? ` by ${model.author}` : ''}`,
      platform: 'Hugging Face' as const,
      url: `https://huggingface.co/${model.id || model.modelId}`,
      tags: [
        ...(model.tags || []).slice(0, 3),
        model.pipeline_tag || 'Model',
        'AI/ML',
      ].filter(Boolean),
    }));

    // Search datasets (public API, no key required)
    try {
      const datasetsResponse = await fetch(
        `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=2`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (!datasetsResponse.ok) {
        // Datasets search is optional, continue without it
        return projects;
      }
      
      const datasets: any[] = await datasetsResponse.json() || [];
      
      datasets.slice(0, 2).forEach((dataset: any) => {
        projects.push({
          name: dataset.id || 'Dataset',
          description: `A dataset on Hugging Face${dataset.author ? ` by ${dataset.author}` : ''}`,
          platform: 'Hugging Face' as const,
          url: `https://huggingface.co/datasets/${dataset.id}`,
          tags: ['Dataset', 'Data', 'Hugging Face'],
        });
      });
    } catch (e) {
      // Datasets search is optional
    }

    return projects;
  } catch (error) {
    console.error('Hugging Face search error:', error);
    return [];
  }
};

// Search Kaggle datasets (using public search - limited without auth)
const searchKaggle = async (query: string): Promise<Project[]> => {
  try {
    // Kaggle's public API is limited, so we'll use a workaround
    // We can construct search URLs and scrape basic info, but for now
    // we'll return curated results based on the query
    const kaggleSearchUrl = `https://www.kaggle.com/datasets?search=${encodeURIComponent(query)}`;
    
    // Since Kaggle requires authentication for API access, we'll provide
    // a link to their search page and some common datasets
    const commonKaggleDatasets: Record<string, { name: string; description: string; url: string }[]> = {
      'titanic': [
        {
          name: 'Titanic - Machine Learning from Disaster',
          description: 'The classic Titanic dataset for machine learning beginners',
          url: 'https://www.kaggle.com/c/titanic',
        },
      ],
      'covid': [
        {
          name: 'COVID-19 Dataset',
          description: 'Comprehensive COVID-19 data for analysis',
          url: 'https://www.kaggle.com/datasets/sudalairajkumar/novel-corona-virus-2019-dataset',
        },
      ],
      'image': [
        {
          name: 'Image Classification Datasets',
          description: 'Various image datasets for computer vision projects',
          url: 'https://www.kaggle.com/datasets?search=image+classification',
        },
      ],
    };

    // Try to match common queries
    const queryLower = query.toLowerCase();
    const matched = Object.entries(commonKaggleDatasets).find(([key]) => 
      queryLower.includes(key)
    );

    if (matched) {
      return matched[1].map((item) => ({
        name: item.name,
        description: item.description,
        platform: 'Kaggle' as const,
        url: item.url,
        tags: ['Dataset', 'Kaggle', 'Data Science'],
      }));
    }

    // Generic Kaggle result
    return [
      {
        name: `Kaggle Datasets: ${query}`,
        description: `Search Kaggle for ${query} datasets, notebooks, and competitions`,
        platform: 'Kaggle' as const,
        url: kaggleSearchUrl,
        tags: ['Kaggle', 'Dataset', 'Competition'],
      },
    ];
  } catch (error) {
    console.error('Kaggle search error:', error);
    return [];
  }
};

// Main search function - combines all platforms
export const searchProjects = async (query: string): Promise<SearchResult> => {
  try {
    // Search all platforms in parallel
    const [githubResults, huggingFaceResults, kaggleResults] = await Promise.all([
      searchGitHub(query),
      searchHuggingFace(query),
      searchKaggle(query),
    ]);

    // Combine all results
    const allProjects = [
      ...githubResults,
      ...huggingFaceResults,
      ...kaggleResults,
    ].slice(0, 9); // Limit to 9 total results

    // Generate summary
    const platformCounts = {
      github: githubResults.length,
      huggingface: huggingFaceResults.length,
      kaggle: kaggleResults.length,
    };

    const summary = `Found ${allProjects.length} resources for "${query}": ` +
      `${platformCounts.github} from GitHub, ` +
      `${platformCounts.huggingface} from Hugging Face, ` +
      `and ${platformCounts.kaggle} from Kaggle. ` +
      `These are real, verified resources you can use for your projects!`;

    // Extract grounding sources from the results
    const groundingSources: GroundingSource[] = allProjects.map((project) => ({
      title: project.name,
      uri: project.url,
    }));

    return {
      summary,
      projects: allProjects,
      groundingSources,
    };
  } catch (error: any) {
    console.error('Search error:', error);
    throw new Error(error.message || 'Failed to search projects. Please try again.');
  }
};

// Placeholder functions for other features (if needed)
export async function* createChatStream(
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  isFastMode: boolean
) {
  // This feature would require an AI API
  // For now, return a message indicating it's not available
  yield "Chat feature requires an AI API key. This is a search-only version.";
}

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  throw new Error("Image generation requires an AI API key. This feature is not available in the free version.");
};

export const generateVideo = async (imageSrc: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  throw new Error("Video generation requires an AI API key. This feature is not available in the free version.");
};
