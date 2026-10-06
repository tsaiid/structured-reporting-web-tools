/**
 * 口咽癌 (Oropharyngeal Carcinoma) AJCC 第 8 版分期邏輯計算模組
 * 涵蓋 HPV-Mediated (p16+) 與 Non-HPV (p16-) 雙分期系統
 *
 * @param {Object} data - 分期計算所需的臨床與影像特徵資料
 * @param {boolean} [data.isHpv] - 是否為 HPV-mediated (p16+) 口咽癌
 * @param {boolean} [data.is_hpv] - 別名：HPV-mediated (p16+)
 * @param {boolean} [data.isHPV] - 別名：HPV-mediated (p16+)
 * @param {boolean} [data.isNotAssessable] - Tx: 原發腫瘤無法評估
 * @param {boolean} [data.isNoEvidence] - T0: 無原發腫瘤證據
 * @param {boolean} [data.hasTumorLocation] - 是否有選取腫瘤部位
 * @param {number} [data.tumorSize] - 腫瘤最大長徑 (cm)
 * @param {Object} [data.invasion] - 侵犯範圍
 * @param {boolean} [data.invasion.t3] - T3: 侵犯會厭舌側面 (extension to lingual surface of epiglottis)
 * @param {boolean} [data.invasion.t4] - T4: 侵犯喉部、舌外在肌、內翼肌、硬顎、下顎骨等 (HPV(+) 統一為 T4)
 * @param {boolean} [data.invasion.t4a] - T4a: 喉部、舌外在肌、內翼肌、硬顎、下顎骨 (Non-HPV)
 * @param {boolean} [data.invasion.t4b] - T4b: 外翼肌、翼板、鼻咽外側、顱底或包埋頸動脈 (Non-HPV)
 * @param {Object} [data.nodes] - 區域淋巴結轉移特徵
 * @param {boolean} [data.nodes.hasNodes] - 是否有區域淋巴結轉移
 * @param {number} [data.nodes.size] - 最大陽性淋巴結長徑 (cm)
 * @param {number} [data.nodes.nodeSize] - 別名：最大陽性淋巴結長徑 (cm)
 * @param {boolean} [data.nodes.isEne] - 淋巴結被膜外侵犯 (ENE) (僅 Non-HPV 影響臨床分期)
 * @param {boolean} [data.nodes.hasENE] - 別名：ENE
 * @param {boolean} [data.nodes.isSingle] - 單一淋巴結轉移
 * @param {boolean} [data.nodes.isSingleNode] - 別名：單一淋巴結轉移
 * @param {boolean} [data.nodes.isMultiple] - 多發淋巴結轉移
 * @param {boolean} [data.nodes.hasRightNodes] - 是否有右側淋巴結轉移
 * @param {boolean} [data.nodes.hasLeftNodes] - 是否有左側淋巴結轉移
 * @param {boolean} [data.nodes.isBilateralOrContralateral] - 是否為雙側或對側轉移
 * @param {boolean} [data.nodes.isBilateral] - 是否為雙側轉移
 * @param {boolean} [data.nodes.isContralateral] - 是否為對側轉移
 * @param {Object} [data.tumorSide] - 原發腫瘤側性
 * @param {boolean} [data.tumorSide.isRight] - 原發腫瘤位於右側
 * @param {boolean} [data.tumorSide.isLeft] - 原發腫瘤位於左側
 * @param {boolean} [data.hasMetastasis] - 是否有遠端轉移 (M1)
 * @returns {{ t: string[], n: string[], m: string[] }}
 */
