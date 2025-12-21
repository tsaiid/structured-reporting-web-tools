export function calculateGistStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNonMeasurable: boolean,
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNonMeasurable) {
        // Legacy code didn't strictly handle this for stage, but we should probably assume x or handle it.
        // Legacy code: if non-measurable, nothing pushed (so stays '0'). 
        // But if measurable:
        // if > 10 -> 4, > 5 -> 3, > 2 -> 2, > 0 -> 1.
    } else if (data.tumorSize > 0) {
        if (data.tumorSize > 10) {
            t_stage.push("4");
        } else if (data.tumorSize > 5) {
            t_stage.push("3");
        } else if (data.tumorSize > 2) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }
    }

    // calculate N stage
    if (data.hasNodes) {
        n_stage.push("1");
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
