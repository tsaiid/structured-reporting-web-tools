export function calculateColonStage(data) {
    // data structure expected:
    // {
    //   isNotVisualized: boolean (Tx),
    //   isNonMeasurable: boolean,
    //   tumorSize: number,
    //   invasion: { t4b: boolean, t4a: boolean, t3: boolean, t2: boolean },
    //   nodesCount: number,
    //   metastasis: { m1c: boolean, m1abCount: number }
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // Calculate T staging
    if (data.isNotVisualized) {
        t_stage.push("x");
    } else {
        if (data.isNonMeasurable || !data.tumorSize) {
            t_stage.push("0");
        } else {
            t_stage.push("1");
        }

        if (data.invasion.t4b) {
            t_stage.push("4b");
        } else if (data.invasion.t4a) {
            t_stage.push("4a");
        } else if (data.invasion.t3) {
            t_stage.push("3");
        } else if (data.invasion.t2) {
            t_stage.push("2");
        }
    }

    // calculate N stage
    if (data.nodesCount > 0) {
        if (data.nodesCount >= 7) {
            n_stage.push("2b");
        } else if (data.nodesCount >= 4) {
            n_stage.push("2a");
        } else if (data.nodesCount >= 2) {
            n_stage.push("1b");
        } else if (data.nodesCount >= 1) {
            n_stage.push("1a");
        }
    }

    // Distant metastasis
    const hasMetastasis = data.metastasis.m1c || data.metastasis.m1abCount > 0;
    if (hasMetastasis) {
        if (data.metastasis.m1c) {
            m_stage.push("1c");
        } else {
            if (data.metastasis.m1abCount === 1) {
                m_stage.push("1a");
            } else {
                m_stage.push("1b");
            }
        }
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
