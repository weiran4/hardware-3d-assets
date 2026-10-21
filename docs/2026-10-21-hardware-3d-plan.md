# 通用硬件三维样例 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 dot 云电脑制作原创通用示波器、触发脉冲控制器及信号线，形成可评分、可复用的首组低多边形资产。

**Architecture:** 一个主建模者顺序维护共享约定；每个资产由全新 Blender 进程构建，先检查再渲染。独立 QA 读取实际交付文件，不以生成器自行声称成功为证据；第一台示波器先出图并做小型 GLB 回导，再扩展整组。

**Tech Stack:** 已有 Blender 4.3.2、原生 Blender Python、Cycles CPU、glTF 2.0；纯数据测试用系统 Python 标准库 unittest，不安装依赖。

**Spec:** `docs/2026-10-21-hardware-3d-design.md`（已获用户批准）；同时阅读 `skills/blender-hardware-lowpoly/SKILL.md` 及其 references，后者仍是 UNVALIDATED 学习草稿。

## Global Constraints

- 当前只编写计划；下列任务、文件、命令和 PASS 均为未来要求，尚未执行。须用户审阅本计划并选择执行方式，才可制作。
- 奶油色背景、细深色轮廓、正交或等距视角、低饱和哑光配色；真实三维，不做照片级材质或不可见内部结构。
- 以米为单位，对象尺度归一为 1；右手坐标、Z 轴向上、正面朝 -Y、+X 指向正面视图右侧；根节点位于落地面中心。
- 控制器不超过 5,000、示波器不超过 8,000、信号线不超过 2,000、整组不超过 15,000 三角面；统计应用修改器后的实际导出网格及放置实例。
- 1 至 2 段倒角；旋钮、按钮、端口、接头独立，保留稳定 ID、真实活动轴心及端口锚点。
- Freestyle 仅用于预览，GLB 不含轮廓线；不增加轮廓壳。若以后改变方案，壳体必须计入预算并另行确认。必须另交无轮廓中性 QA 图。
- 仅用云端 CPU；不切换用户笔记本，不假定 GPU。每次执行核对实际 Blender、Python 和导出器版本；版本不符时暂停说明。
- 不制作 RTDS、不建站、不做电气仿真或真实兼容性认证；参考截图留在项目外，不复制第三方资产、代码或个人社交界面。
- 不创建 GitHub 仓库、不 git init、不提交。云端暂存不是持久备份；采用本地版本检查点，未来获准建私有仓库后再提交。

## Review Focus

1. 单位或轴向错误：应拒绝厘米当米、前后颠倒；Task 1 的 `TestScope.test_units_axes_dimensions` 负责。
2. 镜像尺度或旋钮带动根节点：应拒绝负尺度并证明运动局部独立；Task 2 的 `TestReuse.test_scale_pivot_isolation` 负责。
3. 锚点或语义丢失：回导不得少节点、重 ID 或错父级；Task 3 的 `TestDelivery.test_anchor_metadata_roundtrip` 负责。
4. 修改器和实例导致面数膨胀：必须统计放置总数而非仅唯一网格；Task 3 的 `TestDelivery.test_placed_geometry_budget` 负责。
5. 重跑漂移或资源缺失：相同输入应生成相同规范化资产，缺资源即失败；Task 4 的 `TestRepeat.test_clean_rerun_resources` 负责。

---

## 文件职责与数据契约

以下均为拟创建路径，根目录为 `hardware-3d-assets/`，不在本次计划编写中创建。

