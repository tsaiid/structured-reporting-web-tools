export function calculateRCCStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNotAssessable: boolean,
    //   invasion: {
    //     t3a: boolean,
    //     t3bc: boolean,
    //     t3c: boolean,
    //     t4: boolean,
    //     ivcLevel: string // '3b' or '3c' or ''
    //   },
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    const t_dia = data.tumorSize;
    const hasValidSize = typeof t_dia === 'number' && !isNaN(t_dia) && t_dia > 0;
    const invasion = data.invasion || {};

    // 1. 侵犯深度判定 (Invasion based: T3 / T4 優先於腫瘤大小)
    if (invasion.t4) {
        t_stage.push("4");
    }
    if (invasion.t3bc) {
        t_stage.push("3b"); // Default base for this group check
        if (invasion.ivcLevel) {
            t_stage.push(invasion.ivcLevel);
        }
        if (invasion.t3c) {
            t_stage.push("3c");
        }
    }
    if (invasion.t3a) {
        t_stage.push("3a");
    }

    // 2. 大小判定 (Size based: 局限於腎臟之腫瘤)
    if (hasValidSize) {
        if (t_dia > 10) {
            t_stage.push('2b');
        } else if (t_dia > 7) {
            t_stage.push('2a');
        } else if (t_dia > 4) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
    }

    // 3. 處理未填寫、非可測量或無腫瘤之邊界情況
    if (t_stage.length === 0) {
        if (data.isT0 || t_dia === 0) {
            // T0: 無原發腫瘤
            t_stage.push("0");
        } else {
            // Tx: 非可測量或未填寫大小
            t_stage.push("x");
        }
    } else if (data.isNotAssessable && !invasion.t4 && !invasion.t3bc && !invasion.t3a) {
        // 若標註為不可評估且無明確侵犯，確保為 Tx
        t_stage = ["x"];
    }

    // calculate N stage
    if (data.hasNodes) {
        n_stage.push("1");
    }

    // calculate M stage
    if (data.hasMetastasis) {
        m_stage.push("1");
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
