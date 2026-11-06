# 2B NovaCor Light I/O 连接基础版

## 小计划与验收范围

以已发布 b313842 的 2A 接线核心为起点，转入独立的 NovaCor Light 条目。保留既有七类真实模型与所有旧深链接，不将 2.0 模型改名成 Light。现有目录已有 Light 未建模状态，本轮用有依据的接口/参数工具；不虚构端口几何。

来源：2B 修订 20250529，PDF 阅读页106–142。本轮重点109–119（接口、内部I/O、DB25与外接GT），121–123、133–137仅作网络/机间角色摘要。公开内容仅原创事实摘要和交互，不含私人手册、原图、设备信息或凭据。

## 设计取舍

采用原生表单与相邻结果面板，适合端点、版本和针脚的离散检查。暂不制作缺少机械证据的Light三维模型，不以抽象动画暗示硬件时延。课程只在选择Light时显示，2A模拟输出不会跟随Light显示。已获逐章自主执行授权，本计划后直接实施与独立复核。

## 实施顺序

1. 先为独立纯函数写失败测试，再实现内部光纤回接检查、已确认的模拟/数字DB25通道映射、Light外接GT链版本检查。未知值、空值、非整数、错误口/介质、V1卡、级联冲突、超限不能给出匹配结论。正常例、错误例、恢复均可复验。
2. Light专属课程：I1↔I1数字、I2↔I2模拟；上方内部I/O接口与下方计算端口明确分开。通道工具给出信号方向、DB25/Bank、已核对针脚、来源和规格边界。AO pin13及DI表中可疑针脚不作为确定接线依据。
3. 外接GT3–6、Aurora、IRC1–3、GTSYNC、WIF/ETH、GBH与供电的用途区分。四个外接GT口，每口最多8卡，但32仅理论上限；版本/混输入/独占端口约束不能省略。模拟1µs采样/更新条件不是端到端延时。
4. 深链接#rtds-chapter-2b及Light选择一致；切换硬件隐藏内容并暂停旧动画。桌面相邻控制/结果，手机不横向溢出，键盘和减少动态模式可用。
5. 独立事实及代码复核；全套单测、build、完整浏览器测试及桌面/手机/旧3D截图。无WebGL时参数工具可读但不声称3D视觉通过。
6. 精确提交前复查main无变化，非强制更新；既有verify→deploy→smoke-live全部成功，核对匿名线上版本与截图后才报告上线。

## 接口合同

- `checkLightLoop({kind,source,target,medium})`：kind=digital/analogue；source/target=unknown/i1/i2/gt3/aur1；medium=unknown/fibre/copper/signal。返回status及中文message、sourcePages。
- `lightChannelPins({kind,direction,channel})`：kind=analogue/digital；direction=input/output；channel为十进制整数或整数字符串（模拟1–12、数字1–32）。返回status、signalPin、returnPin/groundPins/powerPins、connector、bank、directionLabel、message、sourcePages；不确定针脚返回unknown且signalPin=null。
- `checkLightChain({cards,version,port,timeCritical})`：version=v2/v1/unknown；port=gt3/gt4/gt5/gt6/i1/i2/aur1/unknown。复用有序卡链规则，但来源为PDF119且Light版本限制不可绕过；返回status、errors/unknowns/warnings、cards/cardCount。
- `initNovacorLight(root)`：挂载一次原生交互，不读取真实设备，不维护后台动画。

## 重点回归

- 2A和Light来回切换、直接链接、浏览器前进/后退，旧模拟输出/GTIO供电/PiP不受影响。
- AO pin13及DI pin14/15来源冲突显式显示；不通过索引偏移悄悄把疑点当作确认。
- 数字DO第2个DB25按明确说明复用bank映射；DI第2只保留针脚和Bank未知，V1/未知版本不能通过Light链检查。
- 空白、NaN、小数、负值、超界/未知卡型不能生成可接线结论。
- 采样间隔、同步更新和端到端延时分开，不将页面反馈速度解释为硬件时序。

## 本轮边界

标为基础版/部分覆盖。Light完整三维模型、数字电气电平/负载条件、可疑针脚、具体多机逐端口映射、固件组合、光纤精确选型与端到端时延仍待对应证据；不为机械安装扩展工具，也不声称手册整章已全部覆盖。

## 独立复核修正

第二只DI只明确通道17–32，并无与DO相同的显式重复映射说明。保守保留其全部针脚与Bank编号待核对；新增失败测试覆盖17–32所有通道，修复后通过。查询已确认第一只DI后切到第二只时，旧Ground/V+数据必须清空。2B目录状态更新为内部I/O基础版/完善中。

## 本地验证记录

全套308项单测通过，静态build通过，137项浏览器测试可收集。内部回接、完整模拟通道、数字全部通道及未知第二只DI、版本/卡链输入、独立深链接均有回归。本地Chromium受执行环境socket策略阻挡而无法启动，未声称本地浏览器或视觉通过；实际浏览器执行与桌面/手机/旧模型截图由不变的发布CI门槛完成，最终结果以精确提交工作流为准。

布局检查补充：Light使用独立作用域的标签/输入样式，避免误依赖仅适用于2A的选择控件样式；新增失败/通过测试和浏览器44px控件尺寸断言。

## 发布门槛修复

59272c 的 verify 中306项单测、build与原有132项浏览器回归通过，新增3种Light入口被初始标题焦点断言拦下，deploy未执行。Light无模型加载等待，其即时焦点可能早于浏览器初始fragment处理。修复采用一次性的load后下一帧屏障，随后仍检查route代次/hash/模式及用户输入，不使用任意长延时或重复抢焦点；补充加载未结束期间用户操作/改route的保护回归。最终浏览器与上线结论仍由后续精确提交的门槛和匿名验证确认。