- `tools/build.py`：CLI、按路径加载资产模块、检查顺序、保存及导出；不放具体设备造型。
- `tools/asset_common.py`：共享部件、材质及纯数据校验；顶层不导入 bpy，使 unittest 可独立运行。
- `tools/qa_asset.py`：在 Blender 重开文件，实测几何、轴心、资源和 ID；输出 `qa/report.json`。
- `tools/qa_roundtrip.py`：新场景导入实际 GLB，比较原生与导出结果；输出 `qa/roundtrip.json`。
- `tests/test_contract.py`：四个 unittest 类及独立的有效/故障夹具，不从生成器抄出预期值。
- 对每个 `<asset>` = `oscilloscope`、`trigger-controller`、`signal-cable`：`generic/<asset>/source/build.py` 负责造型；`parameters.json` 负责参数；`references/manifest.json` 负责来源与未知项；`metadata/ports.json` 是语义权威记录。
- 每个资产拟交付 `source/asset.blend`、`exports/asset.glb`、`previews/{front,rear,left,right,top,iso,neutral,wireframe}.png` 和 `qa/{report,roundtrip}.json`。图为 1024×1024；iso 为插画预览，neutral 为无轮廓检查。
- `generic/sample-scene/` 同样包含 `source/build.py`、`parameters.json` 和上述交付目录；只组合已验收的三个资产，不复制其生成逻辑。
- `checkpoints/<task>-<run>/<asset>/` 保存每次候选交付及 `checkpoint.json`（输入版本、seed、文件 SHA-256、检查结果），并保留当次 build/common/QA 脚本及参数的精确源文件快照，不能只留哈希；失败候选保留，不覆盖上个通过版本。通过后才将生成文件复制到对应 `generic/` 位置，不覆盖构建脚本或输入参数。
- `docs/2026-10-21-stage1-scorecard.md` 将记录五项用户评分、独立审阅及明确接受状态；默认 `pending`。

### 本次原创概念参数

所有尺寸都是本项目的虚构设计，不是厂家数据。示波器机壳 W×D×H = **0.28×0.16×0.13 m**，控制器为 **0.18×0.12×0.07 m**，均不含旋钮/接头突出；信号线线身中心线长 **0.60 m**、外径 **0.005 m**，长度不含两端接头延伸。尺寸检查针对 body 节点，整体包围盒另报 `asset_bounds_m`。参数写入 JSON，seed 固定 **42**。CPU、1024×1024、32 samples；相机/灯光变换、曝光及视图变换在 Task 1 确定后冻结入参数，后续重跑不变。

示波器至少有 body、screen、knob、button、CH1/TRIG 两端口；控制器至少有 body、knob、button、OUT 端口；线缆有 body、connector_a、connector_b、end_a/end_b 锚点。ID 统一为 `<asset>.<part-or-port>`，端口后缀固定 ch1、trig、out、end_a、end_b，不随排序变化。BNC 状外壳只是通用视觉造型；CH1、TRIG、OUT 是示意标签，不推断电压、阻抗、频率或引脚。

### 接口

- 三个资产及场景模块：`build_asset(config: dict) -> dict[str, object]`。返回 `asset_id: str`、`root: str`（Blender 对象名）、`parts: dict[str,str]`、`anchors: dict[str,str]`；后两者是稳定 ID 到对象名的映射，不返回不可序列化的 bpy 对象。
- `tools/asset_common.py`：`validate_contract(report: dict, config: dict) -> list[str]` 返回错误码，空列表才通过；`compare_runs(first: dict, second: dict) -> list[str]` 比较规范化结果。
- `tools/qa_asset.py`：`inspect_asset(asset_dir: str, config: dict) -> dict`；重开 `source/asset.blend`，独立测量并返回 report。
- `tools/qa_roundtrip.py`：`check_roundtrip(asset_dir: str, config: dict) -> dict`；原生与回导场景均转换回 Blender 约定后比较，导出时仅一次 Y-up 转换，不手动再转一次。
- CLI：`--asset` 为上述三名或 `sample-scene`；`--output` 为新检查点路径；`--seed 42`。输入一律读取 `generic/<asset>/parameters.json` 与 `source/build.py`；场景输入为三个已通过的 `generic/<asset>/source/asset.blend`。已有输出目录必须报错，避免覆盖。

`parameters.json` 至少含 `asset_id, seed, body_dimensions_m`（设备）或 `cable_length_m,cable_diameter_m`（线缆）、`triangle_budget, required_part_ids, required_anchor_ids`；场景含三个 `members` 相对路径及 15000 预算。

