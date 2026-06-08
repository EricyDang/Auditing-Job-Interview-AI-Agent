# 面试官求职审计 Agent

一个模型无关的多轮求职审计框架。它把简历、目标岗位、JD、投递历史和限制条件整理成结构化状态，再生成追问问题、LLM 消息、报告骨架和护栏校验结果。

## 仓库内容

- `src/index.mjs`：核心编排、状态构建、关键词映射和护栏校验
- `src/profiles.mjs`：岗位族能力模型
- `src/types.ts`：类型定义
- `src/cli.mjs`：本地预览 CLI
- `.codex/skills/job-audit-agent/SKILL.md`：Codex skill 定义
- `prompts/`：分步提示词
- `schemas/`：输入与状态 JSON Schema
- `examples/`：示例输入
- `tests/`：回归测试

## 快速开始

```bash
node -v
npm test
npm run audit:example
node src/cli.mjs examples/operations-intern.json
```

项目没有外部依赖，Node.js 18+ 直接可跑。

## CLI

```bash
node src/cli.mjs [--json] [--input <file>|<file>|-]
```

- 默认输出可读的求职审计预览
- `--json` 输出结构化结果，方便接到其他脚本或服务
- `-` 表示从 `stdin` 读取 JSON

示例：

```bash
node src/cli.mjs examples/broad-target-no-jd.json
node src/cli.mjs --json examples/operations-intern.json
cat examples/operations-intern.json | node src/cli.mjs -
```

## 程序化使用

```js
import {
  createAuditState,
  buildClarifyingQuestions,
  buildLLMMessages,
  buildReportSkeleton,
  validateReportGuardrails
} from "./src/index.mjs";

const input = {
  resumeText: "这里放简历全文",
  targetRoles: ["运营实习"],
  targetJDs: [],
  applicationHistory: { count: 0 },
  constraints: { cities: ["上海"], availableDaysPerWeek: 4 }
};

const state = createAuditState(input);
const questions = buildClarifyingQuestions(input, state);
const messages = buildLLMMessages(input, state);
const skeleton = buildReportSkeleton(input, state);
const qa = validateReportGuardrails(skeleton, input, state);
```

## 设计原则

- 不编造经历、数据、证书、学历或公司经历
- 缺少 JD 时必须标注“以下为基于岗位通用要求的推断”
- 所有判断都区分“基于材料可判断”和“因缺少信息只能推断”
- 目标过宽时必须收窄为 1 个主方向 + 2 个辅助方向
- 输出必须直接、具体、可执行

## 示例输入

- `examples/operations-intern.json`
- `examples/broad-target-no-jd.json`

## 许可证

MIT
