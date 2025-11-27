import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedData, ProductData } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeProduct = async (url: string, image: File | null): Promise<Partial<ProductData>> => {
  const ai = getClient();
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the provided product URL and/or image to extract comprehensive product details for a marketing campaign.
    
    Product URL: ${url}
    
    Task:
    1. Use Google Search to find the *exact* product page. prioritize the URL provided if it exists.
    2. Extract the Product Title exactly as it appears.
    3. Extract a detailed Description.
    4. Extract 5-7 Key Features.
    5. **CRITICAL**: Find the current selling Price. 
       - Look for the main price on the product page.
       - If the brand is "Crystal Clawz" or South African, look for price in ZAR (R). 
       - If multiple prices exist (sale vs regular), return the current sale price.
       - Format as "Currency Symbol + Amount" (e.g., R450.00).
    6. Analyze the Brand Voice from the copy (e.g., "Playful", "Professional", "Sassy").

    Return a valid JSON object with the following keys:
    - title: string
    - description: string
    - keyFeatures: string[]
    - price: string
    - brandVoice: string

    Return ONLY the JSON object. Do not use Markdown formatting or code blocks.
  `;

  const parts: any[] = [{ text: prompt }];
  if (image) {
    const imagePart = await fileToGenerativePart(image);
    parts.push(imagePart);
  }

  const response = await ai.models.generateContent({
    model,
    contents: { role: 'user', parts },
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text || "{}";
  // Clean up any markdown formatting if present
  const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonString) as Partial<ProductData>;
  } catch (e) {
    console.error("Failed to parse analysis JSON", text);
    throw new Error("Failed to parse product analysis from AI response.");
  }
};

const PERSONA_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    generated_personas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          persona_id: { type: Type.STRING },
          name: { type: Type.STRING },
          emotional_trigger: { type: Type.STRING },
          pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone_style: { type: Type.STRING },
          targeting_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          meta_ad_assets: {
            type: Type.OBJECT,
            properties: {
              primary_texts: { type: Type.ARRAY, items: { type: Type.STRING } },
              headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
              call_to_action: { type: Type.STRING },
              landing_page_headline: { type: Type.STRING },
              creative_concept: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["IMAGE", "VIDEO"] },
                  prompt_for_imagen: { type: Type.STRING },
                  video_script_draft: { type: Type.STRING },
                },
                required: ["type", "prompt_for_imagen"],
              },
            },
            required: ["primary_texts", "headlines", "call_to_action", "creative_concept", "landing_page_headline"],
          },
        },
        required: ["persona_id", "name", "emotional_trigger", "pain_points", "tone_style", "targeting_suggestions", "meta_ad_assets"],
      },
    },
  },
  required: ["generated_personas"],
};

export const generateMarketingPersonas = async (data: ProductData): Promise<GeneratedData> => {
  const ai = getClient();
  // Using gemini-3-pro-preview for superior reasoning and creative writing capability
  const model = "gemini-3-pro-preview";

  const prompt = `
    ACT AS: A world-class Meta Ads Media Buyer & Creative Strategist (Top 1% expertise).
    CONTEXT: You are creating high-performance ad assets for a beauty e-commerce brand.
    
    PRODUCT ANALYSIS:
    Title: ${data.title}
    Description: ${data.description}
    Key Features: ${data.keyFeatures.join(', ')}
    Price: ${data.price}
    Brand Voice: ${data.brandVoice} (Ensure this voice permeates the copy)
    URL: ${data.url || 'N/A'}

    TASK:
    Generate 4 distinct, high-converting marketing personas tailored EXACTLY to these categories:
    1. Self-Employed Nail Technician (Freelancer) - Focus: Speed, ROI, Client Retention.
    2. Nail Technician working in a salon (Employee) - Focus: Ease of use, Consistency, Keeping the boss happy.
    3. Salon Owner (Business Minded) - Focus: Profit Margins, Speed of Service, Professional Image.
    4. DIY Nail Enthusiast (Home User) - Focus: Saving money, "Me time", Professional results at home.

    REQUIREMENTS FOR EACH PERSONA:

    1. **Persona Deep Dive**:
       - ID: Unique identifier (e.g., TECH-FREE, TECH-SALON, OWNER, DIY).
       - Emotional Trigger: The deep psychological 'why' (e.g., "Fear of lifting causing client complaints", "Pride in creating art").
       - Pain Points: Specific, visceral frustrations.

    2. **Meta Ad Copy (Primary Text) - The "Winner" Variant**:
       - IGNORE generic marketing fluff. Write like a human. Use the vernacular of the specific persona.
       - **CRITICAL STRUCTURE**:
         [HOOK: 1-2 short, punchy sentences. Stop the scroll. Address the pain or desire immediately.]
         
         [BODY: 2-3 short paragraphs using " \n " line breaks. Agitate the problem, present the product as the specific solution. Focus on benefits (Speed, Durability, Profit, Ease). Use emojis tastefully if brand voice permits.]
         
         [CTA: Clear, imperative command.]
       
    3. **Headline**: 
       - High-CTR, under 40 characters. 
       - Examples: "Stop Wasting Gel", "No More Chipping", "Client Fave 💅".

    4. **Creative Strategy (Visuals)**:
       - Move beyond generic product shots. We need "Performance Creative" ideas.
       - Suggest: UGC-style angles, Split-screens (Old Way vs New Way), Macro texture shots, or "ASMR" style application.
       - **prompt_for_imagen**: A highly detailed, art-directed prompt for high-quality generation. Include lighting (e.g., "Soft ring light", "Harsh flash"), texture (e.g., "Viscous, glossy gel drip"), and context.
       - **video_script_draft**: A fast-paced, TikTok/Reels style script.

    5. **Targeting**:
       - Precise interest targeting (Brands like OPI/Young Nails, Behaviors, or broad interests for DIY).

    OUTPUT:
    Return a SINGLE JSON object containing 'generated_personas' array matching the schema.
  `;

  const parts: any[] = [{ text: prompt }];

  if (data.image) {
    const imagePart = await fileToGenerativePart(data.image);
    parts.push(imagePart);
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      role: 'user',
      parts: parts
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: PERSONA_SCHEMA,
      temperature: 0.8, // Slightly higher for creativity
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  try {
    return JSON.parse(text) as GeneratedData;
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("Invalid JSON response from Gemini");
  }
};

export const generateVisualContent = async (prompt: string): Promise<string> => {
  const ai = getClient();
  // Using gemini-2.5-flash-image for reliable, high-speed generation
  const model = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        // imageSize is not supported in flash-image, removing it to prevent errors
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated.");
};
