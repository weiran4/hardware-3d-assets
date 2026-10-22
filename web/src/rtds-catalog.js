// Original, condensed source facts. Reference media are linked, never redistributed.
export const catalog=[
  {
    "id": "novacor-2.0",
    "name": "NovaCor 2.0",
    "revision": "2023 外观 / 20250916 章节",
    "family": "NovaCor",
    "type": "实时仿真机箱",
    "summary": "前面板 12 路模拟输出 + 3 个独立接地孔；后面板 GT、IRC、同步、网络与供电分组。",
    "evidence": [
      {
        "source_id": "NC2-2023",
        "locator": "Brochure pp.1-2"
      },
      {
        "source_id": "NC2-KB",
        "locator": "Article"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 2A; PDF pages 65-105; printed chapter date 2025-09-16"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "partial",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "novacor-light",
    "name": "NovaCor Light",
    "revision": "Light / 2024 资料",
    "family": "NovaCor",
    "type": "实时仿真机箱",
    "summary": "独立的 D-sub 数字与模拟 I/O、内部 I/O、光通信和工作站连接；不能沿用 2.0 的端口布局。",
    "evidence": [
      {
        "source_id": "NCL-2024",
        "locator": "Brochure front/rear and dimensions"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 2B; PDF pages 106-142; printed chapter date 2025-05-29"
      }
    ],
    "confidence": {
      "count": "partial",
      "layout": "observed",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "conflicting",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "novacor-1.0",
    "name": "NovaCor 1.0",
    "revision": "1.0 / 独立版本",
    "family": "NovaCor",
    "type": "实时仿真机箱",
    "summary": "章节记载 12 路前面板模拟输出；其他接口仍需逐项匹配版本资料。",
    "evidence": [
      {
        "source_id": "NC1-KB",
        "locator": "NovaCor article"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 2C; PDF pages 143-180; printed chapter date 2023-05-23"
      }
    ],
    "confidence": {
      "count": "partial",
      "layout": "unknown",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtdi-v2",
    "name": "GTDI V2",
    "revision": "PCB 2.01 / 已装端子状态",
    "family": "GTDI",
    "type": "数字输入卡",
    "summary": "64 路数字输入，8 组 × 8 路；16 个五位可拆端子插头，共 80 个端子位置。",
    "evidence": [
      {
        "source_id": "GTDI-PHOTO",
        "locator": "Visible PCB marking"
      },
      {
        "source_id": "GTIO-2026",
        "locator": "GTDI entry"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 9A; PDF pages 404-425; printed chapter date 2024-12-19"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtdi-v1",
    "name": "GTDI V1",
    "revision": "V1 / 独立版本",
    "family": "GTDI",
    "type": "数字输入卡",
    "summary": "64 路数字输入与 2 个光传输接口；不能把 V2 外观直接改名为 V1。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 9B; PDF pages 426-447; printed chapter date 2020-02-03"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtdo-v2",
    "name": "GTDO V2",
    "revision": "V2 / PCB 2.00 / 20240924 章节",
    "family": "GTDO",
    "type": "数字输出卡",
    "summary": "64 路数字输出，8 组 × 8 路；16 个五位端子插头，共 80 个端子位置。2 个光接口；辅助区域保留待核对。",
    "evidence": [
      {
        "source_id": "GTDO-PHOTO",
        "locator": "Component-side photo"
      },
      {
        "source_id": "GTIO-2026",
        "locator": "GTDO entry"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 8A; PDF pages 362-381; printed chapter date 2024-09-24"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "observed",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "partial",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtdo-v1",
    "name": "GTDO V1",
    "revision": "V1 / 独立版本",
    "family": "GTDO",
    "type": "数字输出卡",
    "summary": "64 路数字输出，2 组 × 32 路；不同于 V2 的分组布局。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 8B; PDF pages 382-403; printed chapter date not found"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtai-v2",
    "name": "GTAI V2",
    "revision": "V2 / PCB 2.31 / 20240924 章节",
    "family": "GTAI",
    "type": "模拟输入卡",
    "summary": "12 路差分模拟输入，±10 V / 16 bit；每路正、负、地三个端子，共 36 个端子位置。",
    "evidence": [
      {
        "source_id": "GTAI-PHOTO",
        "locator": "Component-side photo"
      },
      {
        "source_id": "GTIO-2026",
        "locator": "GTAI entry"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 7; PDF pages 336-361; printed chapter date 2024-09-24"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "observed",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtai-v1",
    "name": "GTAI V1",
    "revision": "V1 / 历史身份待核实",
    "family": "GTAI",
    "type": "模拟输入卡",
    "summary": "目前仅保留版本条目；尚无足够匹配资料确认实体接口。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 7; PDF pages 336-361; printed chapter date 2024-09-24"
      }
    ],
    "confidence": {
      "count": "unknown",
      "layout": "unknown",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtao-v2",
    "name": "GTAO V2",
    "revision": "V2 / PCB 2.20 / 20240924 章节",
    "family": "GTAO",
    "type": "模拟输出卡",
    "summary": "16 路模拟输出，±10 V / 16 bit；每路正端与返回端，共 32 个端子位置。第 13–16 路仅适用于 NovaCor。",
    "evidence": [
      {
        "source_id": "GTAO-PHOTO",
        "locator": "Visible PCB marking"
      },
      {
        "source_id": "GTIO-2026",
        "locator": "GTAO entry"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 6A; PDF pages 276-307; printed chapter date 2024-09-24"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "observed",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtao-v1",
    "name": "GTAO V1",
    "revision": "V1 / 12 通道旧版",
    "family": "GTAO",
    "type": "模拟输出卡",
    "summary": "记载 12 路模拟输出；与 16 路版本分开追踪。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 6B; PDF pages 308-335; printed chapter date 2020-02-03"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtsoc-v2",
    "name": "GTSOC V2",
    "revision": "V2 / Model GTSOC-2A / 16 铜 RJ45 SFP",
    "family": "GTSOC",
    "type": "FPGA 协处理硬件",
    "summary": "在 NovaCor 旁执行专用计算的辅助平台。本模型固定为 16 个铜 RJ45 SFP 的 SV 外观配置；服务口、后部 MMC 监测与光链路各有不同用途，实际应用由固件、模块和许可决定。",
    "scopeNote": "版本边界：铭牌 Model GTSOC-2A；151 个电气接点不包含后部 4 个双工光组件的 8 个白色可见面。白色面是盖还是套筒尚未确认；当前铜模块不作为通用 Aurora / 光纤配接依据。",
    "evidence": [
      {
        "source_id": "SOC2-2026",
        "locator": "官方宣传册，第 1–2 页；固件相关应用与后部黑盒链路"
      },
      {
        "source_id": "SOC2-PHOTO",
        "locator": "16 个铜 RJ45 SFP 前部配置；上下排键位相反"
      },
      {
        "source_id": "MANUAL",
        "locator": "13A GTSOC V2；修订 20240927；章节印刷页 1–8（含第 4 页的前 / 后部措辞冲突）"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtsoc-v1",
    "name": "GTSOC V1",
    "revision": "V1 / 独立版本",
    "family": "GTSOC",
    "type": "FPGA 协处理硬件",
    "summary": "前部 8 个 GT 光接口、3 个 USB 和电源开关；端口角色须按章节与固件核对。",
    "evidence": [
      {
        "source_id": "SOC1-BROCHURE",
        "locator": "Brochure"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 13B; PDF pages 536-542; printed chapter date 2023-10-02"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtnet-v3",
    "name": "GTNET v3",
    "revision": "v3 / 20260504 章节",
    "family": "GTNET",
    "type": "网络接口卡",
    "summary": "仿真器侧 GT A/B，外部 Ethernet AA/AB/BA/BB；保持模块身份与端口次序。",
    "evidence": [
      {
        "source_id": "NET3-KB",
        "locator": "Article"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 5A; PDF pages 227-248; printed chapter date 2026-05-04"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtnet-x2",
    "name": "GTNETx2",
    "revision": "x2 / 机箱另分版本",
    "family": "GTNET",
    "type": "网络接口卡",
    "summary": "两个处理模块分别具有仿真器侧 GT 与外部 LAN；机箱在 2024 年 11 月前后另有变化。",
    "evidence": [
      {
        "source_id": "NET2-KB",
        "locator": "Article"
      },
      {
        "source_id": "MANUAL",
        "locator": "Chapter 5B; PDF pages 249-275; printed chapter date 2025-03-18"
      }
    ],
    "confidence": {
      "count": "documented",
      "layout": "partial",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtnet-legacy",
    "name": "GTNET 旧版",
    "revision": "original / 对比资料",
    "family": "GTNET",
    "type": "网络接口卡",
    "summary": "对比资料记载一个处理模块；不能由 x2 隐藏端口推导完整旧版。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 5B; PDF pages 252; printed chapter date 2025-03-18"
      }
    ],
    "confidence": {
      "count": "partial",
      "layout": "unknown",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtfpi-v2",
    "name": "GTFPI V2",
    "revision": "V2 / PCB 2.01 / GT 光口带防尘盖",
    "family": "GTFPI",
    "type": "接口面板桥接卡",
    "summary": "连接一块 LV 数字 I/O 面板和一块 HV 输出面板的桥接卡，不是高压接点面板本体。当前展示 PCB 2.01、两只 GT 防尘盖及 94 个可见电气针脚；针脚数不等于信号通道数。",
    "scopeNote": "版本边界：HV / LV 排针分别为 50 / 34 针，24 V 供电共 8 针、HV 辅助 5 V 共 2 针。两只 GT 组件保留防尘盖；电源空间针序、辅助极性与盖下插接几何未确认。",
    "evidence": [
      {
        "source_id": "GTFPI-PHOTO",
        "locator": "PCB 2.01；两只 GT 防尘盖，HV / LV 排针与绿色开放式两针外观"
      },
      {
        "source_id": "GTFPI-KB",
        "locator": "GTFPI 桥接卡与独立 HV / LV 面板的功能区别"
      },
      {
        "source_id": "MANUAL",
        "locator": "10 GTFPI V2；修订 20240924；章节印刷页 1–6、20–22"
      }
    ],
    "confidence": {
      "count": "observed",
      "layout": "partial",
      "keying": "partial",
      "contacts": "partial",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  },
  {
    "id": "gtfpi-v1",
    "name": "GTFPI V1",
    "revision": "V1 / 历史身份待核实",
    "family": "GTFPI",
    "type": "接口面板桥接卡",
    "summary": "仅保留待核实条目；不能把 PCB 2.01 参考图直接标成 V1。",
    "evidence": [
      {
        "source_id": "MANUAL",
        "locator": "Chapter 10; PDF pages 448-469; printed chapter date 2024-09-24"
      }
    ],
    "confidence": {
      "count": "unknown",
      "layout": "unknown",
      "keying": "unknown",
      "contacts": "unknown",
      "physical_dimensions": "unknown",
      "electrical_compatibility": "unknown"
    }
  }
];
export const sources={
  "MANUAL": {
    "title": "RTDS Hardware Manual",
    "url": null,
    "access": "private_user_provided"
  },
  "NC2-2023": {
    "title": "NovaCor 2.0 brochure",
    "url": "https://knowledge.rtds.com/hc/en-us/article_attachments/16079537928727",
    "access": "public_reference_only"
  },
  "NC2-KB": {
    "title": "NovaCor 2.0 knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/16032930463511-NovaCor-2-0",
    "access": "public_reference_only"
  },
  "NC1-KB": {
    "title": "NovaCor knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/360034290474-NovaCor",
    "access": "public_reference_only"
  },
  "NCL-2024": {
    "title": "NovaCor Light brochure",
    "url": "https://knowledge.rtds.com/hc/en-us/article_attachments/22241174316311",
    "access": "public_reference_only"
  },
  "GTIO-2026": {
    "title": "GTIO Cards knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/360034281234-GTIO-Cards",
    "access": "public_reference_only"
  },
  "GTDI-PHOTO": {
    "title": "GTDI V2 official component-side image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/8497880556695",
    "access": "public_reference_only"
  },
  "GTDO-PHOTO": {
    "title": "GTDO V2 official component-side image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/4409613704343",
    "access": "public_reference_only"
  },
  "GTAI-PHOTO": {
    "title": "GTAI V2 official component-side image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/360065822373",
    "access": "public_reference_only"
  },
  "GTAO-PHOTO": {
    "title": "GTAO V2 official component-side image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/360100284733",
    "access": "public_reference_only"
  },
  "GTFPI-PHOTO": {
    "title": "GTFPI official component-side image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/360100284873",
    "access": "public_reference_only"
  },
  "GTFPI-KB": {
    "title": "GTFPI Card knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/360034817173-GTFPI-Card",
    "access": "public_reference_only"
  },
  "SOC2-2026": {
    "title": "GTSOC V2 brochure",
    "url": "https://knowledge.rtds.com/hc/en-us/article_attachments/30065880593303",
    "access": "public_reference_only"
  },
  "SOC2-PHOTO": {
    "title": "GTSOC V2 official front image",
    "url": "https://knowledge.rtds.com/hc/article_attachments/19752419176215",
    "access": "public_reference_only"
  },
  "SOC1-BROCHURE": {
    "title": "GTSOC V1 brochure",
    "url": "https://www.rtds.com/-/media/project/oneweb/oneweb/ametekrtds/documents/rtds-website-linked-pdfs/gtsoc_v1.pdf?revision=b5c4ffd9-5464-40ea-bbc4-ac8016e9e490",
    "access": "public_reference_only"
  },
  "NET2-KB": {
    "title": "GTNETx2 knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/360034788593-GTNETx2-The-RTDS-Simulator-s-Network-Interface-Card",
    "access": "public_reference_only"
  },
  "NET3-KB": {
    "title": "GTNETv3 knowledge-base article",
    "url": "https://knowledge.rtds.com/hc/en-us/articles/42206688511639-GTNETv3-THE-RTDS-SIMULATOR-S-NETWORK-INTERFACE-CARD",
    "access": "public_reference_only"
  }
};
