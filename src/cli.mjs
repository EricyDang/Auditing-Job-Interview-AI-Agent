#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  buildClarifyingQuestions,
  buildLLMMessages,
  buildReportSkeleton,
  createAuditState,
  normalizeInput,
  validateReportGuardrails
} from "./index.mjs";

const HELP_TEXT = `用法:
  node src/cli.mjs [--json] [--input <file>|<file>|-]

说明:
  默认读取 JSON 输入并输出可读的求职审计预览。
  加上 --json 可以输出结构化结果，方便接到其他工具或脚本里。

示例:
  node src/cli.mjs examples/operations-intern.json
  node src/cli.mjs --json examples/broad-target-no-jd.json
  cat examples/operations-intern.json | node src/cli.mjs -
`;

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  const inputText = await readInputText(options.inputPath);
  const candidateInput = parseJsonInput(inputText);
  const state = createAuditState(candidateInput);
  const questions = buildClarifyingQuestions(candidateInput, state);
  const messages = buildLLMMessages(candidateInput, state);
  const reportSkeleton = buildReportSkeleton(candidateInput, state);
  const guardrails = validateReportGuardrails(reportSkeleton, candidateInput, state);

  if (options.json) {
    const payload = {
      input: normalizeInput(candidateInput),
      state,
      questions,
      messages,
      reportSkeleton,
      guardrails
    };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return 0;
  }

  process.stdout.write(`${renderPreview({ state, questions, messages, reportSkeleton, guardrails })}\n`);
  return 0;
}

function parseArgs(argv) {
  const options = {
    help: false,
    json: false,
    inputPath: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--input") {
      index += 1;
      if (index >= argv.length) {
        throw new Error("参数 --input 需要一个文件路径。");
      }
      options.inputPath = argv[index];
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`未知参数：${arg}`);
    }

    if (!options.inputPath) {
      options.inputPath = arg;
      continue;
    }

    throw new Error(`多余的输入参数：${arg}`);
  }

  return options;
}

async function readInputText(inputPath) {
  if (!inputPath || inputPath === "-") {
    return readFromStdin();
  }

  return readFile(path.resolve(inputPath), "utf8");
}

async function readFromStdin() {
  if (process.stdin.isTTY) {
    throw new Error("未提供输入文件，也没有从 stdin 读取到 JSON。");
  }

  let text = "";
  for await (const chunk of process.stdin) {
    text += chunk;
  }

  return text;
}

function parseJsonInput(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`输入不是有效的 JSON：${error.message}`);
  }
}

function renderPreview({ state, questions, messages, reportSkeleton, guardrails }) {
  const lines = [];

  lines.push("# 求职审计预览");
  lines.push("");
  lines.push(`- 完整度评分：${state.infoCompletenessScore}/100`);
  lines.push(`- 候选阶段：${state.candidateStage}`);
  lines.push(`- 岗位族：${state.roleFamily}`);
  lines.push(`- 主投方向：${state.inferredTargets.primaryRole}`);
  lines.push(`- 辅助方向：${state.inferredTargets.secondaryRoles.join("、") || "暂无"}`);
  lines.push(`- 护栏检查：${guardrails.ok ? "通过" : "未通过"}`);

  if (guardrails.errors.length > 0) {
    lines.push(`- 错误：${guardrails.errors.join("；")}`);
  }

  if (guardrails.warnings.length > 0) {
    lines.push(`- 警告：${guardrails.warnings.join("；")}`);
  }

  lines.push("");
  lines.push("## 追问问题");

  if (questions.length > 0) {
    questions.forEach((question, index) => {
      lines.push(`${index + 1}. ${question}`);
    });
  } else {
    lines.push("- 无");
  }

  lines.push("");
  lines.push(`## LLM 消息`);
  lines.push(`- 消息数量：${messages.length}`);
  lines.push("");
  lines.push("## 报告骨架");
  lines.push(reportSkeleton.trim());

  return lines.join("\n");
}

function isMainModule() {
  const entryPath = process.argv[1];

  if (!entryPath) {
    return false;
  }

  return fileURLToPath(import.meta.url) === path.resolve(entryPath);
}

if (isMainModule()) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
