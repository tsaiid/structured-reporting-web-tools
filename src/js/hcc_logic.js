export function calculateHCCStage(data) {
    // data structure expected:
    // {
    //   tumorCount: number (or NaN if multiple/unspecified),
    //   largestTumorSize: number (cm),
    //   vascularInvasion: boolean (T2 criteria for solitary tumor > 2 cm),
    //   hasT4Features: boolean,
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    const hasValidSize = typeof data.largestTumorSize === 'number' && !isNaN(data.largestTumorSize) && data.largestTumorSize > 0;

    // calculate T stage
    if (data.hasT4Features || data.majorVascularInvasion) {
        // T4: 侵犯主要門靜脈/肝靜脈分支，或侵犯鄰近器官/穿破臟層腹膜（不論大小或顆數）
        t_stage.push('4');
    } else if (data.isT0 || data.tumorCount === 0) {
        // T0: 無原發腫瘤
        t_stage.push('0');
    } else if (data.isNonMeasurable || !hasValidSize) {
        // Tx: 未填寫腫瘤大小或標記為無法測量
        t_stage.push('x');
    } else if (data.tumorCount === 1) {
        // 單發腫瘤
        if (data.largestTumorSize > 2 && data.vascularInvasion) {
            t_stage.push('2');
        } else if (data.largestTumorSize > 2) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
    } else {
        // 多發腫瘤 (count > 1 或 NaN/multiple)
        if (data.largestTumorSize > 5) {
            t_stage.push('3');
        } else {
            t_stage.push('2');
        }
    }

    // calculate N stage
    if (data.hasNodes) {
        n_stage.push('1');
    }

    // calculate M stage
    if (data.hasMetastasis) {
        m_stage.push('1');
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
