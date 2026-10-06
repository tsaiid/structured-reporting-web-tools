/**
 * 骨肉瘤：四肢、軀幹、顱顏骨 (OGS for Appendicular Skeleton, Trunk, Skull and Facial Bones)
 * AJCC 第 8 版分期邏輯計算模組
 */

export const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor ≤8 cm in greatest dimension'],
    ['2', 'Tumor >8 cm in greatest dimension'],
    ['3', 'Discontinuous tumors in the primary bone site'],
]);

export const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed. Because of the rarity of lymph node involvement in bone sarcomas, the designation NX may not be appropriate, and cases should be considered N0 unless clinical node involvement clearly is evident.'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Regional lymph node metastasis'],
]);

export const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
    ['1a', 'Lung'],
    ['1b', 'Bone or other distant sites'],
]);

/**
 * 計算四肢、軀幹、顱顏骨骨肉瘤 AJCC 8th TNM 期別
 *
 * @param {Object} data - 臨床與影像特徵資料
 * @param {boolean} [data.isNotAssessable] - 原發腫瘤無法評估 (Tx)
 * @param {boolean} [data.isNonMeasurable] - 腫瘤無法量測 (Tx)
 * @param {boolean} [data.isNoEvidence] - 無原發腫瘤證據 (T0)
 * @param {number} [data.tumorSize] - 腫瘤最大長徑 (cm)
 * @param {boolean} [data.hasDiscontinuousTumor] - 同一骨骼內跳躍/不連續腫瘤 (T3)
 * @param {Object} [data.nodes] - 淋巴結轉移特徵
 * @param {boolean} [data.nodes.hasNodes] - 是否有區域淋巴結轉移 (N1)
 * @param {Object} [data.metastasis] - 遠端轉移特徵
 * @param {boolean} [data.metastasis.hasMetastasis] - 是否有遠端轉移
 * @param {boolean} [data.metastasis.isM1b] - 是否轉移至骨骼或其他遠端部位 (M1b)
 * @param {boolean} [data.metastasis.hasLungMetastasis] - 是否有肺部轉移
 * @param {boolean} [data.metastasis.hasBoneMetastasis] - 是否有骨骼轉移
 * @param {boolean} [data.metastasis.hasOtherMetastasis] - 是否有其他器官轉移
 * @returns {{ t: string[], n: string[], m: string[] }}
 */
export function calculateOgsTrunkStage(data = {}) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // 1. T 分期 (Primary Tumor)
    if (data.isNotAssessable || data.isNonMeasurable) {
        t_stage.push('x');
    }

    if (data.isNoEvidence) {
        t_stage.push('0');
    }

    if (data.hasDiscontinuousTumor) {
        t_stage.push('3');
    }

    if (typeof data.tumorSize === 'number' && !isNaN(data.tumorSize) && !data.isNonMeasurable) {
        if (data.tumorSize > 8) {
            t_stage.push('2');
        } else if (data.tumorSize > 0) {
            t_stage.push('1');
        }
    }

    // 若未填寫且未符合任何特定 T 條件，預設為 T0
    if (t_stage.length === 0) {
        t_stage.push('0');
    }

    // 2. N 分期 (Regional Lymph Nodes)
    const nodes = data.nodes || {};
    if (nodes.hasNodes) {
        n_stage.push('1');
    }

    // 3. M 分期 (Distant Metastasis)
    const metastasis = data.metastasis || {};
    const hasM1b = Boolean(
        metastasis.isM1b ||
        metastasis.hasBoneMetastasis ||
        metastasis.hasOtherMetastasis
    );
    const hasM1a = Boolean(
        metastasis.hasLungMetastasis
    );

    if (metastasis.hasMetastasis || hasM1a || hasM1b) {
        if (hasM1b) {
            m_stage.push('1b');
        } else {
            m_stage.push('1a');
        }
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}

export const calculate_staging = calculateOgsTrunkStage;
