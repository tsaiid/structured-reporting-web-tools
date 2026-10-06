export function calculateOvaryStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   hasInvasion: boolean,
    //   isBilateral: boolean, // for T1b
    //   invasion: {
    //     t3: boolean,
    //     t3_gt_2cm: boolean, // if true -> 3c, else 3b
    //     t2: boolean,
    //     t2a: boolean,
    //     t2b: boolean
    //   },
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (!data.hasInvasion) {
        if (!data.tumorSize && data.tumorSize !== 0) { // check for null/NaN/undefined but allow 0
             t_stage.push("x");
        } else {
            if (data.tumorSize === 0) {
                t_stage.push("0");
            } else {
                if (data.isBilateral) {
                    t_stage.push("1b");
                } else {
                    t_stage.push("1a");
                }
            }
        }
    } else {
        if (data.invasion.t3) {
            if (data.invasion.t3_gt_2cm) {
                t_stage.push("3c");
            } else {
                t_stage.push("3b");
            }
        } else if (data.invasion.t2) {
            if (data.invasion.t2a) {
                t_stage.push("2a");
            }
            if (data.invasion.t2b) {
                t_stage.push("2b");
            }
        }
    }

    // 計算 N 分期（後腹腔淋巴結轉移屬於 N1，不影響原發腫瘤 T 分期）
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
