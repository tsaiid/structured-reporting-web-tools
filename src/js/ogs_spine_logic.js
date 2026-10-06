/**
 * 脊椎骨肉瘤 (OGS for Spine) AJCC 第 8 版分期邏輯計算模組
 */

export const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor confined to one vertebral segment or two adjacent vertebral segments'],
    ['2', 'Tumor confined to three adjacent vertebral segments'],
    ['3', 'Tumor confined to four or more adjacent vertebral segments, or any nonadjacent vertebral segments'],
    ['4', 'Extension into the spinal canal or great vessels'],
    ['4a', 'Extension into the spinal canal'],
    ['4b', 'Evidence of gross vascular invasion or tumor thrombus in the great vessels'],
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
 * 判定選取的脊椎節段是否包含不相鄰的節段 (Nonadjacent vertebral segments)
 *
 * 脊椎節段於軸狀面上依環形排列：
 * Body R <-> Body L <-> Pedicle L <-> Posterior element <-> Pedicle R <-> (接回 Body R)
 *
 * @param {string[]} [segments=[]] - 已選取的脊椎節段陣列
 * @returns {boolean} 是否包含不相鄰節段
 */
export function isNonAdjacentVertebralSegments(segments = []) {
    if (!Array.isArray(segments) || segments.length <= 1 || segments.length >= 4) {
        return false;
    }
    const ORDER = ['Body R', 'Body L', 'Pedicle L', 'Posterior element', 'Pedicle R'];
    const selected = new Set(segments);
    const bools = ORDER.map(name => selected.has(name));
    const n = bools.length;

    let transitions = 0;
    for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        if (!bools[i] && bools[next]) {
            transitions++;
        }
    }
    return transitions > 1;
}

/**
 * 計算脊椎骨肉瘤 AJCC 8th TNM 期別
 *
 * @param {Object} data - 臨床與影像特徵資料
 * @param {boolean} [data.isNotAssessable] - 原發腫瘤無法評估 (Tx)
 * @param {boolean} [data.isNonMeasurable] - 腫瘤無法量測 (Tx)
 * @param {boolean} [data.isNoEvidence] - 無原發腫瘤證據 (T0)
 * @param {string[]} [data.segments] - 受侵犯的脊椎節段清單
 * @param {boolean} [data.hasNonAdjacentSegments] - 是否有不相鄰節段（若未指定則自動根據 segments 計算）
 * @param {Object} [data.invasion] - 局部侵犯特徵
 * @param {boolean} [data.invasion.t4a] - 侵犯椎管 (Extension into spinal canal)
 * @param {boolean} [data.invasion.hasSpinalCanalExtension] - 別名：侵犯椎管
 * @param {boolean} [data.invasion.t4b] - 侵犯大血管 (Gross vascular invasion or thrombus)
 * @param {boolean} [data.invasion.hasGreatVesselsInvasion] - 別名：侵犯大血管
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
export function calculateOgsSpineStage(data = {}) {
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

    if (invasion.t4b || invasion.hasGreatVesselsInvasion) {
        t_stage.push('4b');
    }
    if (invasion.t4a || invasion.hasSpinalCanalExtension) {
        t_stage.push('4a');
    }

    const segments = Array.isArray(data.segments) ? data.segments : [];
    const segCount = segments.length;
    const hasNonAdjacent = data.hasNonAdjacentSegments !== undefined
        ? Boolean(data.hasNonAdjacentSegments)
        : isNonAdjacentVertebralSegments(segments);

    if (segCount >= 4 || hasNonAdjacent) {
        t_stage.push('3');
    } else if (segCount === 3) {
        t_stage.push('2');
    } else if (segCount >= 1) {
        t_stage.push('1');
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

export const calculate_staging = calculateOgsSpineStage;
