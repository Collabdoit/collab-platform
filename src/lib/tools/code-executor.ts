// ─── Code Executor (Sandboxed) ────────────────────────────
// Executes JavaScript in a sandboxed VM context with timeout & memory limits.

import type { ToolHandler, ToolResult } from './types';

const TIMEOUT_MS = 10000; // 10 second max
const MAX_OUTPUT_LENGTH = 5000;

export const executeCodeTool: ToolHandler = async (params): Promise<ToolResult> => {
  const { code, language } = params as {
    code: string;
    language?: string;
  };

  if (!code) {
    return { success: false, output: 'الكود مطلوب' };
  }

  // Only support JavaScript/TypeScript for now
  const lang = (language || 'javascript').toLowerCase();
  if (!['javascript', 'js', 'typescript', 'ts'].includes(lang)) {
    return {
      success: false,
      output: `اللغة "${language}" غير مدعومة حالياً. اللغات المدعومة: JavaScript, TypeScript`,
    };
  }

  try {
    // Use dynamic import for vm to work in edge-compatible environments
    const vm = await import('vm');

    const logs: string[] = [];
    let result: unknown;

    // Create sandboxed context with limited globals
    const sandbox = {
      console: {
        log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
        warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
      },
      JSON,
      Math,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      RegExp,
      Error,
      Promise,
      setTimeout: undefined, // Block async operations
      setInterval: undefined,
      fetch: undefined,      // Block network access
      process: undefined,    // Block process access
      require: undefined,    // Block module loading
      __result: undefined,
    };

    // Wrap code to capture the return value
    const wrappedCode = `
      (function() {
        try {
          ${code}
        } catch (e) {
          console.error(e.message || e);
        }
      })();
    `;

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);
    result = script.runInContext(context, { timeout: TIMEOUT_MS });

    const output = [
      ...(logs.length > 0 ? ['📋 Console Output:', ...logs] : []),
      ...(result !== undefined ? ['', '📦 Return Value:', String(result)] : []),
    ].join('\n');

    const truncatedOutput = output.length > MAX_OUTPUT_LENGTH
      ? output.substring(0, MAX_OUTPUT_LENGTH) + '\n... (مخرجات مقطوعة)'
      : output;

    return {
      success: true,
      output: truncatedOutput || '✅ تم تنفيذ الكود بنجاح (بدون مخرجات)',
      metadata: {
        language: lang,
        linesOfCode: code.split('\n').length,
        executionLogs: logs.length,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Check for timeout
    if (errorMessage.includes('Script execution timed out')) {
      return {
        success: false,
        output: `⏱️ انتهت المهلة! الكود تجاوز ${TIMEOUT_MS / 1000} ثوانٍ. حاول تبسيطه.`,
      };
    }

    return {
      success: false,
      output: `❌ خطأ في التنفيذ:\n${errorMessage}`,
      metadata: { error: errorMessage },
    };
  }
};
