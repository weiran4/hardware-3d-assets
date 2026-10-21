# 第一组通用硬件 · 用户评分卡

**用户接受状态：pending。** 技术检查通过不代替用户的明确接受。未进入 RTDS 或交互网站阶段。

| 评分项 | 1–5 分 | 用户意见 |
|---|---:|---|
| 外观一致性 | 待评 | |
| 识别细节 | 待评 | |
| 端口可读性 | 待评 | |
| 活动部件准备 | 待评 | |
| 复用便利性 | 待评 | |

1 = 明显不足；3 = 可用但需改进；5 = 达到预期。分数不自动放行；需要用户明确接受，否则改进后复评。

## 审阅位置

- `deliverables/contact-sheet.png`：整组与单件预览。
- `generic/oscilloscope/`：示波器。
- `generic/trigger-controller/`：触发脉冲控制器。
- `generic/signal-cable/`：带独立两端接头及锚点的信号线。
- `generic/sample-scene/`：原比例组合，线缆未连接。
- 各资产 `qa/report.json` 与 `qa/roundtrip.json`：实测及实际导出文件回导检查。
- `qa/rebuild-comparison.json`：全新进程重建后的规范化比较，四项均 PASS；诊断图复用范围有明确记录。
- `qa/independent-review.json`：独立审阅证据，PASS_WITH_STATED_LIMITATIONS，无剩余阻断。

## 已知边界

这些是原创虚构练习设备；尺寸不是厂家数据，BNC 状外观不是接口标准认证。电气约束为 null、物理兼容性 unknown。模型不能作为真实设备接线依据。

轮廓线、奶油背景和灯光只属于 Blender 预览，不随 GLB 导出。GLB 保留静态网格、简单材质、部件层级、语义 ID 和端口锚点；没有电气仿真或动画剪辑。

独立技术审阅和重建最终结果已附在同包 QA 文件中；用户评分仍留空。
