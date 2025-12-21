export function calculateRCCStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number,
    //   isNotAssessable: boolean,
    //   invasion: {
    //     t3a: boolean,
    //     t3bc: boolean,
    //     t3c: boolean,
    //     t4: boolean,
    //     ivcLevel: string // '3b' or '3c' or ''
    //   },
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNotAssessable) {
        t_stage.push("x");
    } else {
        // Size based
        const t_dia = data.tumorSize;
        if (t_dia > 10) {
            t_stage.push('2b');
        } else if (t_dia > 7) {
            t_stage.push('2a');
        } else if (t_dia > 4) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }

        // Invasion based (can override size)
        if (data.invasion.t3a) {
            t_stage.push("3a");
        }
        if (data.invasion.t3bc) {
            t_stage.push("3b"); // Default base for this group check
            if (data.invasion.ivcLevel) {
                t_stage.push(data.invasion.ivcLevel);
            }
            if (data.invasion.t3c) {
                t_stage.push("3c");
            }
        }
        if (data.invasion.t4) {
            t_stage.push("4");
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
