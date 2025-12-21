export function calculate_staging(data) {
    const t_stage = [];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // calculate T stage
    if (data.isT0) {
        t_stage.push('0');
    } else if (data.isNonMeasurable || !data.tumorSize) {
        t_stage.push('x');
    } else if (data.isT4) {
        t_stage.push('4');
    } else if (data.isT3) {
        t_stage.push('3');
    } else if (data.isT2b) {
        t_stage.push('2b');
    } else if (data.isT2a) {
        t_stage.push('2a');
    } else if (data.isT1) {
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
