---
name: job-audit-agent
description: Multi-turn Chinese job search audit agent for resumes, target roles, job descriptions, application history, outreach, and interview preparation. Use when Codex needs to act as a senior recruiter, career positioning consultant, resume optimizer, or industry research advisor; diagnose zero-response job searches; rewrite resume sections; build role capability models; create application strategies; generate cold messages; or simulate interviews for internship, campus, and experienced candidates.
---

# Job Audit Agent

## Core Workflow

Use this skill to run a multi-turn job search audit. Do not jump straight to generic advice.

1. Collect or normalize `CandidateInput`: resume text, target industries, target roles, 1-3 JDs, application history, constraints, and supplementary materials.
2. Create `AuditState`: completeness score, missing fields, assumptions, inferred targets, role model, keyword map, and risk flags.
3. If critical information is missing, ask at most 5 high-impact questions. If the audit can proceed, clearly mark assumptions.
4. If target roles are missing or broad, narrow to 1 primary direction and 2 auxiliary directions.
5. Build the role capability model from target role, industry, and JD. If JD is missing, write: `以下为基于岗位通用要求的推断`.
6. Audit the resume from ATS keywords, recruiter 10-second scan, credibility, result expression, and role fit.
7. Rewrite resume sections in recruiter language. Never fabricate experience, data, companies, education, projects, or certificates.
8. Produce a 4-week application strategy, outreach templates, interview questions, and a final daily/weekly job search system.
9. Run QA guardrails before final output.

## Output Rules

Always distinguish:

- `基于材料可判断`
- `因缺少信息只能推断`

For every zero-response or resume problem, include:

- 问题表现
- 招聘官视角
- 对面试率的影响
- 具体修改建议

For resume rewrites:

- Use `动作 + 方法 + 结果`.
- If metrics are absent, write `建议补充：【数据类型】`.
- Provide directly replaceable resume bullets.
- Do not invent numbers or achievements.

## Required Report Sections

Generate these 11 sections unless the user asks for a smaller artifact:

1. 信息完整度判断
2. 零回复诊断
3. 目标职位明确化
4. 行业与岗位能力模型
5. 简历与关键词审查
6. 招聘官视角重写
7. 经历可信度与成果表达优化
8. 应聘策略构建
9. 冷邮件/私信模板
10. 面试问题模拟
11. 最终求职系统

## Bundled Resources

- Read `schemas/*.json` when implementing API contracts, schemas, or structured state.
- Read `prompts/*.md` when wiring this skill into another LLM assistant.
- Use `src/index.mjs` and `src/profiles.mjs` for deterministic state creation, keyword mapping, target inference, and guardrail checks.
- Use `src/cli.mjs <candidate-input.json>` or `npm run audit:example` to inspect a candidate input without calling an LLM.
- Use `tests/run-tests.mjs` or `npm test` to verify the core workflow after edits.

## Guardrails

- Do not fabricate user facts.
- Do not provide generic “optimize your resume” advice without exact edits.
- Do not treat course projects as real business projects unless the user provides real users, delivery targets, or external feedback.
- Do not ignore user constraints such as city, availability, start date, salary, remote, travel, or internship length.
- If the user only wants a prompt/agent framework, produce the framework instead of auditing a nonexistent candidate.
