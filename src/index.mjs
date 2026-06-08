import { ROLE_PROFILES, REPORT_SECTION_TITLES } from "./profiles.mjs";

const GENERIC_SELF_EVAL_WORDS = [
  "认真负责",
  "吃苦耐劳",
  "性格开朗",
  "学习能力强",
  "抗压能力强",
  "良好的沟通能力"
];

const HARD_KEYWORDS = [
  "sql",
  "python",
  "java",
  "javascript",
  "typescript",
  "react",
  "vue",
  "excel",
  "ppt",
  "figma",
  "axure",
  "pr",
  "ae",
  "git",
  "linux",
  "crm",
  "spss",
  "tableau",
  "power bi",
  "用户增长",
  "竞品分析",
  "需求分析",
  "数据分析",
  "活动策划",
  "内容运营",
  "财务报表",
  "风控",
  "作品集"
];

export { ROLE_PROFILES, REPORT_SECTION_TITLES };

export function normalizeInput(input = {}) {
  return {
    ...input,
    resumeText: input.resumeText || "",
    targetIndustries: asArray(input.targetIndustries),
    targetRoles: asArray(input.targetRoles),
    targetJDs: asArray(input.targetJDs),
    applicationHistory: input.applicationHistory || {},
    constraints: input.constraints || {},
    materials: input.materials || {}
  };
}

export function createAuditState(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const roleFamily = detectRoleFamily(input);
  const profile = ROLE_PROFILES[roleFamily] || ROLE_PROFILES.general;
  const candidateStage = inferCandidateStage(input);
  const assumptions = buildAssumptions(input, profile);
  const roleModel = buildRoleModel(input, profile);
  const inferredTargets = inferTargets(input, profile);
  const keywordMap = buildKeywordMap(input, roleModel);
  const completeness = assessCompleteness(input);
  const riskFlags = detectRiskFlags(input, completeness, keywordMap);

  return {
    infoCompletenessScore: completeness.score,
    missingCriticalFields: completeness.missingCriticalFields,
    assumptions,
    candidateStage,
    roleFamily,
    inferredTargets,
    roleModel,
    keywordMap,
    riskFlags
  };
}

export function assessCompleteness(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const missing = [];
  let score = 0;

  if (input.resumeText.trim().length >= 80) {
    score += 30;
  } else {
    missing.push("简历全文或可解析的完整简历内容");
  }

  if (input.targetRoles.length > 0 || input.targetIndustries.length > 0) {
    score += 15;
  } else {
    missing.push("目标行业或目标职位");
  }

  if (input.targetJDs.length > 0) {
    score += 15;
  } else {
    missing.push("目标 JD");
  }

  if (hasAnyValue(input.applicationHistory)) {
    score += 10;
  } else {
    missing.push("投递历史或当前投递阶段");
  }

  if (hasAnyValue(input.constraints)) {
    score += 10;
  } else {
    missing.push("城市、到岗时间、实习/工作天数等求职限制");
  }

  if (hasAnyValue(input.materials)) {
    score += 10;
  } else {
    missing.push("作品集、项目链接、证书或其他补充材料");
  }

  if (hasQuantitativeEvidence(input.resumeText)) {
    score += 10;
  } else {
    missing.push("可量化成果或可验证交付物");
  }

  return {
    score: Math.min(score, 100),
    missingCriticalFields: missing
  };
}

export function buildClarifyingQuestions(rawInput = {}, state = createAuditState(rawInput)) {
  const input = normalizeInput(rawInput);
  const questions = [];

  if (!input.resumeText.trim()) {
    questions.push("请提供简历全文，至少包含教育经历、项目/实习/工作经历、技能和证书。");
  }

  if (input.targetRoles.length === 0 && input.targetIndustries.length === 0) {
    questions.push("你目前最想优先进入哪个方向？如果不确定，请提供 2-3 个备选行业或岗位。");
  } else if (isBroadTarget(input)) {
    questions.push("你的目标较宽，请确认最想主投的 1 个方向，Agent 会保留 2 个辅助方向。");
  }

  if (input.targetJDs.length === 0) {
    questions.push("请提供 1-3 个目标 JD；如果暂时没有，Agent 会按岗位通用要求推断并明确标注。");
  }

  if (!hasAnyValue(input.constraints)) {
    questions.push("请补充城市、是否远程、每周可工作/实习天数、到岗时间和薪资限制。");
  }

  if (!hasAnyValue(input.applicationHistory)) {
    questions.push("请补充投递数量、平台、岗位类型、城市、是否内推、是否定制简历和反馈情况。");
  }

  if (!hasQuantitativeEvidence(input.resumeText) && input.resumeText.trim()) {
    questions.push("请补充经历中的可量化信息，例如用户量、转化率、处理数据量、周期、协作人数或成本节省。");
  }

  if (state.riskFlags.some((flag) => flag.includes("课程作业"))) {
    questions.push("哪些项目有真实用户、真实业务方、上线交付或可展示成果？请标出来。");
  }

  return questions.slice(0, 5);
}

