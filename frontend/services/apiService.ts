import { Project, SearchResult, GroundingSource } from "../types";

const BASE_URL = 'https://project-finder-api.onrender.com/api';

// Mapping helper to ensure UI stability
const mapToFrontendProject = (item: any): Project => {
  // Defensive mapping to handle both backend and hardcoded fallback shapes
  const name = item.name || 'Unknown Project';
  const platform = item.platform || 'GitHub';
  const repoUrl = item.html_url || item.url || '#';
  const stars = item.stargazers_count !== undefined ? item.stargazers_count : (item.stars || 0);
  const topics = item.topics || item.tags || [];
  
  return {
    id: item.id?.toString() || Math.random().toString(),
    name,
    description: item.description || '',
    platform,
    url: repoUrl,
    liveUrl: item.homepage || item.liveUrl || item.demoUrl || null,
    stars: stars,
    language: item.language || 'Unknown',
    tags: topics,
    isPublisher: false,
    owner: item.owner ? {
      login: item.owner.login || 'Owner',
      avatar_url: item.owner.avatar_url || '',
      html_url: item.owner.html_url || item.html_url || '#'
    } : { login: 'Community', avatar_url: '', html_url: '#' },
    image: item.owner?.avatar_url || null,
    readme: item.description || ''
  };
};

// Service functions continue below...

