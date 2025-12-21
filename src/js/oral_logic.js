export function calculateOralStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNotAssessable: boolean,
    //   isNoEvidence: boolean,
    //   hasTumorLocation: boolean,
    //   isLip: boolean,
    //   isOral: boolean,
    //   invasion: {
    //     lipT4a: boolean,
    //     oralT4a: boolean,
    //     t4b: boolean
    //   },
    //   nodes: {
    //     hasNodes: boolean,
    //     nodeSize: number,
    //     hasENE: boolean,
    //     isSingleNode: boolean,
    //     isBilateralOrContralateral: boolean
    //   },
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNotAssessable) {
        t_stage.push('x');
    } else if (data.isNoEvidence || !data.hasTumorLocation) {
        t_stage.push('0');
    } else {
        // by size
        const t_length = data.tumorSize;
        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }

        // by invasion
        if (data.isLip && data.invasion.lipT4a) {
            t_stage.push("4a");
        }
        if (data.isOral && data.invasion.oralT4a) {
            t_stage.push("4a");
        }
        if (data.invasion.t4b) {
            t_stage.push("4b");
        }
    }

    // Calculate N stage
    if (data.nodes.hasNodes) {
        if (data.nodes.hasENE) {
            n_stage.push("3b");
        } else if (data.nodes.nodeSize > 6.0) {
            n_stage.push("3a");
        } else if (data.nodes.isBilateralOrContralateral) {
            n_stage.push("2c");
        } else if (!data.nodes.isSingleNode) { // multiple ipsilateral
            n_stage.push("2b");
        } else if (data.nodes.nodeSize > 3.0) { // single ipsilateral, > 3 cm
            n_stage.push("2a");
        } else { // single ipsilateral, <= 3 cm
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
