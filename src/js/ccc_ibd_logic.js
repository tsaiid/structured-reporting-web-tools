export function calculate_staging(data) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // calculate T stage: 侵犯與多發腫瘤 (T4, T3, T2) 優先於 size 判定
    if (data.isT4) {
        t_stage.push('4');
    } else if (data.isT3) {
        t_stage.push('3');
    } else if (data.isT2 || data.isMultiple) {
        t_stage.push('2');
    } else if (data.isT0) {
        t_stage.push('0');
    } else if (data.isNonMeasurable || !data.tumorSize) {
        t_stage.push('x');
    } else {
        t_stage.push('1');
        if (data.tumorSize > 5.0) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
    }

    // Regional nodal metastasis
    if (data.hasRegionalNodes) {
        n_stage.push('1');
    }

    // Distant metastasis
    if (data.hasMetastasis) {
        m_stage.push("1");
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
