/**
 * 骨盆骨肉瘤 (OGS of Pelvis) AJCC 第 8 版分期邏輯計算模組
 */

export const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor confined to one pelvic segment with no extraosseous extension'],
    ['1a', 'Tumor ≤8 cm in greatest dimension'],
    ['1b', 'Tumor >8 cm in greatest dimension'],
    ['2', 'Tumor confined to one pelvic segment with extraosseous extension or two segments without extraosseous extension'],
    ['2a', 'Tumor ≤8 cm in greatest dimension'],
    ['2b', 'Tumor >8 cm in greatest dimension'],
    ['3', 'Tumor spanning two pelvic segments with extraosseous extension'],
    ['3a', 'Tumor ≤8 cm in greatest dimension'],
    ['3b', 'Tumor >8 cm in greatest dimension'],
    ['4', 'Tumor spanning three pelvic segments or crossing the sacroiliac joint'],
    ['4a', 'Tumor involves sacroiliac joint and extends medial to the sacral neuroforamen'],
    ['4b', 'Tumor encasement of external iliac vessels or presence of gross tumor thrombus in major pelvic vessels'],
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
 * 計算骨盆骨肉瘤 AJCC 8th TNM 期別
 *
 * @param {Object} data - 臨床與影像特徵資料
 * @param {boolean} [data.isNotAssessable] - 原發腫瘤無法評估 (Tx)
 * @param {boolean} [data.isNonMeasurable] - 腫瘤無法量測 (Tx)
 * @param {boolean} [data.isNoEvidence] - 無原發腫瘤證據 (T0)
 * @param {number} [data.tumorSize] - 腫瘤最大長徑 (cm)
 * @param {string[]} [data.segments] - 受侵犯的骨盆節段清單 (Sacrum, Iliac wing, Pubic rami..., Acetabulum...)
 * @param {boolean} [data.hasExtraosseousExtension] - 是否有骨外延伸 (Extraosseous extension)
 * @param {Object} [data.invasion] - 局部侵犯特徵
 * @param {boolean} [data.invasion.hasExtraosseousExtension] - 別名：骨外延伸
 * @param {boolean} [data.invasion.t4a] - 侵犯薦髂關節並延伸至薦神經孔內側 (T4a)
 * @param {boolean} [data.invasion.crossSiJointAndSacralForamen] - 別名：T4a
 * @param {boolean} [data.invasion.t4b] - 包埋髂外血管或骨盆大血管腫瘤血栓 (T4b)
 * @param {boolean} [data.invasion.vesselsEncasementOrThrombus] - 別名：T4b
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
export function calculateOgsPelvisStage(data = {}) {
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

    const invasion = data.invasion || {};
    const segments = Array.isArray(data.segments) ? data.segments : [];
    const segCount = segments.length;
    const hasEE = Boolean(
        data.hasExtraosseousExtension ||
        invasion.hasExtraosseousExtension ||
        invasion.ee
    );

    // T4b: 髂外血管包埋或骨盆大血管腫瘤栓塞
    if (invasion.t4b || invasion.vesselsEncasementOrThrombus) {
        t_stage.push('4b');
    }

    // T4a: 薦髂關節侵犯且延伸至薦骨神經孔內側
    if (invasion.t4a || invasion.crossSiJointAndSacralForamen) {
        t_stage.push('4a');
    }

    // T4: 侵犯 3 個以上節段，或同時侵犯 Sacrum 與 Iliac wing（跨越薦髂關節）
    const hasSacrum = segments.some(s => s.toLowerCase().includes('sacrum'));
    const hasIliacWing = segments.some(s => s.toLowerCase().includes('iliac'));
    const crossesSiJoint = hasSacrum && hasIliacWing;

    const size = typeof data.tumorSize === 'number' && !isNaN(data.tumorSize) && !data.isNonMeasurable
        ? data.tumorSize
        : 0;

    if (segCount >= 3 || crossesSiJoint) {
        t_stage.push('4');
    } else if (segCount === 2 && hasEE) {
        // T3: 2 segments with extraosseous extension
        t_stage.push('3');
        if (size > 8) {
            t_stage.push('3b');
        } else if (size > 0) {
            t_stage.push('3a');
        }
    } else if ((segCount === 1 && hasEE) || (segCount === 2 && !hasEE)) {
        // T2: 1 segment with EE, OR 2 segments without EE
        t_stage.push('2');
        if (size > 8) {
            t_stage.push('2b');
        } else if (size > 0) {
            t_stage.push('2a');
        }
    } else if (segCount === 1 && !hasEE) {
        // T1: 1 segment without EE
        t_stage.push('1');
        if (size > 8) {
            t_stage.push('1b');
        } else if (size > 0) {
            t_stage.push('1a');
        }
    }

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

export const calculate_staging = calculateOgsPelvisStage;
