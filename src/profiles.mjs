export const ROLE_PROFILES = {
  tech: {
    displayName: "技术/数据岗",
    matchKeywords: [
      "前端",
      "后端",
      "开发",
      "算法",
      "测试",
      "运维",
      "数据分析",
      "数据工程",
      "工程师",
      "java",
      "python",
      "react",
      "vue",
      "sql"
    ],
    defaultPrimaryRoles: ["数据分析实习", "前端开发实习", "后端开发实习"],
    defaultSecondaryRoles: ["测试开发实习", "技术支持实习"],
    notRecommendedRoles: ["纯销售岗", "无技术交付要求的泛运营岗"],
    roleModel: {
      hardSkills: ["编程基础", "数据结构/数据库基础", "问题拆解", "调试与工程化"],
      tools: ["Git", "SQL", "Python/Java/JavaScript", "IDE", "Linux 或命令行"],
      industryKnowledge: ["目标业务场景", "系统稳定性", "数据口径", "研发协作流程"],
      experienceSignals: ["可运行项目", "代码仓库", "线上或真实用户场景", "技术选型说明"],
      measurableOutcomes: ["性能提升", "缺陷减少", "接口耗时", "用户量", "数据处理规模"],
      softSkills: ["需求澄清", "技术沟通", "复盘能力", "跨职能协作"],
      credentials: ["计算机相关课程", "竞赛/证书可加分但非必须"],
      portfolioNeeds: ["GitHub", "项目 Demo", "技术文档", "数据分析报告"]
    },
    interviewAddOns: ["技术基础", "项目追问", "边界条件", "复杂度或性能取舍"]
  },
  product: {
    displayName: "产品岗",
    matchKeywords: ["产品", "pm", "需求", "竞品", "原型", "用户体验", "prd", "axure", "figma"],
    defaultPrimaryRoles: ["产品助理", "产品实习生"],
    defaultSecondaryRoles: ["用户研究实习", "项目助理"],
    notRecommendedRoles: ["强代码开发岗", "纯销售岗"],
    roleModel: {
      hardSkills: ["需求分析", "用户场景拆解", "竞品分析", "数据分析", "PRD 写作"],
      tools: ["Axure/Figma", "墨刀", "Excel", "SQL 加分", "飞书/Notion"],
      industryKnowledge: ["业务流程", "用户分层", "核心指标", "增长或转化链路"],
      experienceSignals: ["完整需求文档", "原型图", "调研记录", "数据复盘", "跨团队推进"],
      measurableOutcomes: ["转化率", "留存率", "点击率", "需求上线周期", "用户反馈改善"],
      softSkills: ["结构化表达", "推动协作", "优先级判断", "同理心"],
      credentials: ["专业不限，商科/计算机/设计背景可加分"],
      portfolioNeeds: ["PRD", "竞品分析", "原型链接", "产品复盘"]
    },
    interviewAddOns: ["需求分析", "竞品分析", "数据分析", "产品判断题"]
  },
  operations: {
    displayName: "运营岗",
    matchKeywords: ["运营", "用户增长", "内容", "活动", "社群", "新媒体", "电商", "小红书", "公众号"],
    defaultPrimaryRoles: ["用户运营实习", "内容运营实习", "活动运营实习"],
    defaultSecondaryRoles: ["新媒体运营实习", "社群运营实习"],
    notRecommendedRoles: ["纯研发岗", "强财务核算岗"],
    roleModel: {
      hardSkills: ["用户分层", "内容策划", "活动策划", "数据复盘", "转化漏斗"],
      tools: ["Excel", "飞书/企微", "公众号/小红书/抖音后台", "数据看板工具"],
      industryKnowledge: ["用户生命周期", "平台规则", "内容分发机制", "增长指标"],
      experienceSignals: ["活动方案", "内容案例", "社群管理", "投放或增长实验", "复盘文档"],
      measurableOutcomes: ["阅读量", "互动率", "转化率", "新增用户", "留存", "GMV"],
      softSkills: ["执行力", "用户沟通", "跨部门协作", "节奏管理"],
      credentials: ["专业不限，平台运营经验和作品更重要"],
      portfolioNeeds: ["内容作品", "活动复盘", "账号数据截图", "运营 SOP"]
    },
    interviewAddOns: ["用户增长", "内容运营", "活动运营", "数据复盘题"]
  },
  marketingSales: {
    displayName: "市场/销售岗",
    matchKeywords: ["市场", "销售", "商务", "bd", "渠道", "客户", "品牌", "投放", "媒介", "转化"],
    defaultPrimaryRoles: ["市场实习", "销售管培生", "商务拓展实习"],
    defaultSecondaryRoles: ["品牌实习", "渠道运营实习"],
    notRecommendedRoles: ["纯研发岗", "强后台财务岗"],
    roleModel: {
      hardSkills: ["客户洞察", "线索转化", "渠道分析", "活动执行", "销售漏斗"],
      tools: ["Excel", "CRM", "企微", "广告投放后台", "PPT"],
      industryKnowledge: ["客户画像", "竞品定位", "渠道成本", "转化路径"],
      experienceSignals: ["客户沟通", "渠道拓展", "活动执行", "销售线索跟进", "业绩复盘"],
      measurableOutcomes: ["线索数", "转化率", "成交额", "客单价", "ROI", "渠道成本"],
      softSkills: ["抗压", "沟通说服", "目标感", "复盘迭代"],
      credentials: ["专业不限，行业理解和业务敏感度更重要"],
      portfolioNeeds: ["活动方案", "客户案例", "渠道复盘", "销售话术"]
    },
    interviewAddOns: ["客户沟通", "转化", "渠道", "业绩压力题"]
  },
  finance: {
    displayName: "财务/金融岗",
    matchKeywords: ["财务", "会计", "审计", "金融", "投研", "风控", "银行", "证券", "基金", "excel"],
    defaultPrimaryRoles: ["财务助理", "金融分析实习", "风控实习"],
    defaultSecondaryRoles: ["审计实习", "投研助理"],
    notRecommendedRoles: ["纯视觉设计岗", "无数据要求的泛内容岗"],
    roleModel: {
      hardSkills: ["财务基础", "Excel 建模", "数据处理", "行业研究", "风险意识"],
      tools: ["Excel", "Wind/Choice 加分", "Python/SQL 加分", "PPT"],
      industryKnowledge: ["会计准则", "财务报表", "估值逻辑", "风控流程", "宏观与行业指标"],
      experienceSignals: ["报表分析", "数据清洗", "尽调/审计底稿", "行业研究报告"],
      measurableOutcomes: ["处理数据量", "报告数量", "核对准确率", "流程时效", "风险识别"],
      softSkills: ["严谨", "保密意识", "逻辑表达", "细节管理"],
      credentials: ["CPA/ACCA/CFA/基金从业等按岗位加分"],
      portfolioNeeds: ["研究报告", "财务模型", "Excel 样表", "案例分析"]
    },
    interviewAddOns: ["Excel", "财务基础", "风控", "数据处理", "行业理解题"]
  },
  designMedia: {
    displayName: "设计/传媒岗",
    matchKeywords: ["设计", "视觉", "ui", "ux", "传媒", "视频", "剪辑", "文案", "作品集", "创意"],
    defaultPrimaryRoles: ["视觉设计实习", "新媒体内容实习", "视频剪辑实习"],
    defaultSecondaryRoles: ["UI 设计实习", "品牌设计实习"],
    notRecommendedRoles: ["强财务核算岗", "纯后端开发岗"],
    roleModel: {
      hardSkills: ["视觉表达", "创意策划", "用户审美判断", "项目复盘", "内容叙事"],
      tools: ["Figma", "Photoshop", "Illustrator", "Premiere/剪映", "After Effects 加分"],
      industryKnowledge: ["品牌调性", "平台内容规则", "用户审美趋势", "传播路径"],
      experienceSignals: ["作品集", "上线作品", "内容数据", "创作流程", "客户或团队反馈"],
      measurableOutcomes: ["曝光", "互动", "转化", "交付周期", "采纳率"],
      softSkills: ["审美沟通", "需求理解", "反馈迭代", "时间管理"],
      credentials: ["作品集重要性高于证书"],
      portfolioNeeds: ["作品集链接", "项目背景", "设计过程", "成品与复盘"]
    },
    interviewAddOns: ["作品集", "审美判断", "创作流程", "项目复盘题"]
  },
  hrAdmin: {
    displayName: "人力/行政岗",
    matchKeywords: ["hr", "人力", "招聘", "行政", "员工关系", "培训", "薪酬"],
    defaultPrimaryRoles: ["HR 实习", "招聘助理", "行政助理"],
    defaultSecondaryRoles: ["培训运营实习", "组织发展助理"],
    notRecommendedRoles: ["强技术研发岗", "高压纯销售岗"],
    roleModel: {
      hardSkills: ["简历筛选", "面试邀约", "流程跟进", "信息整理", "劳动法规基础"],
      tools: ["Excel", "招聘平台", "飞书/钉钉", "HRIS 加分"],
      industryKnowledge: ["招聘漏斗", "候选人体验", "组织流程", "基础劳动法规"],
      experienceSignals: ["招聘支持", "活动组织", "数据台账", "流程 SOP", "沟通协调"],
      measurableOutcomes: ["邀约量", "到面率", "入职转化", "流程时效", "准确率"],
      softSkills: ["亲和力", "保密意识", "耐心", "协调推进"],
      credentials: ["人力资源相关课程/证书可加分"],
      portfolioNeeds: ["招聘漏斗表", "SOP", "活动复盘"]
    },
    interviewAddOns: ["招聘漏斗", "候选人沟通", "流程管理", "保密与合规题"]
  },
  general: {
    displayName: "通用职能岗",
    matchKeywords: [],
    defaultPrimaryRoles: ["运营助理", "项目助理", "管培生"],
    defaultSecondaryRoles: ["市场实习", "人力实习"],
    notRecommendedRoles: ["强专业门槛岗位", "与经历完全无关的岗位"],
    roleModel: {
      hardSkills: ["结构化表达", "信息整理", "执行推进", "基础数据分析"],
      tools: ["Excel", "PPT", "飞书/钉钉", "文档协作工具"],
      industryKnowledge: ["目标行业基本商业模式", "岗位核心指标", "常见业务流程"],
      experienceSignals: ["项目推进", "跨团队协作", "复盘文档", "可验证交付物"],
      measurableOutcomes: ["交付周期", "参与人数", "覆盖用户", "效率提升", "错误率降低"],
      softSkills: ["学习能力", "沟通协作", "责任心", "抗压"],
      credentials: ["按岗位要求判断"],
      portfolioNeeds: ["项目文档", "复盘报告", "案例材料"]
    },
    interviewAddOns: ["岗位基础", "经历深挖", "行为面试", "反问准备"]
  }
};

export const REPORT_SECTION_TITLES = [
  "信息完整度判断",
  "零回复诊断",
  "目标职位明确化",
  "行业与岗位能力模型",
  "简历与关键词审查",
  "招聘官视角重写",
  "经历可信度与成果表达优化",
  "应聘策略构建",
  "冷邮件/私信模板",
  "面试问题模拟",
  "最终求职系统"
];
