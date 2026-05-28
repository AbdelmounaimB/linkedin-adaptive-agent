import { MemoryEngine } from './core/MemoryEngine.js';
import { McpClient } from './core/McpClient.js';
import { runAnalysisPhase } from './steps/step1_analyze.js';

async function main() {
  const memory = new MemoryEngine();
  const mcp = new McpClient();

  try {
    const suggestions = await runAnalysisPhase(mcp, memory);

    console.log("\n--- Suggestions Preview ---");
    console.log(suggestions.slice(0, 800));
    console.log("\n[Full analysis in memory/execution_history/feedback_log.md]");

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mcp.shutdown();
  }
}

main();