export function calculateOropharynxStage(data = {}) {
    const isHpv = Boolean(data.isHpv || data.is_hpv || data.isHPV);
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
        if (isHpv) {
            // HPV(+) 口咽癌臨床 T4 不細分 4a/4b
            if (invasion.t4 || invasion.t4a || invasion.t4b) {
                t_stage.push('4');
            }
        } else {
            // Non-HPV (p16-) 區分 T4a 與 T4b
            if (invasion.t4b) {
                t_stage.push('4b');
            }
            if (invasion.t4a) {
                t_stage.push('4a');
            }
            if (invasion.t4 && !invasion.t4a && !invasion.t4b) {
                t_stage.push('4a');
            }
        }

        if (invasion.t3) {
            t_stage.push('3');
        }

        // 大小判斷 (Size)
        const hasLocation = Boolean(data.hasTumorLocation);
        const tumorSize = typeof data.tumorSize === 'number' ? data.tumorSize : 0;
        if (hasLocation || tumorSize > 0) {
            if (tumorSize > 4) {
                t_stage.push('3');
            } else if (tumorSize > 2) {
                t_stage.push('2');
            } else {
                t_stage.push('1');
            }
        }

        // 若無侵犯且無大小/位置選取，預設為 T0
        if (t_stage.length === 0) {
            t_stage.push('0');
        }
    }

    // 2. N 分期 (Regional Lymph Nodes)
    const nodes = data.nodes || {};
    const hasNodes = Boolean(
        nodes.hasNodes ||
        nodes.hasRightNodes ||
        nodes.hasLeftNodes ||
        (typeof nodes.size === 'number' && nodes.size > 0) ||
        (typeof nodes.nodeSize === 'number' && nodes.nodeSize > 0)
    );

    if (hasNodes) {
        const isEne = Boolean(nodes.isEne || nodes.hasENE);
        const nodeSize = typeof nodes.size === 'number'
            ? nodes.size
            : (typeof nodes.nodeSize === 'number' ? nodes.nodeSize : 0);
        const tumorSide = data.tumorSide || {};

        const isBilateralOrContralateral = Boolean(
            nodes.isBilateralOrContralateral ||
            nodes.isBilateral ||
            nodes.isContralateral ||
            (nodes.hasRightNodes && nodes.hasLeftNodes) ||
            (tumorSide.isRight && nodes.hasLeftNodes) ||
            (tumorSide.isLeft && nodes.hasRightNodes)
        );

        if (isHpv) {
            // HPV-mediated (p16+) 臨床 N 分期：
            // N1: 同側單或多顆淋巴結，最大徑 <= 6 cm
            // N2: 對側或雙側淋巴結，最大徑 <= 6 cm
            // N3: 淋巴結最大徑 > 6 cm
            // （臨床分期不計 ENE）
            if (nodeSize > 6.0) {
                n_stage.push('3');
            } else if (isBilateralOrContralateral) {
                n_stage.push('2');
            } else {
                n_stage.push('1');
            }
        } else {
            // Non-HPV (p16-) 臨床 N 分期：
            // N1: 單一同側 <= 3 cm 且 ENE(-)
            // N2a: 單一同側 > 3 cm 但 <= 6 cm 且 ENE(-)
            // N2b: 多發同側 <= 6 cm 且 ENE(-)
            // N2c: 雙側或對側 <= 6 cm 且 ENE(-)
            // N3a: 淋巴結 > 6 cm 且 ENE(-)
            // N3b: 具被膜外侵犯 ENE(+)
            let isSingle = false;
            if (nodes.isMultiple !== undefined) {
                isSingle = !nodes.isMultiple;
            } else if (nodes.isSingle !== undefined) {
                isSingle = Boolean(nodes.isSingle);
            } else if (nodes.isSingleNode !== undefined) {
                isSingle = Boolean(nodes.isSingleNode);
            }

            if (isEne) {
                n_stage.push('3b');
            } else if (nodeSize > 6.0) {
                n_stage.push('3a');
            } else if (isBilateralOrContralateral) {
                n_stage.push('2c');
            } else if (!isSingle) {
                n_stage.push('2b');
            } else if (nodeSize > 3.0) {
                n_stage.push('2a');
            } else {
                n_stage.push('1');
            }
        }
    }

    // 3. M 分期 (Distant Metastasis)
    if (data.hasMetastasis) {
        m_stage.push('1');
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}

// 別名匯出
export const calculate_staging = calculateOropharynxStage;

// AJCC 第 8 版口咽癌定義對照表
export const AJCC_T_HPV = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No primary identified'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor 2 cm or smaller in greatest dimension'],
    ['2', 'Tumor larger than 2 cm but not larger than 4 cm in greatest dimension'],
    ['3', 'Tumor larger than 4 cm in greatest dimension or extension to lingual surface of epiglottis'],
    ['4', 'Moderately advanced or very advanced local disease; Tumor invades the larynx, extrinsic muscle of tongue, medial pterygoid, hard palate, or mandible or beyond (* Mucosal extension to lingual surface of epiglottis from primary tumors of the base of the tongue and vallecula does not constitute invasion of the larynx.)'],
]);

export const AJCC_T_NONHPV = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No primary identified'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor 2 cm or smaller in greatest dimension'],
    ['2', 'Tumor larger than 2 cm but not larger than 4 cm in greatest dimension'],
    ['3', 'Tumor larger than 4 cm in greatest dimension or extension to lingual surface of epiglottis'],
    ['4', 'Moderately advanced or very advanced local disease'],
    ['4a', 'Moderately advanced local disease: Tumor invades the larynx, extrinsic muscle of tongue, medial pterygoid, hard palate, or mandible'],
    ['4b', 'Very advanced local disease: Tumor invades lateral pterygoid muscle, pterygoid plates, lateral nasopharynx, or skull base or encases carotid artery'],
]);

export const AJCC_N_HPV = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'One or more ipsilateral lymph nodes, none larger than 6 cm'],
    ['2', 'Contralateral or bilateral lymph nodes, none larger than 6 cm'],
    ['3', 'Lymph node(s) larger than 6 cm'],
]);

export const AJCC_N_NONHPV = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in a single ipsilateral lymph node, 3 cm or smaller in greatest dimension and ENE(−)'],
    ['2', 'Metastasis in a single ipsilateral node larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(−); or metastases in multiple ipsilateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−); or in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['2a', 'Metastasis in a single ipsilateral node larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(−)'],
    ['2b', 'Metastases in multiple ipsilateral nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['2c', 'Metastases in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['3', 'Metastasis in a lymph node larger than 6 cm in greatest dimension and ENE(−); or metastasis in any node(s) and clinically overt ENE(+)'],
    ['3a', 'Metastasis in a lymph node larger than 6 cm in greatest dimension and ENE(−)'],
    ['3b', 'Metastasis in any node(s) and clinically overt ENE(+)'],
]);

export const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);
