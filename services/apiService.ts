import { Project, SearchResult, GroundingSource } from "../types";

// Free public APIs - No API keys needed! Safe for GitHub Pages deployment

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  topics: string[];
  stargazers_count: number;
  owner: {
    login: string;
  };
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
    const PUBLISHER_USERNAME = 'chimataraghuram';

    // 1. Search general GitHub
    const generalSearchPromise = fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    // 2. Search specific publisher's repos for the same query
    const publisherSearchPromise = fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+user:${PUBLISHER_USERNAME}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    const [generalRes, publisherRes] = await Promise.all([generalSearchPromise, publisherSearchPromise]);

    let projects: Project[] = [];

    if (publisherRes.ok) {
      const data = await publisherRes.json();
      projects = (data.items || []).map((repo: GitHubRepo) => ({
        name: repo.name,
        description: repo.description || `A ${query} project by the publisher`,
        platform: 'GitHub' as const,
        url: repo.html_url,
        liveUrl: repo.homepage || `https://${PUBLISHER_USERNAME}.github.io/${repo.name}`, // Auto-detect GitHub Pages
        tags: [...(repo.topics || []), 'Publisher', 'GitHub'],
        stars: repo.stargazers_count,
        isPublisher: true
      }));
    }

    if (generalRes.ok) {
      const data = await generalRes.json();
      const generalProjects = (data.items || [])
        .filter((repo: GitHubRepo) => repo.owner.login.toLowerCase() !== PUBLISHER_USERNAME.toLowerCase())
        .map((repo: any) => ({
          name: repo.name,
          description: repo.description || `A ${query} project on GitHub`,
          platform: 'GitHub' as const,
          url: repo.html_url,
          liveUrl: repo.homepage || null, // Capture repo homepage as demo
          tags: [...(repo.topics || []), 'Open Source', 'GitHub'],
          stars: repo.stargazers_count,
          isPublisher: false
        }));

      projects = [...projects, ...generalProjects].slice(0, 8);
    }

    return projects;
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

    const models: any[] = await modelsResponse.json() || [];

    const projects: Project[] = models.slice(0, 4).map((model: any) => ({
      name: model.id || model.modelId || 'Hugging Face Model',
      description: model.pipeline_tag
        ? `A ${model.pipeline_tag} model on Hugging Face${model.author ? ` by ${model.author}` : ''}`
        : `A machine learning model on Hugging Face${model.author ? ` by ${model.author}` : ''}`,
      platform: 'Hugging Face' as const,
      url: `https://huggingface.co/${model.id || model.modelId}`,
      liveUrl: (model.tags || []).includes('spaces') ? `https://huggingface.co/spaces/${model.id}` : null,
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

// Search Kaggle datasets (Improved simulation for better UX)
const searchKaggle = async (query: string): Promise<Project[]> => {
  try {
    const queryLower = query.toLowerCase();
    const commonKaggleDatasets: Record<string, { name: string; description: string; url: string }[]> = {
      'titanic': [
        {
          name: 'Titanic - Machine Learning from Disaster',
          description: 'The classic Titanic dataset for machine learning beginners and survival prediction.',
          url: 'https://www.kaggle.com/c/titanic',
        },
      ],
      'covid': [
        {
          name: 'COVID-19 Dataset (2024 Updated)',
          description: 'Comprehensive global COVID-19 data including vaccination and case trends.',
          url: 'https://www.kaggle.com/datasets/sudalairajkumar/novel-corona-virus-2019-dataset',
        },
      ],
      'credit': [
        {
          name: 'Credit Card Fraud Detection',
          description: 'Anonymized credit card transactions labeled as fraudulent or genuine.',
          url: 'https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud',
        }
      ],
      'stock': [
        {
          name: 'Daily Historical Stock Prices (1970-2024)',
          description: 'Large scale historical stock prices for multiple exchanges.',
          url: 'https://www.kaggle.com/datasets/paultimothymooney/stock-market-data',
        }
      ]
    };

    const projects: Project[] = [];

    // Match curated ones
    const matched = Object.entries(commonKaggleDatasets).find(([key]) => queryLower.includes(key));
    if (matched) {
      projects.push(...matched[1].map(item => ({
        ...item,
        platform: 'Kaggle' as const,
        tags: ['Dataset', 'Kaggle', 'Curated']
      })));
    }

    // Always provide dynamic search cards
    projects.push({
      name: `Kaggle: "${query}" Datasets`,
      description: `Browse 50,000+ public datasets on Kaggle matching your search for "${query}".`,
      platform: 'Kaggle' as const,
      url: `https://www.kaggle.com/datasets?search=${encodeURIComponent(query)}`,
      tags: ['Kaggle', 'Datasets', 'Live Search']
    });

    projects.push({
      name: `Kaggle: "${query}" Notebooks`,
      description: `Explore data science notebooks, tutorials, and code analysis for "${query}".`,
      platform: 'Kaggle' as const,
      url: `https://www.kaggle.com/code?search=${encodeURIComponent(query)}`,
      tags: ['Kaggle', 'Notebooks', 'Python/R']
    });

    return projects;
  } catch (error) {
    console.error('Kaggle search error:', error);
    return [];
  }
};

// Search LinkedIn (Dynamic links for networking and insights)
const searchLinkedIn = async (query: string): Promise<Project[]> => {
  try {
    return [
      {
        name: `LinkedIn Posts: "${query}"`,
        description: `Explore trending posts, expert insights, and community discussions about ${query} on LinkedIn.`,
        platform: 'LinkedIn' as const,
        url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(query)}`,
        tags: ['LinkedIn', 'Social', 'Insights']
      },
      {
        name: `LinkedIn Professionals: "${query}"`,
        description: `Connect with experts and developers specialized in ${query} from across the globe.`,
        platform: 'LinkedIn' as const,
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`,
        tags: ['Networking', 'Experts', 'LinkedIn']
      }
    ];
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return [];
  }
};

// Main search function - combines all platforms
export const searchProjects = async (query: string): Promise<SearchResult> => {
  try {
    // Search all platforms in parallel
    const [githubResults, huggingFaceResults, kaggleResults, linkedinResults] = await Promise.all([
      searchGitHub(query),
      searchHuggingFace(query),
      searchKaggle(query),
      searchLinkedIn(query)
    ]);

    // Interleave results to ensure platform diversity
    const allProjects: Project[] = [];
    const max = Math.max(
      githubResults.length,
      huggingFaceResults.length,
      kaggleResults.length,
      linkedinResults.length
    );

    for (let i = 0; i < max; i++) {
      if (githubResults[i]) allProjects.push(githubResults[i]);
      if (huggingFaceResults[i]) allProjects.push(huggingFaceResults[i]);
      if (kaggleResults[i]) allProjects.push(kaggleResults[i]);
      if (linkedinResults[i]) allProjects.push(linkedinResults[i]);

      if (allProjects.length >= 16) break; // Limit to 16 total results
    }

    // Generate summary
    const platformCounts = {
      github: githubResults.length,
      huggingface: huggingFaceResults.length,
      kaggle: kaggleResults.length,
      linkedin: linkedinResults.length
    };

    let summary = `Results for "${query}": Found ${platformCounts.github} on GitHub, ${platformCounts.huggingface} on Hugging Face, ${platformCounts.kaggle} on Kaggle, and ${platformCounts.linkedin} on LinkedIn. `;

    // GitHub Details
    if (githubResults.length > 0) {
      const topProjects = githubResults.slice(0, 2).map((p) => p.name).join(' and ');
      summary += `Key repositories such as "${topProjects}" provide relevant code resources. `;
    }

    // LinkedIn Details
    if (linkedinResults.length > 0) {
      summary += `High-impact professionals on LinkedIn are sharing social insights and expert perspectives for this topic. `;
    }

    // Hugging Face Details
    if (huggingFaceResults.length > 0) {
      summary += `State-of-the-art models and interactive Spaces are available on Hugging Face. `;
    }

    summary += `We've curated the most impactful codebases, models, datasets, and professional insights for you.`;

    // Extract grounding sources
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
