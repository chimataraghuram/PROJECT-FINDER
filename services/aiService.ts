import { Project } from '../types';

export interface ProjectAnalysis {
  overallScore: number;
  documentation: number;
  maintenance: number;
  popularity: number;
  verdict: string;
  tags: string[];
}

export const analyzeProject = async (project: Project): Promise<ProjectAnalysis> => {
  // Simulate AI "Reading" time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 1. Documentation Score (0-10)
  // Based on description length, homepage, and license
  let docScore = 4;
  if (project.description && project.description.length > 50) docScore += 2;
  if (project.description && project.description.length > 150) docScore += 1;
  if (project.homepage) docScore += 2;
  if (project.license) docScore += 1;
  docScore = Math.min(docScore, 10);

  // 2. Popularity Score (0-10)
  // Logarithmic scale for stars
  const stars = project.stargazers_count || 0;
  let popScore = 0;
  if (stars > 0) popScore = Math.min(Math.floor(Math.log10(stars) * 2) + 1, 10);
  if (stars > 10000) popScore = 10;

  // 3. Maintenance Score (0-10)
  // Simplified logic based on forks/stars ratio and sample data
  let mainScore = 7;
  if (project.forks_count && project.stargazers_count) {
    const ratio = project.forks_count / project.stargazers_count;
    if (ratio > 0.2) mainScore += 1; // High community engagement
    if (ratio > 0.4) mainScore += 2;
  }
  mainScore = Math.min(mainScore, 10);

  // 4. Overall Score
  const overallScore = Math.round((docScore * 0.4 + popScore * 0.3 + mainScore * 0.3) * 10) / 10;

  // 5. Verdict & Tags
  let verdict = "Solid foundation with good potential.";
  const tags = ["AI Verified"];
  
  if (overallScore >= 8.5) {
    verdict = "Enterprise-grade architecture. Highly recommended.";
    tags.push("Pro Choice");
  } else if (overallScore >= 7) {
    verdict = "Great for learning and experimentation.";
    tags.push("Growth");
  } else if (docScore < 5) {
    verdict = "Could use better documentation, but the code logic is interesting.";
    tags.push("Raw Potential");
  }

  return {
    overallScore,
    documentation: docScore,
    maintenance: mainScore,
    popularity: popScore,
    verdict,
    tags
  };
};