export function buildLLMMessages(rawInput = {}, state = createAuditState(rawInput)) {
  const input = normalizeInput(rawInput);
  const system = [
    "你是一名资深招聘官、职业定位顾问、简历优化专家和行业研究顾问。",
    "你的任务是做多轮诊断型求职审计：先判断信息完整度，再明确目标职位，最后输出完整报告。",
    "强约束：不虚构经历、数据、证书、学历、公司经历；缺少数据时只能提示用户应补充哪些数据。",
    "所有判断必须区分“基于材料可判断”和“因缺少信息只能推断”。",
    "如果缺少 JD，必须写明：“以下为基于岗位通用要求的推断”。",
    "如果目标过宽，必须收窄为 1 个主方向 + 2 个辅助方向。",
    "输出要具体、可执行，并提供可直接替换进简历的文本。"
  ].join("\n");

  const user = [
    "请基于以下结构化输入和中间状态，生成完整求职审计报告。",
    "",
    "## CandidateInput",
    fencedJson(input),
    "",
    "## AuditState",
    fencedJson(state),
    "",
    "## 输出章节",
    REPORT_SECTION_TITLES.map((title, index) => `${index + 1}. ${title}`).join("\n")
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}

export function buildReportSkeleton(rawInput = {}, state = createAuditState(rawInput)) {
  const input = normalizeInput(rawInput);
  const jdNotice =
    input.targetJDs.length === 0 ? "\n> 以下为基于岗位通用要求的推断。\n" : "";

  return `# 求职审计报告
${jdNotice}
## 1. 信息完整度判断

| 项目 | 判断 |
| --- | --- |
| 完整度评分 | ${state.infoCompletenessScore}/100 |
| 缺失关键信息 | ${state.missingCriticalFields.join("；") || "暂无明显缺失"} |
| 基于材料可判断 | 简历文本、目标信息、JD、投递历史和限制条件中已提供的内容 |
| 因缺少信息只能推断 | ${state.assumptions.join("；") || "暂无"} |

## 2. 零回复诊断

| 严重程度 | 问题表现 | 招聘官视角 | 对面试率的影响 | 具体修改建议 |
| --- | --- | --- | --- | --- |
| 高 | ${state.riskFlags[0] || "等待结合投递历史判断"} | 需要快速看到岗位匹配证据 | 影响初筛通过率 | 补充 JD 关键词、成果数据和可验证交付物 |

## 3. 目标职位明确化

- 主投职位：${state.inferredTargets.primaryRole}
- 可尝试职位：${state.inferredTargets.secondaryRoles.join("、")}
- 暂不建议投递：${state.inferredTargets.notRecommendedRoles.join("、")}
- 一句话求职定位：围绕“${state.inferredTargets.primaryRole}”呈现与目标岗位最相关的技能、项目和成果。

## 4. 行业与岗位能力模型

| 能力项 | 招聘方看重什么 | 简历覆盖判断 |
| --- | --- | --- |
| 硬技能 | ${state.roleModel.hardSkills.join("、")} | 待根据简历逐项标注已覆盖/缺失 |
| 工具/平台 | ${state.roleModel.tools.join("、")} | 待核对工具是否有项目证据 |
| 可量化成果 | ${state.roleModel.measurableOutcomes.join("、")} | 缺少数据时不得编造，只提示补充 |

## 5. 简历与关键词审查

- ATS 必备关键词：${state.keywordMap.required.join("、")}
- 已覆盖关键词：${state.keywordMap.covered.join("、") || "待补充"}
- 明显缺失关键词：${state.keywordMap.missing.join("、") || "待核对"}
- 需要弱化或删除：${state.keywordMap.removeOrWeaken.join("、") || "空泛自评和无证据形容词"}

## 6. 招聘官视角重写

> 该部分由 LLM 根据真实材料改写，不得新增用户没有提供的公司、岗位、项目、证书或数据。

- 简历顶部个人定位：
- Summary：
- 技能区：
- 重要经历 bullet：
- 教育经历：
- 奖项/证书/作品集：
- 自我评价：

## 7. 经历可信度与成果表达优化

| 问题 | 修改方向 | 可替换 bullet 模板 |
| --- | --- | --- |
| 只写职责，没有成果 | 改成动作 + 方法 + 结果 | 负责/参与【任务】，通过【方法/工具】完成【交付物】，建议补充【结果数据】 |
| 只写工具，没有业务价值 | 补业务场景和指标 | 使用【工具】处理【对象】，支持【业务目标】，建议补充【规模/效率/质量】 |
| 像课程作业 | 补真实约束和交付对象 | 围绕【问题】设计【方案】，产出【作品/报告/系统】，建议补充【用户/评审/上线/反馈】 |

## 8. 应聘策略构建

- 第 1 周：主投 ${state.inferredTargets.primaryRole}，完成 2 版简历和 10 个岗位样本拆解。
- 第 2 周：扩大到辅助方向，开始内推和业务负责人外联。
- 第 3 周：按回复率复盘关键词、岗位层级、城市和渠道。
- 第 4 周：强化面试题库，针对低转化环节重写简历。
- 50 份无回复：暂停泛投，回看 JD 匹配度、简历首屏、关键词和投递渠道。
- 100 份无回复：重新定位岗位层级，降低目标跨度，优先内推和作品集补强。

## 9. 冷邮件/私信模板

- HR 版本：您好，我关注到贵司【岗位】正在招聘，我的【经历/技能】与 JD 中【关键词】匹配，附件为简历，期待有机会进一步沟通。
- 直属负责人版本：您好，我对【业务/产品/团队方向】很感兴趣，过去做过【相关项目】，希望应聘【岗位】并进一步了解团队需求。
- 校友/同行内推版本：您好，我是【学校/背景】的【身份】，正在投递【岗位】，想请教该方向的简历匹配度，也想了解是否方便内推。
- 平台即时沟通短版：您好，我想应聘【岗位】，已有【相关经历/作品/技能】，可尽快到岗，方便的话想进一步沟通。
- 面试后跟进版本：您好，感谢今天的面试沟通。我对【岗位/业务】有了更清晰的理解，也补充整理了【材料/思考】，期待后续反馈。

## 10. 面试问题模拟

- 岗位基础问题：围绕 ${state.roleModel.hardSkills.join("、")} 准备。
- 经历深挖问题：按“背景-任务-行动-结果-复盘”回答。
- 行为面试问题：准备冲突、压力、失败、协作、学习 5 类案例。
- 压力或反问类问题：准备目标选择、稳定性、短板、薪资、反问团队。
- 岗位专项题：${(ROLE_PROFILES[state.roleFamily] || ROLE_PROFILES.general).interviewAddOns.join("、")}。

## 11. 最终求职系统

- 投递前检查清单：JD 匹配、关键词覆盖、首屏定位、成果证据、限制条件。
- 每日求职动作：拆 3 个 JD、定制 2 份简历、外联 3 人、记录转化。
- 每周复盘动作：统计投递数、已读率、回复率、面试率、拒绝原因。
- 14 天补强计划：补关键词、补量化数据、补作品集、练面试、做渠道复盘。
- 最优先做的 3 件事：收窄目标、重写首屏、补成果数据。
- 当前最应该停止做的 3 件事：泛投无关岗位、使用同一版简历、堆砌无证据关键词。
`;
}

export function validateReportGuardrails(reportText = "", rawInput = {}, state = createAuditState(rawInput)) {
  const input = normalizeInput(rawInput);
  const errors = [];
  const warnings = [];

  for (const title of REPORT_SECTION_TITLES) {
    if (!reportText.includes(title)) {
      errors.push(`缺少章节：${title}`);
    }
  }

  if (input.targetJDs.length === 0 && !reportText.includes("以下为基于岗位通用要求的推断")) {
    errors.push("缺少 JD 时，报告必须标注“以下为基于岗位通用要求的推断”。");
  }

  if (!reportText.includes("基于材料可判断")) {
    errors.push("报告必须区分“基于材料可判断”。");
  }

  if (!reportText.includes("因缺少信息只能推断")) {
    errors.push("报告必须区分“因缺少信息只能推断”。");
  }

  if (isBroadTarget(input) && !reportText.includes("主投职位")) {
    errors.push("目标过宽时，报告必须收窄并明确主投职位。");
  }

  if (!hasQuantitativeEvidence(input.resumeText) && /\d+%|\d+人|\d+万|\d+个|\d+份/.test(reportText)) {
    warnings.push("输入缺少量化证据，但报告出现数字，请人工确认是否为用户提供的数据。");
  }

  if (!state.keywordMap.required.some((keyword) => reportText.toLowerCase().includes(keyword.toLowerCase()))) {
    warnings.push("报告可能没有充分使用岗位关键词。");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

export function detectRoleFamily(rawInput = {}) {
  const input = normalizeInput(rawInput);
  const weightedSources = [
    { text: input.targetRoles.join(" "), weight: 6 },
    { text: input.targetJDs.join(" "), weight: 3 },
    { text: input.targetIndustries.join(" "), weight: 2 },
    { text: input.resumeText, weight: 1 }
  ];

  let best = { key: "general", score: 0 };

  for (const [key, profile] of Object.entries(ROLE_PROFILES)) {
    const score = weightedSources.reduce((sourceSum, source) => {
      const haystack = source.text.toLowerCase();
      const sourceScore = profile.matchKeywords.reduce((sum, keyword) => {
        return haystack.includes(keyword.toLowerCase()) ? sum + source.weight : sum;
      }, 0);
      return sourceSum + sourceScore;
    }, 0);

    if (score > best.score) {
      best = { key, score };
    }
  }

  return best.key;
}

export function inferCandidateStage(rawInput = {}) {
  const input = normalizeInput(rawInput);
  if (input.candidateStage) return input.candidateStage;

  const haystack = [input.resumeText, ...input.targetRoles].join(" ").toLowerCase();
  if (haystack.includes("实习") || haystack.includes("intern")) return "internship";
  if (haystack.includes("校招") || haystack.includes("应届") || haystack.includes("毕业生")) return "campus";
  if (haystack.includes("社招") || haystack.includes("年经验") || haystack.includes("工作经验")) {
    return "experienced";
  }
  return "unknown";
}

function buildAssumptions(input, profile) {
  const assumptions = [];
  if (input.targetJDs.length === 0) {
    assumptions.push(`未提供 JD，以下岗位要求按${profile.displayName}通用要求推断`);
  }
  if (input.targetRoles.length === 0) {
    assumptions.push("未提供明确目标岗位，主投方向基于简历和行业关键词推断");
  }
  if (!hasAnyValue(input.applicationHistory)) {
    assumptions.push("未提供投递历史，零回复诊断将以常见漏斗问题为主");
  }
  if (!hasQuantitativeEvidence(input.resumeText)) {
    assumptions.push("简历缺少量化成果，所有成果数据均需用户补充，不得代为编造");
  }
  if (isBroadTarget(input)) {
    assumptions.push("目标范围较宽，需收窄为 1 个主方向和 2 个辅助方向");
  }
  return assumptions;
}

function inferTargets(input, profile) {
  const cleanedRoles = input.targetRoles.filter(Boolean);
  const broad = isBroadTarget(input);

  if (cleanedRoles.length > 0 && !broad) {
    return {
      primaryRole: cleanedRoles[0],
      secondaryRoles: cleanedRoles.slice(1, 3).concat(profile.defaultSecondaryRoles).slice(0, 2),
      notRecommendedRoles: profile.notRecommendedRoles
    };
  }

  return {
    primaryRole: profile.defaultPrimaryRoles[0],
    secondaryRoles: profile.defaultSecondaryRoles.slice(0, 2),
    notRecommendedRoles: profile.notRecommendedRoles
  };
}

function buildRoleModel(input, profile) {
  const jdKeywords = extractKeywords(input.targetJDs.join(" "));
  const model = profile.roleModel;

  return {
    hardSkills: unique([...model.hardSkills, ...jdKeywords.hardSkills]),
    tools: unique([...model.tools, ...jdKeywords.tools]),
    industryKnowledge: unique([...model.industryKnowledge, ...jdKeywords.industryKnowledge]),
    experienceSignals: model.experienceSignals,
    measurableOutcomes: model.measurableOutcomes,
    softSkills: model.softSkills,
    credentials: model.credentials,
    portfolioNeeds: model.portfolioNeeds
  };
}

function buildKeywordMap(input, roleModel) {
  const required = unique([
    ...roleModel.hardSkills,
    ...roleModel.tools,
    ...roleModel.industryKnowledge,
    ...extractKeywords(input.targetJDs.join(" ")).all
  ]).slice(0, 36);

  const resume = input.resumeText.toLowerCase();
  const covered = required.filter((keyword) => resume.includes(keyword.toLowerCase()));
  const missing = required.filter((keyword) => !resume.includes(keyword.toLowerCase()));
  const strengthen = covered.filter((keyword) => !hasEvidenceNearKeyword(input.resumeText, keyword));
  const removeOrWeaken = GENERIC_SELF_EVAL_WORDS.filter((word) => input.resumeText.includes(word));

  if (input.resumeText.includes("精通") && input.resumeText.length < 1000) {
    removeOrWeaken.push("精通");
  }

  return {
    required,
    covered,
    missing,
    strengthen,
    removeOrWeaken: unique(removeOrWeaken)
  };
}

function extractKeywords(text = "") {
  const lower = text.toLowerCase();
  const all = HARD_KEYWORDS.filter((keyword) => lower.includes(keyword.toLowerCase()));
  return {
    all,
    hardSkills: all.filter((keyword) =>
      ["sql", "python", "java", "javascript", "typescript", "用户增长", "竞品分析", "需求分析", "数据分析", "活动策划", "内容运营", "财务报表", "风控"].includes(keyword)
    ),
    tools: all.filter((keyword) =>
      ["excel", "ppt", "figma", "axure", "pr", "ae", "git", "linux", "crm", "spss", "tableau", "power bi"].includes(keyword)
    ),
    industryKnowledge: all.filter((keyword) => ["作品集"].includes(keyword))
  };
}

function detectRiskFlags(input, completeness, keywordMap) {
  const flags = [];
  const historyCount = Number(input.applicationHistory.count || 0);

  if (completeness.missingCriticalFields.includes("目标 JD")) {
    flags.push("缺少目标 JD，关键词和岗位能力模型只能按通用要求推断");
  }
  if (isBroadTarget(input)) {
    flags.push("目标岗位过宽，招聘官难以判断稳定求职意图和岗位匹配度");
  }
  if (!hasQuantitativeEvidence(input.resumeText)) {
    flags.push("经历缺少量化成果，容易被判断为只写职责或课程描述");
  }
  if (/课程|大作业|课堂|实验报告|课程设计/.test(input.resumeText)) {
    flags.push("项目表达像课程作业，需要补真实场景、个人贡献和交付结果");
  }
  if (/负责|参与|协助/.test(input.resumeText) && !/提升|增长|降低|完成|交付|上线|转化|复盘/.test(input.resumeText)) {
    flags.push("经历偏职责罗列，缺少动作后的结果和业务价值");
  }
  if (keywordMap.missing.length > keywordMap.covered.length) {
    flags.push("目标岗位关键词覆盖不足，ATS 和招聘官快速扫描都会吃亏");
  }
  if (historyCount >= 100) {
    flags.push("投递已达 100 份仍无有效反馈，应重做定位、简历首屏和渠道策略");
  } else if (historyCount >= 50) {
    flags.push("投递已达 50 份仍无有效反馈，应暂停泛投并复盘 JD 匹配与渠道");
  }
  if (input.applicationHistory.resumeCustomized === false) {
    flags.push("未定制简历，容易出现岗位关键词错位和经历排序不匹配");
  }

  return unique(flags);
}

function isBroadTarget(input) {
  const joined = [...input.targetIndustries, ...input.targetRoles].join(" ");
  if (!joined) return false;
  return (
    input.targetRoles.length > 3 ||
    input.targetIndustries.length > 3 ||
    /不确定|都可以|均可|不限|随便|互联网.*金融|金融.*互联网|运营.*产品|产品.*运营/.test(joined)
  );
}

function hasQuantitativeEvidence(text = "") {
  return /\d|%|用户量|营收|gmv|转化率|增长率|降低|提升|成本|周期|准确率|留存|点击|阅读|曝光|成交/.test(text);
}

function hasEvidenceNearKeyword(text = "", keyword = "") {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index < 0) return false;
  const windowText = text.slice(Math.max(0, index - 60), index + keyword.length + 80);
  return hasQuantitativeEvidence(windowText) || /项目|报告|上线|复盘|交付|作品|案例/.test(windowText);
}

function hasAnyValue(value) {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value !== "object") return Boolean(value);

  return Object.values(value).some((item) => {
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === "object" && item !== null) return hasAnyValue(item);
    return item !== undefined && item !== null && item !== "";
  });
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function unique(items) {
  const seen = new Set();
  const result = [];

  for (const item of items.filter(Boolean)) {
    const key = String(item).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

function fencedJson(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
