import { GoogleGenAI, Type } from "@google/genai";
import { Presentation } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const presentationSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The main title of the presentation. This should be a concise summary of the entire document."
        },
        slides: {
            type: Type.ARRAY,
            description: "An array of slide objects, each representing a slide in the presentation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of the individual slide. It should represent a key topic or section from the text."
                    },
                    content: {
                        type: Type.ARRAY,
                        description: "An array of strings, where each string is a bullet point summarizing a key piece of information for this slide.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["title", "content"]
            }
        }
    },
    required: ["title", "slides"]
};

export async function generatePresentationFromText(text: string): Promise<Presentation> {
    const prompt = `
        Based on the following text extracted from a document, create a structured presentation.
        The presentation should have a main title and a series of slides. Each slide must have a title and content in the form of bullet points.
        Summarize the key information and organize it logically into distinct slides.

        Extracted Text:
        ---
        ${text}
        ---

        Generate the presentation based on the schema provided.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presentationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const presentationData: Presentation = JSON.parse(jsonText);
        
        if (!presentationData.title || !presentationData.slides || !Array.isArray(presentationData.slides)) {
            throw new Error("AI returned an invalid presentation structure.");
        }

        return presentationData;
    } catch (error) {
        console.error("Error generating presentation with Gemini:", error);
        throw new Error("Failed to generate presentation. The AI model might be overloaded or the content could not be processed.");
    }
}