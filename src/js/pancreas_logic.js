export function calculatePancreasStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNonMeasurable: boolean,
    //   isT4: boolean, // vascular invasion
    //   nodesCount: number,
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isT4) {
        t_stage.push("4");
    } else if (data.isNonMeasurable || isNaN(data.tumorSize)) {
        t_stage.push("x");
    } else {
        const t_length = data.tumorSize;
        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else if (t_length >= 1) {
            t_stage.push("1c");
        } else if (t_length > 0.5) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    }

    // calculate N stage
    if (data.nodesCount > 0) {
        if (data.nodesCount >= 4) {
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
