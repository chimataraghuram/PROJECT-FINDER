export interface ReadmeProfile {
  id: string;
  title: string;
  username: string;
  category: string[];
  image: string;
  github: string;
  readme: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  bestFor: 'Beginners' | 'Students' | 'Portfolio' | 'Data Nerds' | 'Creative' | 'Developers' | 'Designers' | 'Analytic Minds' | 'Engineers' | 'Everyone' | 'Stat Lovers';
  isFeatured?: boolean;
}

export const README_PROFILES: ReadmeProfile[] = [
  {
    id: '0',
    title: 'Lead Developer Profile',
    username: 'chimataraghuram',
    category: ['Developer', 'Minimal', 'Creative'],
    image: 'https://raw.githubusercontent.com/chimataraghuram/chimataraghuram/main/banner.png',
    github: 'https://github.com/chimataraghuram',
    readme: '# Hi, I\'m Raghuram! 🚀\n\nFull-stack developer and creator of Project Finder.',
    difficulty: 'Medium',
    bestFor: 'Portfolio',
    isFeatured: true
  },
  {
    id: '1',
    title: 'Modern Minimalistic',
    username: 'abhisheknaiidu',
    category: ['Minimal', 'Dynamic'],
    image: 'https://raw.githubusercontent.com/abhisheknaiidu/abhisheknaiidu/master/code.gif',
    github: 'https://github.com/abhisheknaiidu/awesome-github-profile-readme',
    readme: '# Abhishek\'s Profile',
    difficulty: 'Easy',
    bestFor: 'Beginners',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Animated Cyberpunk',
    username: 'AnuragHazra',
    category: ['Animated', 'Dynamic'],
    image: 'https://github-readme-stats.vercel.app/api?username=anuraghazra&show_icons=true&theme=tokyonight',
    github: 'https://github.com/anuraghazra/github-readme-stats',
    readme: '# Anurag\'s Stats',
    difficulty: 'Advanced',
    bestFor: 'Data Nerds',
    isFeatured: true
  },
  {
    id: 'gif-1',
    title: 'Vibrant Animations',
    username: 'saadeghi',
    category: ['Animated'],
    image: 'https://opengraph.githubassets.com/1/saadeghi/saadeghi',
    github: 'https://github.com/saadeghi/saadeghi',
    readme: '# Pouya Saadeghi 🎨',
    difficulty: 'Medium',
    bestFor: 'Creative'
  },
  {
    id: 'gif-2',
    title: 'Hacker Aesthetic',
    username: 'ari-hacks',
    category: ['Animated', 'Code'],
    image: 'https://opengraph.githubassets.com/1/ari-hacks/ari-hacks',
    github: 'https://github.com/ari-hacks/ari-hacks',
    readme: '# Ari Hacks 💻',
    difficulty: 'Advanced',
    bestFor: 'Developers'
  },
  {
    id: 'min-1',
    title: 'Pure White Minimal',
    username: 'caneco',
    category: ['Minimal'],
    image: 'https://opengraph.githubassets.com/1/caneco/caneco',
    github: 'https://github.com/caneco/caneco',
    readme: '# Caneco\'s Design',
    difficulty: 'Easy',
    bestFor: 'Designers'
  },
  {
    id: 'min-2',
    title: 'Clean & Structured',
    username: 'lauragift21',
    category: ['Minimal', 'Developer'],
    image: 'https://opengraph.githubassets.com/1/lauragift21/lauragift21',
    github: 'https://github.com/lauragift21/lauragift21',
    readme: '# Laura Gift 🎁',
    difficulty: 'Easy',
    bestFor: 'Beginners'
  },
  {
    id: 'dyn-1',
    title: 'Real-time Metrics',
    username: '8bithemant',
    category: ['Dynamic', 'Developer'],
    image: 'https://github-readme-stats.vercel.app/api?username=8bithemant&show_icons=true&theme=radical',
    github: 'https://github.com/8bithemant/8bithemant',
    readme: '# Hemant\'s Dashboard',
    difficulty: 'Medium',
    bestFor: 'Analytic Minds'
  },
  {
    id: 'code-1',
    title: 'The Architect',
    username: 'Thaiane',
    category: ['Code', 'Minimal'],
    image: 'https://opengraph.githubassets.com/1/Thaiane/Thaiane',
    github: 'https://github.com/Thaiane/Thaiane',
    readme: '# Thaiane Braga 🏛️',
    difficulty: 'Medium',
    bestFor: 'Engineers'
  },
  {
    id: 'code-2',
    title: 'Open Source Guru',
    username: 'sindresorhus',
    category: ['Code', 'Developer'],
    image: 'https://opengraph.githubassets.com/1/sindresorhus/sindresorhus',
    github: 'https://github.com/sindresorhus/sindresorhus',
    readme: '# Sindre Sorhus 🦄',
    difficulty: 'Easy',
    bestFor: 'Everyone'
  },
  {
    id: 'dyn-2',
    title: 'Interactive Graphs',
    username: 'kittinan',
    category: ['Dynamic'],
    image: 'https://github-readme-stats.vercel.app/api?username=kittinan&show_icons=true&theme=merko',
    github: 'https://github.com/kittinan/kittinan',
    readme: '# Kittinan\'s Activity',
    difficulty: 'Advanced',
    bestFor: 'Stat Lovers'
  },
  {
    id: 'creative-1',
    title: 'The Illustrator',
    username: 'monkindey',
    category: ['Creative', 'Minimal'],
    image: 'https://opengraph.githubassets.com/1/monkindey/monkindey',
    github: 'https://github.com/monkindey/monkindey',
    readme: '# Kiho\'s Art 🎨',
    difficulty: 'Medium',
    bestFor: 'Designers'
  }
];
