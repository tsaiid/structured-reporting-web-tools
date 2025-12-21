export function calculateGastricStage(data) {
    // data structure expected:
    // {
    //   tStageValue: string, // from radios_tid
    //   nodesCount: number,
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.tStageValue) {
        t_stage.push(data.tStageValue);
    }

    // calculate N stage
    if (data.nodesCount > 0) {
        if (data.nodesCount >= 16) {
            n_stage.push("3b");
        } else if (data.nodesCount >= 7) {
            n_stage.push("3a");
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