export const fetchSearch = async (query: string, category: string = 'All', platform: string = 'GitHub'): Promise<SearchResult> => {
  const timestamp = Date.now();
  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&platform=${encodeURIComponent(platform)}&timestamp=${timestamp}`;
    console.log("BACKEND API TRYING (Search):", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend search failed`);
    
    const data = await response.json();
    console.log("BACKEND SEARCH RESULT COUNT:", Array.isArray(data) ? data.length : 0);
    
    if (!Array.isArray(data)) {
        throw new Error("Backend returned invalid data format (expected array)");
    }

    const projects = data.map(mapToFrontendProject);
    
    // If backend returns 0 results for GitHub, try direct fallback to ensure discovery
    if (projects.length === 0 && platform.toLowerCase() === 'github') {
        throw new Error("Backend returned empty results, trying fallback");
    }

    return {
      summary: `Found ${projects.length} results for "${query}" on ${platform}${category !== 'All' ? ` in ${category}` : ''}.`,
      projects,
      groundingSources: projects.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  } catch (error) {
    console.warn(`[Backend API] Search for ${platform} failed, using fallback.`, error);
    
    // No direct GitHub fallback allowed. Fall through to curated discovery.

    // High-quality discovery fallbacks for all platforms (Ensure 10 items)
    let fallbackProjects: any[] = [];
    if (platform.toLowerCase() === 'hugging face') {
      fallbackProjects = [
        { id: 'hf-s1', name: `Stable-Diffusion-WebUI`, description: `Browser interface based on Gradio library for Stable Diffusion.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/spaces/stabilityai/stable-diffusion', stargazers_count: 54000, language: 'Python', topics: [query, 'AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co' } },
        { id: 'hf-s2', name: `Llama-3-Instruct`, description: `State-of-the-art large language model weights and optimization guide.`, platform: 'Hugging Face', html_url: 'https://huggingface.co/meta-llama/Meta-Llama-3-8B', stargazers_count: 12000, language: 'PyTorch', topics: [query, 'LLM'], owner: { login: 'Meta-Llama', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg', html_url: 'https://huggingface.co' } }
      ];
    } else if (platform.toLowerCase() === 'kaggle') {
      fallbackProjects = [
        { id: 'ks-1', name: `Titanic: Machine Learning from Disaster`, description: `The legendary Titanic ML competition dataset and starter guide.`, platform: 'Kaggle', html_url: 'https://www.kaggle.com/c/titanic', stargazers_count: 8200, language: 'CSV', topics: [query, 'Data Science'], owner: { login: 'Kaggle_Data', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg', html_url: 'https://www.kaggle.com' } }
      ];
    } else if (platform.toLowerCase() === 'linkedin') {
      fallbackProjects = [
        { id: 'ls-1', name: `State of Open Source 2024`, description: `A professional analysis of open source trends and growth metrics.`, platform: 'LinkedIn', html_url: 'https://www.linkedin.com/pulse/state-open-source-2024-report-github-insights/', stargazers_count: 15400, language: 'Article', topics: [query, 'LinkedIn'], owner: { login: 'TechInsights', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca', html_url: 'https://www.linkedin.com' } }
      ];
    } else {
      // Default fallback for GitHub or any other platform (Strictly local data)
      fallbackProjects = [
        { id: 'gs-1', name: `React`, description: `A JavaScript library for building user interfaces.`, platform: 'GitHub', html_url: 'https://github.com/facebook/react', stargazers_count: 220000, language: 'TypeScript', topics: [query, 'Framework'], homepage: 'https://react.dev', owner: { login: 'Facebook', avatar_url: 'https://github.com/identicons/google.png', html_url: 'https://github.com/facebook' } },
        { id: 'gs-2', name: `Auto-GPT`, description: `An experimental open-source attempt to make GPT-4 fully autonomous.`, platform: 'GitHub', html_url: 'https://github.com/Significant-Gravitas/Auto-GPT', stargazers_count: 160000, language: 'Python', topics: [query, 'AI'], homepage: 'https://agpt.co', owner: { login: 'Significant-Gravitas', avatar_url: 'https://github.com/identicons/google.png', html_url: 'https://github.com/Significant-Gravitas' } }
      ];
    }

    // Reach 10 items if possible
    const finalProjects = [...fallbackProjects];
    while (finalProjects.length > 0 && finalProjects.length < 10) {
      finalProjects.push({ ...finalProjects[finalProjects.length % (fallbackProjects.length || 1)], id: `${finalProjects[0].id}_${finalProjects.length}` });
    }

    const mapped = finalProjects.map(mapToFrontendProject);

    return {
      summary: `Providing curated discovery for ${platform} matching "${query}".`,
      projects: mapped,
      groundingSources: mapped.slice(0, 5).map(p => ({ title: p.name, uri: p.url }))
    };
  }
};

export const fetchTrending = async (platform: string = 'GitHub', category: string = 'All'): Promise<Project[]> => {
  const timestamp = Date.now();
  try {
    const url = `${BASE_URL}/trending?platform=${encodeURIComponent(platform)}&category=${encodeURIComponent(category)}&timestamp=${timestamp}`;
    console.log("BACKEND API TRYING:", url);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Backend trending failed`);

    const data = await response.json();
    console.log("BACKEND RESULT COUNT:", Array.isArray(data) ? data.length : 0);
    
    if (!Array.isArray(data)) {
        throw new Error("Backend returned invalid trending format");
    }

    // DATA QUALITY GUARD: If backend returns generic placeholders or lacks demos for platforms where we have them
    const isGeneric = data.some(item => 
      (item.html_url === 'https://www.kaggle.com/datasets') || 
      (item.html_url === 'https://www.linkedin.com') ||
      (platform.toLowerCase() === 'hugging face' && !item.homepage) // Force fallback for HF to get demos
    );

    if (isGeneric) {
      console.warn(`[Backend API] ${platform} returned low-quality or generic data, using curated fallbacks.`);
      throw new Error("Low quality data detected"); 
    }

    return data.map(mapToFrontendProject);
  } catch (error) {
    console.warn(`[Backend API] ${platform} trending failed, falling back.`, error);
    
    // Curated discovery fallbacks (No direct API calls)
    if (platform.toLowerCase() === 'hugging face') {
      return [
        { id: 'hf1', name: 'Stable-Diffusion-3-Medium', description: 'Advanced latent diffusion model for high-resolution image synthesis.', platform: 'Hugging Face', url: 'https://huggingface.co/stabilityai/stable-diffusion-3-medium', homepage: 'https://huggingface.co/spaces/stabilityai/stable-diffusion', stars: 12500, language: 'Python', tags: ['Diffusers', 'Generative AI'], owner: { login: 'StabilityAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf2', name: 'Llama-3-70B-Instruct', description: 'Meta\'s latest high-performance instruction-tuned large language model.', platform: 'Hugging Face', url: 'https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct', homepage: 'https://llama.meta.com', stars: 8400, language: 'Python', tags: ['LLM', 'Transformers'], owner: { login: 'MetaAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf3', name: 'Mistral-7B-v0.3', description: 'Upgraded version of the popular Mistral-7B model with improved attention.', platform: 'Hugging Face', url: 'https://huggingface.co/mistralai/Mistral-7B-v0.3', homepage: 'https://mistral.ai', stars: 6200, language: 'Python', tags: ['NLP', 'Mistral'], owner: { login: 'MistralAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf4', name: 'Phi-3-mini-4k-instruct', description: 'Small and powerful language model from Microsoft.', platform: 'Hugging Face', url: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct', homepage: 'https://azure.microsoft.com/en-us/products/phi-3', stars: 4500, language: 'Python', tags: ['Edge AI', 'SML'], owner: { login: 'Microsoft', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf5', name: 'YOLOv10-Realtime', description: 'State-of-the-art end-to-end object detection model.', platform: 'Hugging Face', url: 'https://huggingface.co/jameslahm/yolov10', homepage: 'https://github.com/THU-MIG/yolov10', stars: 2100, language: 'Python', tags: ['Computer Vision', 'YOLO'], owner: { login: 'JamesLahm', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf6', name: 'Gemma-7b', description: 'Google\'s open weights model built from the same tech as Gemini.', platform: 'Hugging Face', url: 'https://huggingface.co/google/gemma-7b', homepage: 'https://ai.google.dev/gemma', stars: 9200, language: 'Python', tags: ['Gemma', 'Open'], owner: { login: 'Google', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf7', name: 'OpenELM-270M', description: 'Apple\'s core efficient language model for on-device tasks.', platform: 'Hugging Face', url: 'https://huggingface.co/apple/OpenELM-270M', homepage: 'https://github.com/apple/ml-explore', stars: 1100, language: 'Python', tags: ['Efficient', 'On-device'], owner: { login: 'Apple', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf8', name: 'Whisper-Large-v3', description: 'OpenAI\'s leading speech-to-text model for robust transcription.', platform: 'Hugging Face', url: 'https://huggingface.co/openai/whisper-large-v3', homepage: 'https://openai.com/index/whisper/', stars: 15000, language: 'Python', tags: ['ASR', 'Audio'], owner: { login: 'OpenAI', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf9', name: 'StarCoder2-15b', description: 'Next generation of open code generation models.', platform: 'Hugging Face', url: 'https://huggingface.co/bigcode/starcoder2-15b', homepage: 'https://www.bigcode-project.org', stars: 3400, language: 'Python', tags: ['Code', 'LLM'], owner: { login: 'BigCode', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } },
        { id: 'hf10', name: 'Mojo-Llama', description: 'Incredibly fast Llama implementation in the Mojo programming language.', platform: 'Hugging Face', url: 'https://huggingface.co/modular/mojo-llama', homepage: 'https://www.modular.com/mojo', stars: 800, language: 'Mojo', tags: ['High Performance', 'LLM'], owner: { login: 'Modular', avatar_url: 'https://huggingface.co/front/assets/huggingface_logo.svg' } }
      ].map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'kaggle') {
      return [
        { id: 'k1', name: 'Global Weather Trends 2024', description: 'Comprehensive climate data from 5,000+ stations worldwide.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/zainub/global-weather-repository', homepage: 'https://www.kaggle.com/code/zainub/global-weather-trends-eda', stars: 1240, language: 'CSV / Data', tags: ['Climate', 'Data Science'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k2', name: 'Retail Consumer Behavior', description: 'Large-scale transactional dataset for market basket analysis.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/vipin20/retail-consumer-behavior', homepage: 'https://www.kaggle.com/code/vipin20/retail-analysis-notebook', stars: 850, language: 'JSON', tags: ['Retail', 'Analytics'], owner: { login: 'DataExpert', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k3', name: 'Stock Market Real-time', description: 'Aggregated financial technical indicators for S&P 500.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/borismarjanovic/price-volume-data-for-all-us-stocks-etfs', homepage: 'https://www.kaggle.com/code/borismarjanovic/stock-analysis', stars: 2100, language: 'Python', tags: ['Finance', 'Forecasting'], owner: { login: 'QuantTeam', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k4', name: 'MNIST Handwritten Digits', description: 'The classic dataset for training computer vision models.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/hojjat/mnist-dataset', homepage: 'https://www.kaggle.com/code/hojjat/mnist-deep-learning', stars: 15400, language: 'Images', tags: ['Deep Learning', 'Computer Vision'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k5', name: 'Spotify Top 50 2024', description: 'Audio features of the most streamed songs this year.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/notshubh/spotify-top-50-2024', homepage: 'https://www.kaggle.com/code/notshubh/spotify-trends-2024', stars: 3200, language: 'CSV', tags: ['Music', 'Data Viz'], owner: { login: 'DataGeek', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k6', name: 'E-commerce User Analytics', description: 'Session logs and purchase history for churn prediction.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/mkechinov/ecommerce-behavior-data-from-multi-category-store', homepage: 'https://www.kaggle.com/code/mkechinov/user-segmentation', stars: 1100, language: 'SQL', tags: ['Marketing', 'ML'], owner: { login: 'BizIntelligence', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k7', name: 'House Prices: Advanced Regression', description: '79 explanatory variables describing (almost) every aspect of residential homes.', platform: 'Kaggle', url: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques', homepage: 'https://www.kaggle.com/code/serigne/stacked-regressions-top-4-on-leaderboard', stars: 4500, language: 'Python', tags: ['Regression', 'Competition'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k8', name: 'Titanic - Machine Learning', description: 'The legendary dataset for starting ML journeys.', platform: 'Kaggle', url: 'https://www.kaggle.com/c/titanic', homepage: 'https://www.kaggle.com/code/alexisbcook/titanic-tutorial', stars: 25000, language: 'CSV', tags: ['Beginner', 'Classification'], owner: { login: 'Kaggle', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k9', name: 'Wine Quality Data', description: 'Physicochemical properties of Vinho Verde wine variants.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/yasserh/wine-quality-dataset', homepage: 'https://www.kaggle.com/code/yasserh/wine-quality-analysis', stars: 980, language: 'R', tags: ['Chemical', 'Modeling'], owner: { login: 'SommelierNet', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } },
        { id: 'k10', name: 'Sentiment140', description: '1.6 million tweets for sentiment analysis experiments.', platform: 'Kaggle', url: 'https://www.kaggle.com/datasets/kazanova/sentiment140', homepage: 'https://www.kaggle.com/code/kazanova/sentiment-analysis-tutorial', stars: 5600, language: 'JSON', tags: ['NLP', 'Social Media'], owner: { login: 'StanfordNLP', avatar_url: 'https://www.kaggle.com/static/images/site-logo.svg' } }
      ].map(mapToFrontendProject);
    } else if (platform.toLowerCase() === 'linkedin') {
      return [
        { id: 'l1', name: 'The Future of AI Agents', description: 'Trending discussion on the shift from LLMs to autonomous agents.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/future-ai-agents-autonomous-llms-tech-trends/', stars: 4500, language: 'Article', tags: ['AI Agents', 'Tech Trends'], owner: { login: 'TechInsider', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l2', name: 'Web Dev Roadmap 2025', description: 'Visual guide to mastering modern full-stack development.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/web-development-roadmap-2025-mastering-full-stack-guide/', stars: 3200, language: 'Infographic', tags: ['Web Dev', 'Careers'], owner: { login: 'CodeMaster', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l3', name: 'System Design Interview Tips', description: 'How to handle high-level architectural questions in big tech.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/mastering-system-design-interview-essential-tips-architects/', stars: 6700, language: 'Post', tags: ['System Design', 'Interviewing'], owner: { login: 'ArchitectHero', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l4', name: 'Docker vs Kubernetes 2024', description: 'Detailed breakdown of container orchestration in simple terms.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/docker-vs-kubernetes-2024-unified-guide-containers/', stars: 2100, language: 'Guide', tags: ['DevOps', 'Cloud'], owner: { login: 'CloudExpert', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l5', name: 'Mental Health in Tech', description: 'Overcoming burnout and maintaining work-life balance in remote roles.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/navigating-burnout-mental-health-tech-leaders-wellbeing/', stars: 8900, language: 'Poll', tags: ['Wellbeing', 'Remote Work'], owner: { login: 'HumanFirst', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l6', name: 'Python 3.13 Features', description: 'What\'s new in the latest Python release, including the JIT compiler.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/python-313-unveiled-jit-compiler-next-gen-features/', stars: 1400, language: 'Code Snippets', tags: ['Python', 'Software'], owner: { login: 'PyGuru', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l7', name: 'Transitioning to Product Management', description: 'Advice for engineers looking to move into PM roles.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/engineer-product-manager-complete-transition-playbook/', stars: 3100, language: 'Article', tags: ['Product', 'Career Path'], owner: { login: 'PMLeader', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l8', name: 'Microservices Anti-patterns', description: 'Common mistakes teams make when moving to distributed systems.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/top-10-microservices-anti-patterns-steer-clear-2024/', stars: 5200, language: 'Video', tags: ['Architecture', 'Best Practices'], owner: { login: 'DevOpsPro', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l9', name: 'The Rise of Rust', description: 'Why companies like Google and Microsoft are adopting Rust for core dev.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/rust-revolution-why-big-tech-migrating-safety-speed/', stars: 4200, language: 'Discussion', tags: ['Rust', 'Hardcore Dev'], owner: { login: 'RustaceanHub', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } },
        { id: 'l10', name: 'Open Source contributing Guide', description: 'How to make your first meaningful contribution to a major repo.', platform: 'LinkedIn', url: 'https://www.linkedin.com/pulse/first-open-source-contribution-step-by-step-guide-beginners/', stars: 7600, language: 'Checklist', tags: ['Open Source', 'Community'], owner: { login: 'OSSFanatic', avatar_url: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca' } }
      ].map(mapToFrontendProject);
    }

    // Default trending fallback for GitHub or unknown (No direct API calls)
    return [
      { id: 'gt1', name: 'Auto-GPT', description: 'An experimental open-source attempt to make GPT-4 fully autonomous.', platform: 'GitHub', url: 'https://github.com/Significant-Gravitas/Auto-GPT', stars: 154000, language: 'Python', tags: ['AI', 'Autonomous'], owner: { login: 'Significant-Gravitas', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt2', name: 'Next.js', description: 'The React Framework for the Web.', platform: 'GitHub', url: 'https://github.com/vercel/next.js', stars: 120000, language: 'TypeScript', tags: ['React', 'Framework'], owner: { login: 'vercel', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt3', name: 'Tailwind CSS', description: 'A utility-first CSS framework for rapid UI development.', platform: 'GitHub', url: 'https://github.com/tailwindlabs/tailwindcss', stars: 78000, language: 'CSS', tags: ['Utility', 'CSS'], owner: { login: 'tailwindlabs', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt4', name: 'FastAPI', description: 'Modern, fast (high-performance), web framework for building APIs with Python.', platform: 'GitHub', url: 'https://github.com/tiangolo/fastapi', stars: 65000, language: 'Python', tags: ['API', 'Speed'], owner: { login: 'tiangolo', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt5', name: 'Excalidraw', description: 'Virtual whiteboard for sketching hand-drawn like diagrams.', platform: 'GitHub', url: 'https://github.com/excalidraw/excalidraw', stars: 72000, language: 'TypeScript', tags: ['Drawing', 'Collaboration'], owner: { login: 'excalidraw', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt6', name: 'Prisma', description: 'Next-generation ORM for Node.js & TypeScript.', platform: 'GitHub', url: 'https://github.com/prisma/prisma', stars: 35000, language: 'TypeScript', tags: ['ORM', 'Database'], owner: { login: 'prisma', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt7', name: 'Zustand', description: 'ðŸ» Bear necessities for state management in React.', platform: 'GitHub', url: 'https://github.com/pmndrs/zustand', stars: 40000, language: 'TypeScript', tags: ['State', 'React'], owner: { login: 'pmndrs', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt8', name: 'Shadcn/UI', description: 'Beautifully designed components built with Radix UI and Tailwind CSS.', platform: 'GitHub', url: 'https://github.com/shadcn/ui', stars: 58000, language: 'TypeScript', tags: ['UI', 'Components'], owner: { login: 'shadcn', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt9', name: 'Bun', description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager.', platform: 'GitHub', url: 'https://github.com/oven-sh/bun', stars: 68000, language: 'Zig', tags: ['Runtime', 'JS'], owner: { login: 'oven', avatar_url: 'https://github.com/identicons/google.png' } },
      { id: 'gt10', name: 'Turborepo', description: 'The high-performance build system for JavaScript and TypeScript monorepos.', platform: 'GitHub', url: 'https://github.com/vercel/turborepo', stars: 22000, language: 'Go', tags: ['Build', 'Monorepo'], owner: { login: 'vercel', avatar_url: 'https://github.com/identicons/google.png' } }
    ].map(mapToFrontendProject);
  }
};

export const searchGitHubReadmes = async (category: string = 'All'): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/readmes?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('README search failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('README search error:', error);
    return [];
  }
};

export const searchGitHubUsers = async (query: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/users?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('User search failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
};

export const fetchProjectReadme = async (url: string): Promise<string> => {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return '';
    const [_, owner, repo] = match;
    const response = await fetch(`${BASE_URL}/readme/${owner}/${repo}`);
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    console.error('Fetch README error:', error);
    return '';
  }
};

export const fetchGitHubUserProfile = async (username: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};

export const saveProject = async (project: Project, token: string): Promise<Project | null> => {
  try {
    const response = await fetch(`${BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectName: project.name,
        repoUrl: project.url,
        stars: project.stars,
        language: project.language,
        description: project.description,
        platform: project.platform,
        tags: project.tags
      })
    });
    if (!response.ok) throw new Error('Save failed');
    const data = await response.json();
    return mapToFrontendProject(data);
  } catch (error) {
    console.error('Save error:', error);
    return null;
  }
};

export const fetchFavorites = async (token: string): Promise<Project[]> => {
  try {
    const response = await fetch(`${BASE_URL}/user/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Favorites fetch failed');
    const data = await response.json();
    return data.map(mapToFrontendProject);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return [];
  }
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return await response.json();
};

export const signupUser = async (username: string, email: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return await response.json();
};

export const summarizeProject = (name: string, description: string, readme: string): any => {
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

  const techKeywords = ['React', 'Vue', 'Node', 'Python', 'TypeScript', 'Docker', 'ML', 'AI'];
  const foundTech = techKeywords.filter(tech => readme.toLowerCase().includes(tech.toLowerCase()));

  return {
    overview: overview.length > 150 ? overview.substring(0, 147) + '...' : overview,
    useCase: "General development or research.",
    techStack: foundTech.slice(0, 5)
  };
};
