/**
 * TECHBOY AI - Local Rule-Based Logic
 * Ensures 100% reliability without external APIs.
 */

export const getLocalAIResponse = (input: string, focusedProject?: any): string => {
    const text = input.toLowerCase();

    // 1. CONTEXT-AWARE LOGIC (If a project is focused)
    if (focusedProject && (text.includes("explain") || text.includes("what does this do") || text.includes("this project"))) {
        const p = focusedProject;
        return `**${p.name}** is a specialized project. \n\n` +
               `**What it does:** ${p.description || "This repository provides advanced development features."} \n\n` +
               `**Tech Stack:** Primarily uses **${p.language || "Modern Web Stack"}**. \n\n` +
               `**Suggestion:** ${p.stars > 1000 ? "This is a popular project! Try analyzing its architecture." : "A focused project. Great for learning foundational patterns."}`;
    }

    // 2. KEYWORD-BASED RULES
    // React
    if (text.includes("react") || text.includes("frontend")) {
        return "You can build a **React** project like a **Premium Portfolio**, **Interactive Dashboard**, or an **E-commerce App** with complex state management.";
    }

    // Python / AI
    if (text.includes("python") || text.includes("ai") || text.includes("ml")) {
        return "Try building **AI** projects like a **Smart Chatbot**, **Recommendation System**, or an **Image Classifier** using Python frameworks like FastAPI or PyTorch.";
    }

    // Beginner
    if (text.includes("beginner") || text.includes("start") || text.includes("easy")) {
        return "Starting out? Try these high-impact **Beginner** projects: \n\n1. **Modern Todo App** (with LocalStorage) \n2. **Glassmorphism Calculator** \n3. **Real-time Weather Dashboard**.";
    }

    // Full Stack
    if (text.includes("full stack") || text.includes("backend") || text.includes("node")) {
        return "For **Full Stack** mastery, I recommend building a **Blog Platform (Next.js)**, **E-commerce Store**, or a **Real-time Social Feed** with Node.js and MongoDB.";
    }

    // Suggestions
    if (text.includes("suggest") || text.includes("idea")) {
        return "I suggest exploring projects in **TypeScript**, **Next.js**, or **Python**. \n\nWhat's your favorite tech stack? Tell me and I'll narrow it down!";
    }

    // Identity / Who are you?
    if (text.includes("who are you") || text.includes("what is your name")) {
        return "I am **TECHBOY AI**, your specialized smart assistant. 🤖 \n\nI live entirely in your browser and help you discover, analyze, and build amazing projects without needing the internet!";
    }

    // 3. DEFAULT FALLBACK
    return "I've analyzed your request. Try asking about **React**, **AI**, **Beginner** projects, or type **'Suggest Projects'** for more ideas!";
};
