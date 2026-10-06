export function calculate_staging(data) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // calculate T stage: 侵犯深度 (T4, T3, T2b, T2a, T1) 優先於 T0 / Tx 判定，腫瘤大小非必要條件
    if (data.isT4) {
        t_stage.push('4');
    } else if (data.isT3) {
        t_stage.push('3');
    } else if (data.isT2b) {
        t_stage.push('2b');
    } else if (data.isT2a) {
        t_stage.push('2a');
    } else if (data.isT1) {
        t_stage.push('1');
    } else if (data.isT0) {
        t_stage.push('0');
    } else {
        t_stage.push('x');
    }

    // Regional nodal metastasis
    if (data.nodesCount > 0) {
        if (data.nodesCount >= 4) {
            n_stage.push("2");
        } else {
            n_stage.push("1");
        }
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
