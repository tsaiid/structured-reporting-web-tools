/**
 * 下咽癌 (Hypopharyngeal Cancer) AJCC 第 8 版分期邏輯計算模組
 *
 * @param {Object} data - 分期計算所需的臨床與影像特徵資料
 * @param {boolean} [data.isNotAssessable] - Tx: 原發腫瘤無法評估
 * @param {boolean} [data.isNoEvidence] - T0: 無原發腫瘤證據
 * @param {boolean} [data.hasTumorLocation] - 是否有選取腫瘤部位
 * @param {number} [data.subsiteCount] - 侵犯的次部位 (subsites) 數量
 * @param {number} [data.tumorSize] - 腫瘤最大長徑 (cm)
 * @param {Object} [data.invasion] - 侵犯範圍
 * @param {boolean} [data.invasion.t3] - T3 侵犯 (fixation of hemilarynx 或 extension to esophageal mucosa)
 * @param {boolean} [data.invasion.t4a] - T4a 侵犯 (甲狀軟骨/環狀軟骨、舌骨、甲狀腺或中央頸部軟組織)
 * @param {boolean} [data.invasion.t4b] - T4b 侵犯 (椎前筋膜、頸動脈包埋或縱膈腔構造)
 * @param {Object} [data.nodes] - 區域淋巴結轉移特徵
 * @param {boolean} [data.nodes.hasNodes] - 是否有區域淋巴結轉移
 * @param {number} [data.nodes.size] - 最大陽性淋巴結長徑 (cm)
 * @param {number} [data.nodes.nodeSize] - 別名：最大陽性淋巴結長徑 (cm)
 * @param {boolean} [data.nodes.isEne] - 淋巴結被膜外侵犯 (ENE)
 * @param {boolean} [data.nodes.hasENE] - 別名：ENE
 * @param {boolean} [data.nodes.isSingle] - 單一淋巴結轉移
 * @param {boolean} [data.nodes.isSingleNode] - 別名：單一淋巴結轉移
 * @param {boolean} [data.nodes.hasRightNodes] - 是否有右側淋巴結轉移
 * @param {boolean} [data.nodes.hasLeftNodes] - 是否有左側淋巴結轉移
 * @param {Object} [data.tumorSide] - 原發腫瘤側性
 * @param {boolean} [data.tumorSide.isRight] - 原發腫瘤位於右側
 * @param {boolean} [data.tumorSide.isLeft] - 原發腫瘤位於左側
 * @param {boolean} [data.hasMetastasis] - 是否有遠端轉移 (M1)
 * @returns {{ t: string[], n: string[], m: string[] }}
 */
export function calculateHypopharynxStage(data = {}) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // 1. T 分期 (Primary Tumor)
    if (data.isNotAssessable) {
        t_stage.push('x');
    } else if (data.isNoEvidence) {
        t_stage.push('0');
    } else {
        const invasion = data.invasion || {};

        // 局部侵犯判斷 (Invasion)
        if (invasion.t4b) {
            t_stage.push("4b");
        }
        if (invasion.t4a) {
            t_stage.push("4a");
        }
        if (invasion.t3) {
            t_stage.push("3");
        }

        // 大小與次部位判斷 (Size & Subsites)
        if (data.hasTumorLocation) {
            const t_length = typeof data.tumorSize === 'number' ? data.tumorSize : 0;
            if (t_length > 4) {
                t_stage.push("3");
            } else if (t_length > 2) {
                t_stage.push("2");
            } else {
                t_stage.push("1");
            }

            // 侵犯超過一個次部位即達 T2
            if (data.subsiteCount > 1) {
                t_stage.push('2');
            }
        }

        // 若無侵犯且無次部位選取，預設為 T0
        if (t_stage.length === 0) {
            t_stage.push('0');
        }
    }

    // 2. N 分期 (Regional Lymph Nodes - AJCC 8th clinical N)
    const nodes = data.nodes || {};
    if (nodes.hasNodes) {
        const isEne = Boolean(nodes.isEne || nodes.hasENE);
        const nodeSize = typeof nodes.size === 'number'
            ? nodes.size
            : (typeof nodes.nodeSize === 'number' ? nodes.nodeSize : 0);
        const isSingle = nodes.isSingle !== undefined
            ? Boolean(nodes.isSingle)
            : (nodes.isSingleNode !== undefined ? Boolean(nodes.isSingleNode) : false);
        const tumorSide = data.tumorSide || {};

        if (isEne) {
            n_stage.push("3b");
        } else if (nodeSize > 6.0) {
            n_stage.push("3a");
        } else if (
            (nodes.hasRightNodes && nodes.hasLeftNodes) ||
            (tumorSide.isRight && nodes.hasLeftNodes) ||
            (tumorSide.isLeft && nodes.hasRightNodes)
        ) {
            n_stage.push("2c");
        } else if (!isSingle) {
            n_stage.push("2b");
        } else if (nodeSize > 3.0) {
            n_stage.push("2a");
        } else {
            n_stage.push("1");
        }
    }

    // 3. M 分期 (Distant Metastasis)
    if (data.hasMetastasis) {
        m_stage.push("1");
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}

// 別名匯出，相容不同命名習慣
export const calculate_staging = calculateHypopharynxStage;