`ports.json` 含 `asset_id, unit="m", frame="BLENDER_Z_UP_FRONT_NEG_Y", ports[]`。每端口含 `id,parent_id,anchor_name,label,connector,signal_type,direction,position_m,orientation_wxyz,normal,physical_compatibility,electrical_constraints`。局部 +Z 向外、+Y 为键位上方；四元数顺序 w,x,y,z。兼容性默认 `unknown`，未确认的约束为 null；自定义属性及 GLB extras 只是镜像，sidecar 不能省略。来源清单记录 URL、日期、视角、尺寸依据、许可与未知项。

`report` 至少含 `asset_id,status,errors,unit_scale,body_dimensions_m,asset_bounds_m,basis,negative_scale_count,root_drift_m,part_ids,anchor_ids,port_records,unique_triangles,placed_triangles,curve_mesh_triangles,missing_resources,geometry_digest,semantic_digest,material_digest`；线缆另含 `cable_length_m,cable_diameter_m,connector_count`。`basis` 记录 right/up/front。检查结果不得仅由原输入参数回填。

## Task 1 示波器风格样例与共享契约

**Files:** 创建 tools/build.py、tools/asset_common.py、tools/qa_asset.py、tools/qa_roundtrip.py 的最小可用版本、tests/test_contract.py，以及 generic/oscilloscope/ 输入文件；生成文件只写候选检查点。

**Interfaces:** 消费上节 JSON 契约；产出 `build_asset`、`validate_contract`、`inspect_asset`、`check_roundtrip` 及第一份可重开/回导的示波器交付。

- [ ] **1 写失败测试**：`TestScope` 用独立固定夹具；先验证有效报告通过，再逐一删 body/knob/CH1、重复 ID、将面数设为 8001、单位设为 0.01、前向改为 +Y、宽度改为 0.56。每个错误都必须失败。

```python
self.assertEqual(validate_contract(self.scope_ok, self.scope_cfg), [])
self.assertIn("units", validate_contract(self.scope_cm, self.scope_cfg))
self.assertIn("axes", validate_contract(self.scope_reversed, self.scope_cfg))
self.assertIn("dimensions", validate_contract(self.scope_double_width, self.scope_cfg))
self.assertIn("budget", validate_contract(self.scope_8001, self.scope_cfg))
```

- [ ] **2 运行红灯**：`PYTHONPATH=tests python3 -m unittest test_contract.TestScope -v`；应因尚无实现或断言失败而非零退出。
- [ ] **3 实现最小示波器**：按接口构建机壳、屏幕、操控件、锚点和共享色板；Principled 哑光材质，无材质动画。验证基础契约后才保存/渲染；可编辑曲线/标签只在导出副本中网格化。先测试 Freestyle 离线轮廓，若不支持则报告原因，不静默加入壳体。
- [ ] **4 运行绿灯与实物证据**：同一 unittest 命令应为 OK；执行下方 Task 1 构建及 QA 命令，均须 PASS/退出码 0。导出后机壳尺寸误差每轴 ≤ max(目标值的 1%, 0.001 m)，right/up/front 点积均 > 0.999。
- [ ] **5 先交预览并留检查点**：发送 iso、neutral、wireframe 三图及小 GLB 的检查摘要，征求早期风格反馈，不等整组完成；这不是整组评分通过。写 t1 检查点后才进入复用；反馈要求改变方向时先调整，不顺带扩展范围。

## Task 2 控制器与信号线复用

**Files:** 创建 generic/{trigger-controller,signal-cable}/ 输入；修改 tools/asset_common.py、tools/qa_asset.py、tests/test_contract.py。

**Interfaces:** 消费 Task 1 的构建/检查接口；两模块产生同格式返回值与报告，不另造导出协议。

- [ ] **1 写失败测试**：`TestReuse` 注入负尺度、转动旋钮时根节点漂移、线长错误、只有一个接头，以及删除 electrical_constraints 字段；未知值允许 null，缺字段不允许。

```python
self.assertIn("negative_scale", validate_contract(self.mirrored, self.controller_cfg))
self.assertIn("root_motion", validate_contract(self.root_moved, self.controller_cfg))
self.assertIn("cable_length", validate_contract(self.short_cable, self.cable_cfg))
self.assertIn("connectors", validate_contract(self.one_connector, self.cable_cfg))
self.assertIn("metadata", validate_contract(self.missing_field, self.cable_cfg))
```

