export function calculate_staging(data) {
    const t_stage = ["0"];
    const n_stage = ["0"];
    const m_stage = ["0"];

    // T Stage
    if (data.hasTumor) {
        t_stage.push("1");
        if (data.lateralityCount > 1) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    }

    if (data.isNonMeasurable) {
        t_stage.push('x');
    }

    if (data.invasion.t2) t_stage.push("2");
    if (data.invasion.t3) t_stage.push("3");
    if (data.invasion.t4a) t_stage.push("4a");
    if (data.invasion.t4b) t_stage.push("4b");

    // N Stage
    if (data.nodes.hasNodes) {
        if (data.nodes.isEne) {
            n_stage.push("3b");
        } else if (data.nodes.size > 6.0) {
            n_stage.push("3a");
        } else if (
            (data.nodes.hasRightNodes && data.nodes.hasLeftNodes) ||
            (data.tumorSide.isRight && data.nodes.hasLeftNodes) ||
            (data.tumorSide.isLeft && data.nodes.hasRightNodes)
        ) {
            n_stage.push("2c");
        } else if (!data.nodes.isSingle) {
            n_stage.push("2b");
        } else if (data.nodes.size > 3.0) {
            n_stage.push("2a");
        } else {
            n_stage.push("1");
        }
    }

    // M Stage
    if (data.hasMetastasis) {
        m_stage.push("1");
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
