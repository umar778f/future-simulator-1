import express from "express";
import path from "path";
import cors from "cors"; 
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // ✅ FIXED: Wrapped in parseInt so TypeScript knows it is strictly a number
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors({
    origin: [
        'https://future-simulator-1.vercel.app', 
        'http://localhost:3000',                 
        'http://localhost:5173'                  
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));

  app.use(express.json());

  // API Routes
  app.post("/api/simulate", async (req, res) => {
    try {
      const { 
        name, educationLevel, currentSkills, careerGoals, 
        dailyStudyHours, productivityLevel, consistencyLevel, 
        technologies, futureDecision, timeframe 
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a futuristic AI Simulation Engine.
The user wants to simulate their career future based on these inputs:
- Name: ${name}
- Education: ${educationLevel}
- Current Skills: ${currentSkills}
- Career Goals: ${careerGoals}
- Daily Study Hours: ${dailyStudyHours}
- Productivity: ${productivityLevel}
- Consistency: ${consistencyLevel}
- Technologies Known: ${technologies}
- Future Decision/Path: ${futureDecision}
- Timeframe: ${timeframe}

Analyze this data and simulate 3 possible future outcomes (Best case, Average case, Worst case).
When generating the \`salary_estimate\`, you MUST use US Dollars ($) (e.g., $120,000 per year).
Generate the output using strict JSON format as specified. No markdown formatting outside of the JSON block if not requested.`;

      const responseSchema = {
          type: Type.OBJECT,
          properties: {
            best_case: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                career_status: { type: Type.STRING },
                salary_estimate: { type: Type.STRING },
                skills_gained: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            },
            average_case: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                career_status: { type: Type.STRING },
                salary_estimate: { type: Type.STRING },
                skills_gained: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            },
            worst_case: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                career_status: { type: Type.STRING },
                salary_estimate: { type: Type.STRING },
                skills_gained: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            },
            probabilities: {
              type: Type.OBJECT,
              properties: {
                best_case: { type: Type.STRING },
                average_case: { type: Type.STRING },
                worst_case: { type: Type.STRING }
              }
            },
            recommendation: { type: Type.STRING },
            motivation: { type: Type.STRING }
          }
      };

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
      } catch (apiError: any) {
        if (apiError.status === 503 || apiError.message?.includes("503") || apiError.message?.includes("UNAVAILABLE")) {
          console.warn("Model high demand (503). Retrying with gemini-1.5-flash...");
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            }
          });
        } else {
          throw apiError;
        }
      }
      
      const text = response?.text;
      if (!text) throw new Error("No response text");

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.warn("Raw parse failed, stripping markdown");
        const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanedText);
      }

      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate simulation" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();