import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyBZq_qdeGdc0USYBzNWSgDQMLxN46ytPtM";
const client = new GoogleGenAI({ apiKey });

async function test() {
    try {
        console.log("Retrying: gemini-3-flash-preview");
        const model = client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: 'Hello' }] }
        });
        const result = await model;
        console.log("Success! Response:", result.text);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

test();