- [ ] **2 运行红灯**：`PYTHONPATH=tests python3 -m unittest test_contract.TestReuse -v`，应非零失败。
- [ ] **3 实现复用**：共用旋钮/连接器模块与材质，独立对象变换；线身保留可编辑曲线，导出副本网格化。旋钮试转 ±15°、按钮试移 0.001 m 后还原，根节点漂移 ≤ 0.000001 m，其他部件不跟动；不交付动画剪辑。
- [ ] **4 运行绿灯与实测**：同一测试为 OK；顺序构建/QA 两资产，不并行修改 Blender。线长误差 ≤ 0.006 m、外径误差 ≤ 0.0001 m，两个接头完整；各自满足 5000/2000 面预算。
- [ ] **5 留检查点**：记录共享模块在两设备中的复用、独立轴心和中性视图；通过后才复制候选生成文件到 generic/ 的已接受位置。

## Task 3 整组组合与导出回归

**Files:** 创建 generic/sample-scene/ 输入；扩展 tools/qa_roundtrip.py、tests/test_contract.py。

**Interfaces:** 场景 `build_asset` 只读取已通过的三份 .blend；`check_roundtrip` 输出 `status,errors,dimension_error_m,axis_min_dot,anchor_max_error_m,missing_ids,duplicate_ids,parent_mismatches,material_mismatches,curve_mesh_present,placed_triangles`。

- [ ] **1 写失败测试**：`TestDelivery` 注入漏锚点、错父级、重复 ID、sidecar 缺失、回导材质丢失、曲线未导出；另用唯一网格 8000 但放置总数 16000 的报告，必须拒绝。

```python
self.assertIn("anchors", validate_contract(self.anchor_missing, self.scene_cfg))
self.assertIn("metadata", validate_contract(self.ports_missing, self.scene_cfg))
self.assertIn("budget", validate_contract(self.unique_8000_placed_16000, self.scene_cfg))
self.assertEqual(self.roundtrip_ok["missing_ids"], [])
self.assertTrue(self.roundtrip_ok["curve_mesh_present"])
```

- [ ] **2 运行红灯**：`PYTHONPATH=tests python3 -m unittest test_contract.TestDelivery -v`，应在新覆盖项上非零失败。
- [ ] **3 实现组合及回导检查**：同一尺度摆放三件套，只展示概念连接，不宣称电气兼容；GLB 静态导出，记录 Blender-only 轮廓及背景不导出的限制。统计全部实例、倒角和曲线网格；中性检查图不让轮廓掩盖缺陷。
- [ ] **4 运行绿灯与回归**：所有既有测试为 OK；重开 .blend 后导出实际 GLB，再开干净场景导入。每轴尺寸差 ≤ max(原尺寸的 1%, 0.001 m)、轴向点积 > 0.999、每锚点位置差 ≤ 0.001 m、方向点积 > 0.999；ID/父级/端口映射完整；材质 ID 保留、base color 每通道差 ≤ 1/255、roughness 差 ≤ 0.001。curve_mesh_present=true，整组 placed_triangles ≤ 15000；不得用唯一网格数替代。
- [ ] **5 留检查点**：保留原生、回导及计数报告；任何必需对象/资源/元数据缺失均 FAIL，修复后重跑，不覆盖前一个通过版本。

## Task 4 独立审阅与评分包

**Files:** 扩展 tools/asset_common.py 的 compare_runs、tests/test_contract.py；创建评分记录；只根据实际证据修改 skills/blender-hardware-lowpoly/references/evaluation.md。

**Interfaces:** 消费前三任务交付文件及报告；`compare_runs` 返回错误码，评分记录与 SKILL 证据不替代测试。

- [ ] **1 写失败测试**：`TestRepeat` 将同输入的 geometry_digest/semantic_digest/material_digest 之一改掉，或增加 missing_resources，必须失败。

