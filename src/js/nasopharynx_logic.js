export function calculateNasopharynxStage(data) {
    // data structure expected:
    // {
    //   isNonMeasurable: boolean,
    //   invasion: { t1: boolean, t2: boolean, t3: boolean, t4: boolean },
    //   nodes: {
    //     isPositive: boolean,
    //     maxSize: number,
    //     hasN3Location: boolean, // below cricoid
    //     hasENE: boolean,
    //     isBilateral: boolean,
    //     isUnilateral: boolean,
    //     isRPOnly: boolean
    //   },
    //   metastasis: { isPositive: boolean, isMoreThan3: boolean }
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNonMeasurable) {
        t_stage.push("x");
    }
    if (data.invasion.t1) t_stage.push("1");
    if (data.invasion.t2) t_stage.push("2");
    if (data.invasion.t3) t_stage.push("3");
    if (data.invasion.t4) t_stage.push("4");

    // calculate N stage
    if (data.nodes.isPositive) {
        if (data.nodes.maxSize > 6.0 || data.nodes.hasN3Location || data.nodes.hasENE) {
            n_stage.push("3");
        } else if (data.nodes.isBilateral) {
            n_stage.push("2");
        } else if (data.nodes.isUnilateral || data.nodes.isRPOnly) {
            n_stage.push("1");
        }
    }

    // calculate M stage
    if (data.metastasis.isPositive) {
        if (data.metastasis.isMoreThan3) {
            m_stage.push("1b");
        } else {
            m_stage.push("1a");
        }
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
