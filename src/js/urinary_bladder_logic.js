export function calculateUrinaryBladderStage(data) {
    // data structure expected:
    // {
    //   isNotAssessable: boolean,
    //   isNonMeasurable: boolean,
    //   isTInvasionNotAssessable: boolean,
    //   invasion: {
    //     t4b: boolean,
    //     t4a: boolean,
    //     t3: boolean,
    //     t2: boolean
    //   },
    //   nodes: {
    //     hasNodes: boolean,
    //     hasCommonIliacNodes: boolean, // N3
    //     isMultipleNodes: boolean, // N2
    //     nodesCount: number // legacy: >1 implies N2 if logic used count
    //   },
    //   metastasis: {
    //     hasMetastasis: boolean,
    //     isM1b: boolean
    //   }
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNotAssessable || data.isNonMeasurable) {
        if (data.isTInvasionNotAssessable) {
            t_stage.push("x");
        } else {
            t_stage.push("0");
        }
    } else {
        t_stage.push("1");
        if (data.invasion.t2) t_stage.push("2");
        if (data.invasion.t3) t_stage.push("3");
        if (data.invasion.t4a) t_stage.push("4a");
        if (data.invasion.t4b) t_stage.push("4b");
    }

    // calculate N stage
    if (data.nodes.hasNodes) {
        if (data.nodes.hasCommonIliacNodes) {
            n_stage.push("3");
        } else if (data.nodes.isMultipleNodes || data.nodes.nodesCount > 1) {
            n_stage.push("2");
        } else {
            n_stage.push("1");
        }
    }

    // calculate M stage
    if (data.metastasis.hasMetastasis) {
        if (data.metastasis.isM1b) {
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
