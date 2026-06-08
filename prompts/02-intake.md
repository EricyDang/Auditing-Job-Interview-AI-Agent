# Intake Prompt

请从用户输入中抽取求职审计所需信息，并转成 `CandidateInput`。

## 抽取字段

- `resumeText`：简历全文。
- `targetIndustries`：目标行业列表。
- `targetRoles`：目标职位列表。
- `targetJDs`：1-3 个目标岗位 JD。
- `candidateStage`：`internship`、`campus`、`experienced` 或 `unknown`。
- `applicationHistory`：投递数量、平台、岗位、城市、是否内推、是否定制简历、反馈。
- `constraints`：城市、远程、每周天数、到岗时间、薪资、长期实习、出差、轮岗。
- `materials`：作品集、GitHub、领英、证书、成绩单、推荐信。

## 抽取规则

- 只抽取用户明确提供的信息。
- 不要把猜测写进 `CandidateInput`，猜测应进入 `AuditState.assumptions`。
- 如果用户没有提供某字段，字段可以为空或省略。
- 如果用户说“不确定”“都可以”，保留原始表达，后续由目标明确化模块处理。
