export function calculateGastricStage(data) {
    // data structure expected:
    // {
    //   tStageValue: string, // from radios_tid
    //   isNonMeasurable?: boolean,
    //   isT0?: boolean,
    //   nodesCount: number,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isT0) {
        // T0: 無原發腫瘤證據
        t_stage.push("0");
    } else if (data.isNonMeasurable && (!data.tStageValue || data.tStageValue === 'x')) {
        // Tx: 腫瘤無法測量且無明確侵犯深度
        t_stage.push("x");
    } else if (data.tStageValue && data.tStageValue !== 'x') {
        // 依侵犯深度判定 (T1b, T2, T3, T4a, T4b)
        t_stage.push(data.tStageValue);
    } else {
        // Tx: 無法評估原發腫瘤 (Not assessable)
        t_stage.push("x");
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
