import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

export class MemoryEngine {
  private baseDir: string;

  constructor() {
    // 2. Recreate __dirname cleanly using the current file's ESM metadata URL
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 3. Resolve the path relative to this folder
    // Points to the root memory folder
    this.baseDir = path.resolve(__dirname, '../../memory');
    this.ensureDirectoryStructure();
  }

  /**
   * Initializes directories so the app never throws 'file not found' errors on boot
   */
  private ensureDirectoryStructure(): void {
    const dirs = [
      path.join(this.baseDir, 'system_prompts'),
      path.join(this.baseDir, 'execution_history')
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Reads a Markdown file to pass directly into your LLM context window
   */
  public readMemoryFile(subPath: string): string {
    const fullPath = path.join(this.baseDir, subPath);
    if (!fs.existsSync(fullPath)) {
      return '';
    }
    return fs.readFileSync(fullPath, 'utf-8');
  }

  /**
   * Appends execution insights directly to tracking logs as clean markdown blocks
   */
  public logExecutionMetric(subPath: string, title: string, content: string): void {
    const fullPath = path.join(this.baseDir, subPath);
    const timestamp = new Date().toISOString();
    const markdownBlock = `\n\n### [${timestamp}] ${title}\n${content}\n---`;
    
    fs.appendFileSync(fullPath, markdownBlock, 'utf-8');
  }
}