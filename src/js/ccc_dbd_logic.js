export function calculate_staging(data) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // calculate T stage: T4 侵犯與侵犯深度 (DOI) 判定，腫瘤長徑非 T 期必要條件
    const hasInvasion = data.hasInvasion !== false;
    if (data.isT4) {
        t_stage.push('4');
    } else if (hasInvasion && data.invasionDepth > 12) {
        t_stage.push('3');
    } else if (hasInvasion && data.invasionDepth >= 5) {
        t_stage.push('2');
    } else if (hasInvasion && data.invasionDepth > 0) {
        t_stage.push('1');
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
