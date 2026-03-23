/**
 * TECHBOY AI Smart Assistant Controller
 * Handles smart project suggestions, repo explanations, and beginner guidance.
 */

export const getAIResponse = async (req, res) => {
    const { prompt, context } = req.body;
    const lowerPrompt = prompt.toLowerCase();

    // 🧠 INTELLIGENCE LOGIC (Simulated Smart Logic for DEV Assistance)
    let aiOutput = "";

    // REPO EXPLANATION
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what does this do')) {
        if (context?.project) {
            const p = context.project;
            aiOutput = `**${p.name}** is a powerful project on ${p.platform}. \n\n` +
                       `**What it does:** ${p.description || "This project is dedicated to advanced development and discovery."} \n\n` +
                       `**Tech Stack:** Based on my analysis, it primarily uses **${p.language || "Modern Web Stack"}**. \n\n` +
                       `**Difficulty:** ${p.stars > 5000 ? "Advanced (Large community)" : "Moderate (Focused architecture)"}. \n\n` +
                       `Would you like to know how to connect with the developer or find more similar repos?`;
        } else {
            aiOutput = "I'd love to explain a project for you! 🔍 \n\n" +
                       "Please **click on a project's detail button** (like AI Summary or Analyze) or type the name of the project you want me to look into.";
        }
    } 
    // IDENTITY CHECK
    else if (lowerPrompt.includes('who are you') || lowerPrompt.includes('what is your name')) {
        aiOutput = "I am **TECHBOY AI**, your specialized smart assistant inside Project Finder. 🤖 \n\n" +
                   "I help you discover projects, analyze repositories, and guide you through technical stacks. " +
                   "How can I help you level up your development game today?";
    }
    // B. PROJECT SUGGESTIONS
    else if (lowerPrompt.includes('suggest') || lowerPrompt.includes('idea') || lowerPrompt.includes('build')) {
        const skill = lowerPrompt.match(/react|python|node|javascript|ai|data|ml|nextjs|tailwind/i)?.[0] || "coding";
        
        const suggestions = {
            'react': ["Building a Task management system with Firebase", "Creating a high-performance E-commerce dashboard", "Developing a real-time portfolio with Framer Motion"],
            'python': ["Scripting a web scraper for data analysis", "Building a lightweight FastAPI backend for AI models", "Automating stock market analysis visuals"],
            'node': ["Developing a scalable real-time chat server", "Building a custom authentication microservice", "Creating a developer tool CLI"],
            'ai': ["Fine-tuning a small language model for specific tasks", "Building a RAG (Retrieval-Augmented Generation) pipeline", "Creating an AI image generator interface"],
            'default': ["Building a cross-platform data visualizer", "Creating a full-stack open discovery platform", "Developing a high-performance component library"]
        };

        const list = suggestions[skill.toLowerCase()] || suggestions['default'];
        aiOutput = `Since you're interested in **${skill}**, here are some high-impact project ideas: \n\n` +
                   list.map(s => `• ${s}`).join('\n') + 
                   ` \n\nWhich one should we explore first?`;
    }
    // C. BEGINNER HELP
    else if (lowerPrompt.includes('beginner') || lowerPrompt.includes('start')) {
        aiOutput = "Starting out can be overwhelming, but I'm here to help! 🚀 \n\n" +
                   "1. **Pick a Core Stack**: Start with HTML/CSS and JavaScript. \n" +
                   "2. **Build Small**: Try a weather app or a simple calculator. \n" +
                   "3. **Read Code**: Look at 'awesome-list' repos on GitHub. \n\n" +
                   "I can suggest a specific 'Beginner' project if you tell me what language you like!";
    }
    // D. SEARCH AWARENESS
    else if (context?.search && (lowerPrompt.includes('recommend') || lowerPrompt.includes('based on my search'))) {
        aiOutput = `Based on your search for "${context.search}", I recommend focusing on projects with high star counts and active READMEs. \n\n` +
                   `Would you like me to analyze the top results for you?`;
    }
    // E. GENERAL / FALLBACK
    else {
        aiOutput = "I've analyzed your request. I specialize in project discovery, repository deep-dives, and developer guidance. \n\n" +
                   "Try asking: 'Explain this project' or 'Suggest a React project'.";
    }

    // Handle rapid error cases or empty prompts
    if (!prompt.trim()) {
        return res.status(400).json({ response: "Please provide a valid prompt for TECHBOY AI." });
    }

    res.json({ response: aiOutput });
};
