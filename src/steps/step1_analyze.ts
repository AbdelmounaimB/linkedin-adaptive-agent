import { MemoryEngine } from '../core/MemoryEngine.js';
import { McpClient } from '../core/McpClient.js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY missing in .env");

const ai = new GoogleGenAI({ apiKey });

export async function runAnalysisPhase(mcp: McpClient, memory: MemoryEngine) {
  console.log("\n=== Phase 1: Fetching your LinkedIn profile ===");

  // Fetch all useful sections in one call
  const result = await mcp.callTool('linkedin-reader', 'get_my_profile', {
    sections: "experience,education"
  });

  console.log("Profile fetched. Sending to Gemini for analysis...");

  const analysisRules = memory.readMemoryFile('system_prompts/analyzer.md');
  if (!analysisRules) throw new Error("memory/system_prompts/analyzer.md is missing");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Here is my LinkedIn profile data. Analyze it and provide specific, actionable suggestions:\n\n${JSON.stringify(result, null, 2)}`,
    config: {
      systemInstruction: analysisRules,
    }
  });

  const suggestions = response.text ?? '';

  // Save to memory
  memory.logExecutionMetric(
    'execution_history/feedback_log.md',
    'Phase 1: Profile Analysis',
    suggestions
  );

  // Also save raw profile for Phase 2 and 3 to use
  memory.logExecutionMetric(
    'execution_history/profile_raw.md',
    'Raw Profile Data',
    JSON.stringify(result, null, 2)
  );

  console.log("✔ Analysis saved to memory/execution_history/feedback_log.md");
  return suggestions;
}