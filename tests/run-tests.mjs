import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import {
  buildClarifyingQuestions,
  buildLLMMessages,
  buildReportSkeleton,
  createAuditState,
  detectRoleFamily,
  inferCandidateStage,
  validateReportGuardrails
} from "../src/index.mjs";

const longResume =
  "市场营销专业学生，做过校园活动组织、社群运营和内容账号维护。负责选题、排期、用户沟通、活动执行和复盘报告，熟悉 Excel、PPT、公众号后台和小红书平台。";

test("1. resume only triggers target clarification without breaking inference", () => {
  const input = { resumeText: longResume };
  const state = createAuditState(input);
  const questions = buildClarifyingQuestions(input, state);

  assert.ok(state.infoCompletenessScore < 70);
  assert.ok(state.missingCriticalFields.includes("目标行业或目标职位"));
  assert.ok(state.inferredTargets.primaryRole.length > 0);
  assert.ok(questions.length <= 5);
  assert.ok(questions.some((question) => question.includes("方向") || question.includes("目标")));
});

test("2. target role without JD marks generic requirement assumption", () => {
  const input = {
    resumeText: `${longResume} 产出过竞品分析和活动复盘。`,
    targetRoles: ["产品助理"],
    applicationHistory: { count: 0, feedback: "还没开始投" },
    constraints: { cities: ["上海"], availableDaysPerWeek: 4 }
  };
  const state = createAuditState(input);
  const skeleton = buildReportSkeleton(input, state);
  const qa = validateReportGuardrails(skeleton, input, state);

  assert.ok(state.assumptions.some((item) => item.includes("未提供 JD")));
  assert.ok(skeleton.includes("以下为基于岗位通用要求的推断"));
  assert.equal(qa.ok, true);
});

test("3. three JDs contribute shared keywords", () => {
  const input = {
    resumeText: "数据分析实习经历，使用 SQL、Excel 和 Python 完成报表处理，支持业务复盘。",
    targetRoles: ["数据分析实习"],
    targetJDs: [
      "要求 SQL、Excel、数据分析能力，能输出业务报表。",
      "熟悉 Python 或 SQL，理解数据口径，能做数据分析。",
      "使用 Excel 处理数据，支持用户增长和业务复盘。"
    ]
  };
  const state = createAuditState(input);

  assert.ok(state.keywordMap.required.some((item) => item.toLowerCase() === "sql"));
  assert.ok(state.keywordMap.required.some((item) => item.toLowerCase() === "excel"));
  assert.ok(state.keywordMap.required.includes("数据分析"));
  assert.ok(state.keywordMap.covered.some((item) => item.toLowerCase() === "sql"));
});

test("4. 50 no-response applications are flagged", () => {
  const input = {
    resumeText: longResume,
    targetRoles: ["运营实习"],
    applicationHistory: {
      count: 50,
      resumeCustomized: false,
      feedback: "无回复"
    }
  };
  const state = createAuditState(input);

  assert.ok(state.riskFlags.some((flag) => flag.includes("50 份")));
  assert.ok(state.riskFlags.some((flag) => flag.includes("未定制简历")));
});

test("5. course-like projects are flagged", () => {
  const input = {
    resumeText: "课程设计项目：负责问卷设计和实验报告撰写，参与课堂展示，熟悉 Excel 和 PPT。",
    targetRoles: ["市场实习"]
  };
  const state = createAuditState(input);

  assert.ok(state.riskFlags.some((flag) => flag.includes("课程作业")));
});

test("6. broad targets are narrowed", () => {
  const input = {
    resumeText: longResume,
    targetIndustries: ["互联网", "金融", "教育", "快消"],
    targetRoles: ["产品", "运营", "市场", "财务都可以"]
  };
  const state = createAuditState(input);

  assert.notEqual(state.inferredTargets.primaryRole, "财务都可以");
  assert.ok(state.inferredTargets.secondaryRoles.length <= 2);
  assert.ok(state.riskFlags.some((flag) => flag.includes("目标岗位过宽")));
});

test("7. missing metrics are handled as a risk, not fabricated", () => {
  const input = {
    resumeText: "负责社群内容维护，参与活动执行，协助整理用户反馈。",
    targetRoles: ["内容运营实习"]
  };
  const state = createAuditState(input);
  const skeleton = buildReportSkeleton(input, state);

  assert.ok(state.riskFlags.some((flag) => flag.includes("缺少量化成果")));
  assert.ok(skeleton.includes("建议补充"));
});

test("8. role families trigger role-specific interview add-ons", () => {
  const cases = [
    ["前端开发实习", "tech", "技术基础"],
    ["产品助理", "product", "需求分析"],
    ["用户运营实习", "operations", "用户增长"],
    ["销售管培生", "marketingSales", "客户沟通"],
    ["财务助理", "finance", "财务基础"],
    ["视觉设计实习", "designMedia", "作品集"]
  ];

  for (const [role, family, addOn] of cases) {
    const input = { resumeText: `${longResume} 目标岗位是${role}。`, targetRoles: [role] };
    const state = createAuditState(input);
    const skeleton = buildReportSkeleton(input, state);

    assert.equal(state.roleFamily, family);
    assert.ok(skeleton.includes(addOn));
  }
});

test("9. internship, campus and experienced stages are inferred", () => {
  assert.equal(inferCandidateStage({ targetRoles: ["运营实习"] }), "internship");
  assert.equal(inferCandidateStage({ resumeText: "2026 届应届毕业生，目标校招管培生。" }), "campus");
  assert.equal(inferCandidateStage({ resumeText: "3年工作经验，目标社招产品经理。" }), "experienced");
});

test("10. guardrail validation catches missing report sections", () => {
  const input = {
    resumeText: longResume,
    targetRoles: ["运营实习"]
  };
  const state = createAuditState(input);
  const messages = buildLLMMessages(input, state);
  const skeleton = buildReportSkeleton(input, state);
  const qaOk = validateReportGuardrails(skeleton, input, state);
  const qaBad = validateReportGuardrails("只有一段泛泛建议。", input, state);

  assert.equal(messages.length, 2);
  assert.equal(qaOk.ok, true);
  assert.equal(qaBad.ok, false);
  assert.ok(qaBad.errors.length > 0);
});

test("detectRoleFamily falls back safely", () => {
  assert.equal(detectRoleFamily({ resumeText: "学生干部，参与项目管理和文档整理。" }), "general");
});

test("11. CLI renders a preview from example input", () => {
  const result = spawnSync(process.execPath, ["src/cli.mjs", "examples/operations-intern.json"], {
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes("求职审计预览"));
  assert.ok(result.stdout.includes("报告骨架"));
});

test("12. CLI JSON mode returns structured output", () => {
  const result = spawnSync(process.execPath, ["src/cli.mjs", "--json", "examples/broad-target-no-jd.json"], {
    encoding: "utf8"
  });
  const payload = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.ok(payload.state.infoCompletenessScore >= 0);
  assert.ok(Array.isArray(payload.questions));
  assert.equal(payload.guardrails.ok, true);
});

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}
