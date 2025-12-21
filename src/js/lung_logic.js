export function get_t_stage_by_size(t_size) {
    var t_stage;
    if (isNaN(t_size)) {
        t_stage = "x";
    } else if (t_size === 0) {
        t_stage = "0";
    } else if (t_size <= 1) {
        t_stage = "1a";
    } else if (t_size <= 2) {
        t_stage = "1b";
    } else if (t_size <= 3) {
        t_stage = "1c";
    } else if (t_size <= 4) {
        t_stage = "2a";
    } else if (t_size <= 5) {
        t_stage = "2b";
    } else if (t_size <= 7) {
        t_stage = "3";
    } else {
        t_stage = "4";
    }
    return t_stage;
}

export function getMaxStageNumber(arr) {
    return arr
        .filter(item => /^\d/.test(item)) // 只保留第一個字元是數字的
        .map(item => parseInt(item, 10))  // 轉換為純數字
        .reduce((max, num) => Math.max(max, num), -Infinity); // 取最大值
}

export function calculateLungStage(data) {
    // data structure expected:
    // {
    //   tumorSize: number (cm),
    //   isNonMeasurable: boolean,
    //   invasion: { t4: boolean, t3: boolean, t2a: boolean },
    //   nodes: { n1: boolean, n2: boolean, n2Type: '2a'|'2b', n3: boolean },
    //   metastasis: { m1a: boolean, m1bc: boolean, m1Type: '1b'|'1c1'|'1c2' }
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.isNonMeasurable) {
        t_stage.push("x");
    } else {
        t_stage.push(get_t_stage_by_size(data.tumorSize));
        if (data.invasion.t4) {
            t_stage.push("4");
        } else if (data.invasion.t3) {
            t_stage.push("3");
        } else if (data.invasion.t2a) {
            t_stage.push("2");
        }
    }

    // calculate N stage
    // Check if any node is involved
    const hasNodes = data.nodes.n1 || data.nodes.n2 || data.nodes.n3;
    if (hasNodes) {
        if (data.nodes.n1) {
            n_stage.push("1");
        }
        if (data.nodes.n2) {
            n_stage.push("2");
            if (data.nodes.n2Type) {
                n_stage.push(data.nodes.n2Type);
            }
        }
        if (data.nodes.n3) {
            n_stage.push("3");
        }
    }

    // calculate M stage
    const hasMetastasis = data.metastasis.m1a || data.metastasis.m1bc;
    if (hasMetastasis) {
        if (data.metastasis.m1a) {
            m_stage.push("1a");
        }
        if (data.metastasis.m1bc) {
            if (data.metastasis.m1Type) {
                m_stage.push(data.metastasis.m1Type);
            }
        }
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
