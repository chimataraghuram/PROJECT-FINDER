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

// Search GitHub Profile READMEs in real-time

export const searchGitHubReadmes = async (category: string = 'All'): Promise<Project[]> => {
  try {
    const PUBLISHER_USERNAME = 'chimataraghuram';
    let query = 'topic:github-profile-readme';
    
    if (category !== 'All') {
      const categoryMap: Record<string, string> = {
        'Github Actions': 'actions',
        'Game Mode': 'game OR interactive',
        'Code Mode': 'developer OR code',
        'Dynamic Realtime': 'dynamic OR stats',
        'Minimalistic': 'minimal OR simple',
        'GIFS': 'gif OR animated',
        'Anime': 'anime OR otaku',
        'Retro': 'retro OR 8bit',
        'Just Images': 'images OR photo'
      };
      const subQuery = categoryMap[category] || category;
      query += `+${subQuery}`;
    }

    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const items = data.items || [];

    return items.map((repo: any) => ({
      name: repo.owner.login,
      description: repo.description || `A creative GitHub Profile README by ${repo.owner.login}`,
      platform: 'GitHub' as const,
      url: repo.html_url,
      liveUrl: `https://github.com/${repo.owner.login}`,
      tags: [...(repo.topics || []), 'Profile', 'README'],
      stars: repo.stargazers_count,
      isPublisher: repo.owner.login.toLowerCase() === PUBLISHER_USERNAME.toLowerCase()
    }));
  } catch (error) {
    console.error('README search error:', error);
    return [];
  }
};

// Fetch a single GitHub user profile in real-time
export const fetchGitHubUserProfile = async (username: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
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


// Fetch README content from GitHub
export const fetchProjectReadme = async (url: string): Promise<string> => {
  try {
    // Extract owner and repo from URL (https://github.com/owner/repo)
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return '';
    
    const owner = match[1];
    const repo = match[2];
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: { 'Accept': 'application/vnd.github.v3.raw' } }
    );
    
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    console.error('Fetch README error:', error);
    return '';
  }
};

// Advanced Heuristic Summarizer (Smart Extraction)
export const summarizeProject = (name: string, description: string, readme: string): any => {
  // 1. Extract Overview (First paragraph or first 200 chars)
  let overview = description;
  if (readme) {
    const lines = readme.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('!'));
    if (lines.length > 0) {
      overview = lines[0].replace(/\[.*?\]\(.*?\)/g, '').replace(/[*_~`]/g, '').trim();
      if (overview.length < 50 && lines.length > 1) {
        overview += ' ' + lines[1].trim();
      }
    }
  }

  // 2. Extract Tech Stack
  const techKeywords = [
    'React', 'Vue', 'Angular', 'Svelte', 'Node', 'Python', 'Java', 'Django', 'Flask', 'FastAPI',
    'TypeScript', 'JavaScript', 'Rust', 'Go', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'Supabase',
    'Tailwind', 'Next.js', 'Vite', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'PyTorch', 'TensorFlow',
    'Scikit-learn', 'OpenCV', 'NLP', 'LLM', 'Transformers'
  ];
  
  const foundTech = techKeywords.filter(tech => 
    readme.toLowerCase().includes(tech.toLowerCase()) || 
    description.toLowerCase().includes(tech.toLowerCase())
  );

  // 3. Extract Use Case (Look for "Usage", "Why", "Features")
  let useCase = "General purpose development or research.";
  if (readme.toLowerCase().includes('usage')) {
    useCase = "Specifically designed for production-ready implementations and rapid prototyping.";
  } else if (readme.toLowerCase().includes('dataset')) {
    useCase = "Data analysis, machine learning research, and model training.";
  } else if (readme.toLowerCase().includes('api')) {
    useCase = "Backend integration and building programmatic services.";
  }

  return {
    overview: overview.length > 150 ? overview.substring(0, 147) + '...' : overview,
    useCase: useCase,
    techStack: foundTech.slice(0, 5)
  };
};
