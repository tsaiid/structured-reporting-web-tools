export function calculateEsophagusStage(data) {
    // data structure expected:
    // {
    //   hasInvasion: boolean,
    //   hasNoMeasurableTumor: boolean,
    //   invasion: { t4b: boolean, t4a: boolean, t3: boolean, t2: boolean },
    //   nodesCount: number,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (!data.hasInvasion) {
        if (data.hasNoMeasurableTumor) {
            t_stage.push("x");
        } else {
            t_stage.push("1");
        }
    } else {
        if (data.invasion.t4b) {
            t_stage.push("4b");
        }
        if (data.invasion.t4a) {
            t_stage.push("4a");
        }
        if (data.invasion.t3) {
            t_stage.push("3");
        }
        if (data.invasion.t2) {
            t_stage.push("2");
        }
    }

    // calculate N stage
    if (data.nodesCount > 0) {
        if (data.nodesCount >= 7) {
            n_stage.push("3");
        } else if (data.nodesCount >= 3) {
            n_stage.push("2");
        } else if (data.nodesCount >= 1) {
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