```python
self.assertEqual(compare_runs(self.run_a, self.same_run), [])
self.assertIn("geometry", compare_runs(self.run_a, self.geometry_changed))
self.assertIn("metadata", compare_runs(self.run_a, self.semantics_changed))
self.assertIn("materials", compare_runs(self.run_a, self.materials_changed))
self.assertIn("resources", compare_runs(self.run_a, self.resource_missing))
```

- [ ] **2 运行红灯**：`PYTHONPATH=tests python3 -m unittest test_contract.TestRepeat -v`，应非零失败。
- [ ] **3 实现比较并干净重跑**：全新进程、相同参数/seed 42 重建三资产及整组到第二组检查点；比较稳定 ID、拓扑及位置（量化到 0.000001 m）、材质值和语义的规范化摘要。排除时间戳/绝对路径，不要求 .blend/GLB 字节哈希相同；SHA-256 仅验完整性。第二组三资产先分别 QA 通过并复制生成文件，再组合第二场景；固定设置下的图片做视觉对比，不要求字节相同。
- [ ] **4 独立检查**：新审阅者从文件读取证据，复跑 QA、确认缺资源为零，检查所有角度、线框、中性与插画图、端口可读性及活动轴心；确认没有把不支持的 shader、轮廓或材质动画算作已导出。全测试 OK 与独立检查通过缺一不可。
- [ ] **5 提交评分包并停止扩展**：五项各 1 至 5 分：外观一致性、识别细节、端口可读性、活动部件准备、复用便利性。用户明确接受才通过；不能以总分自动放行。更新 SKILL 只说明本样例检验过哪些项，仍需未见资产迁移验证，不宣称整套 SKILL 已生产验证。保留 t4 检查点，等待评分，不进入 RTDS。

## 拟执行命令

执行时 cwd 为项目根。下面全部是未来命令，不代表已运行；Blender 命令应输出 `PASS` 并以 0 退出，任何检查失败以非零退出。unittest 成功标志为 `OK`。

```bash
# Task 1；Task 2 将 asset/output 改为两个对应名称，顺序运行
/usr/bin/blender --background --factory-startup --python-exit-code 1 --python tools/build.py -- --asset oscilloscope --output checkpoints/t1-r01/oscilloscope --seed 42
/usr/bin/blender --background --factory-startup --python-exit-code 1 --python tools/qa_asset.py -- --asset-dir checkpoints/t1-r01/oscilloscope
/usr/bin/blender --background --factory-startup --python-exit-code 1 --python tools/qa_roundtrip.py -- --asset-dir checkpoints/t1-r01/oscilloscope
# Task 3；已通过资产文件到位后才组合
/usr/bin/blender --background --factory-startup --python-exit-code 1 --python tools/build.py -- --asset sample-scene --output checkpoints/t3-r01/sample-scene --seed 42
# 对每个候选目录运行上面两条 QA 命令；Task 4 将 run 改为 r02
python3 -m unittest discover -s tests -p test_contract.py -v
```

tools/qa_asset.py 与 tools/qa_roundtrip.py 的 CLI 用 --asset-dir 读取候选目录中的 parameters.json 快照，写报告后按 errors 决定退出码。构建器必须保存此快照与来源清单；后续 QA 不依赖可能已改变的工作参数。

## 自审与执行方式

- [x] 已对照批准规格覆盖风格、三件套、交付、来源、未知项、评分与阶段边界。
- [x] 文件、接口及报告名一致；五类高风险失败各有所属测试；没有产品实现代码。
- [x] 云端暂存与未建仓库状态明确；所有模型测试均是未来动作。

**建议 Native**：同一主建模者顺序执行四任务，末尾由独立审阅者整体 QA，适合共享部件紧密、首组规模小的样例。采用 superpowers:executing-plans。

**备选 Subagent-driven**：每任务由新代理实现、另一新代理审阅后再继续，最后再整体检查；隔离审阅更充分，但交接成本更高。采用 superpowers:subagent-driven-development。两种方式均不并发修改同一 Blender 场景。

**待用户选择**：本计划是否符合预期，采用 Native 还是 Subagent-driven？收到计划批准及执行方式选择前，停在文档阶段。
