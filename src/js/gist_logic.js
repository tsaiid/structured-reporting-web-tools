export function calculateGistStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNonMeasurable: boolean,
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    const t_len = data.tumorSize;
    const hasValidSize = typeof t_len === 'number' && !isNaN(t_len) && t_len > 0;

    // calculate T stage
    if (data.isNonMeasurable) {
        // Tx: 非可測量或無法評估
        t_stage.push("x");
    } else if (hasValidSize) {
        // 依腫瘤最大徑分期
        if (t_len > 10) {
            t_stage.push("4");
        } else if (t_len > 5) {
            t_stage.push("3");
        } else if (t_len > 2) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }
    } else if (data.isT0 || t_len === 0) {
        // T0: 無原發腫瘤
        t_stage.push("0");
    } else {
        // 未填寫時防禦性給予 Tx，避免誤判為 T0
        t_stage.push("x");
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
