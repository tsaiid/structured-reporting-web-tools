export function calculateCervixStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNonMeasurable: boolean,
    //   invasion: { t4: boolean, t3b: boolean, t3a: boolean, t2b: boolean, t2a: boolean, t1: boolean },
    //   nodes: { hasRegional: boolean, hasParaaortic: boolean },
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    const hasValidSize = typeof data.tumorSize === 'number' && !isNaN(data.tumorSize) && data.tumorSize > 0;

    // calculate T stage
    if (data.invasion.t4) {
        t_stage.push("4");
    } else if (data.invasion.t3b) {
        t_stage.push("3b");
    } else if (data.invasion.t3a) {
        t_stage.push("3a");
    } else if (data.invasion.t2b) {
        t_stage.push("2b");
    } else if (data.invasion.t2a) {
        // T2a: 陰道上 2/3 侵犯無子宮頸旁侵犯。依腫瘤大小細分：≤4 cm 為 2a1，>4 cm 為 2a2
        if (!data.isNonMeasurable && hasValidSize) {
            if (data.tumorSize <= 4.0) {
                t_stage.push("2a1");
            } else {
                t_stage.push("2a2");
            }
        } else {
            t_stage.push("2a");
        }
    } else if (data.invasion.t1) {
        // T1: 局限於子宮頸。依腫瘤大小細分：≤2 cm 為 1b1，>2 且 ≤4 cm 為 1b2，>4 cm 為 1b3
        if (!data.isNonMeasurable && hasValidSize) {
            if (data.tumorSize <= 2.0) {
                t_stage.push("1b1");
            } else if (data.tumorSize <= 4.0) {
                t_stage.push("1b2");
            } else {
                t_stage.push("1b3");
            }
        } else {
            t_stage.push("1a");
        }
    } else if (data.isT0 || data.tumorSize === 0) {
        t_stage.push("0");
    } else {
        t_stage.push("x");
    }

    // calculate N stage
    if (data.nodes.hasRegional) {
        if (data.nodes.hasParaaortic) {
            n_stage.push("2");
        } else {
            n_stage.push("1");
        }
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
