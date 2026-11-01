/**
 * TECHBOY AI - Local Rule-Based Logic
 * Ensures 100% reliability without external APIs.
 */

export const getLocalAIResponse = (input: string, focusedProject?: any): string => {
    const text = input.toLowerCase();

    // 1. CONTEXT-AWARE LOGIC (If a project is focused)
    if (focusedProject) {
        const p = focusedProject;
        const starsCount = typeof p.stars === 'number' ? p.stars : parseInt(p.stars || '0', 10) || 0;
        const lastUpdated = p.pushed_at || p.updatedAt;

        // Good First Issues & Contribution
        if (text.includes("first issue") || text.includes("contribute") || text.includes("contribution") || text.includes("beginner issue")) {
            return `### 🌟 Open Source Contribution Guide: **${p.name}**\n\n` +
                   `**Ready to contribute?** Here is how you can get started with this repository:\n\n` +
                   `- **Direct Starter Issues:** Check [${p.name} Good First Issues](${p.url}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or open starter issues labeled \`help wanted\`.\n` +
                   `- **Documentation & Bug Fixes:** Start by improving README documentation, typing, or edge-case tests.\n` +
                   `- **Contribution Flow:** Fork the repository, clone locally, create a feature branch, and submit a concise PR.\n\n` +
                   `💡 **Techboy Pro-Tip:** Inspect their \`CONTRIBUTING.md\` and review recent merged pull requests to mirror their code style!`;
        }

        // Repository Health & Longevity Radar (Avoid dead / unmaintained repos)
        if (text.includes("health") || text.includes("unmaintained") || text.includes("dead") || text.includes("maintenance") || text.includes("longevity") || text.includes("safe to use") || text.includes("abandoned")) {
            let activityVerdict = "Active";
            let warningNotes = "";
            if (lastUpdated) {
                const diffMonths = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24 * 30);
                if (diffMonths > 18) {
                    activityVerdict = "Potentially Inactive / Stale";
                    warningNotes = "⚠️ **Warning:** Last pushed code was over 1.5 years ago. Test thoroughly before adopting in production.";
                } else if (diffMonths > 6) {
                    activityVerdict = "Moderate Activity";
                    warningNotes = "ℹ️ **Notice:** Last update was several months ago. Check issue responses and community activity.";
                } else {
                    activityVerdict = "Actively Maintained 🟢";
                    warningNotes = "✅ **Healthy:** Fresh commits and updates recorded within the past 6 months.";
                }
            } else {
                activityVerdict = starsCount > 100 ? "Community Backed" : "Early Stage";
            }

            return `### 🛡️ Repository Health & Longevity Radar: **${p.name}**\n\n` +
                   `- **Ecosystem Status:** **${activityVerdict}**\n` +
                   `- **Popularity & Social Proof:** **${starsCount.toLocaleString()} stars**\n` +
                   `- **Primary Technology:** **${p.language || "Multi-platform"}**\n` +
                   `- **License & Transparency:** ${p.license || "Open source / Check repository license"}\n\n` +
                   `${warningNotes ? `${warningNotes}\n\n` : ''}` +
                   `**Verdict for Developers:** ${starsCount > 500 ? "Widely adopted with solid community interest. Suitable for learning and building upon." : "Great exploratory codebase. Review recent commit logs before using as a critical dependency."}`;
        }

        // General project explainer
        if (text.includes("explain") || text.includes("what does this do") || text.includes("this project")) {
            return `**${p.name}** is a specialized project. \n\n` +
                   `**What it does:** ${p.description || "This repository provides advanced development features."} \n\n` +
                   `**Tech Stack:** Primarily uses **${p.language || "Modern Web Stack"}**. \n\n` +
                   `**Suggestion:** ${starsCount > 1000 ? "This is a popular project! Try analyzing its architecture." : "A focused project. Great for learning foundational patterns."}`;
        }
    }

    // General Good First Issue request without focused repo
    if (text.includes("first issue") || text.includes("contribute")) {
        return "Looking for open source contributions? Search for any topic like 'React', 'Python', or 'AI', click on any repository card, and use the **'Good First Issues'** prompt in Techboy AI to get instant starter links!";
    }

    // General Health / Dead Repo check request without focused repo
    if (text.includes("health") || text.includes("unmaintained") || text.includes("dead repo")) {
        return "I can inspect any repository's health to help you avoid dead or abandoned code! Select or click on any repository card, then click **'Health & Longevity'** or ask me to check its status.";
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
