export function calculateEndometriumStage(data) {
    // data structure expected:
    // {
    //   isNotAssessable: boolean,
    //   invasion: {
    //     t4: boolean,
    //     t3b: boolean,
    //     t3a: boolean,
    //     t2: boolean,
    //     t1b: boolean, // mhm
    //     t1a: boolean  // lhm
    //   },
    //   nodes: {
    //     hasParaaortic: boolean,
    //     hasRegional: boolean
    //   },
    //   hasMetastasis: boolean
    // }

    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    // Check invasion first as per legacy logic order, but 'not assessable' overrides T0 if nothing else selected?
    // Legacy: if (has_ti_na && !has_ti) -> Tx.
    // If invasion present, it overrides 'not assessable' flag in logic?
    // Legacy: let has_ti = ... > 0.
    // if (has_ti_na && !has_ti) { push x } else if ...
    
    // So if T4 is checked, even if 'Not assessable' is checked, it goes to T4?
    // No, logic says `if (has_ti_na && !has_ti)`. So if invasion is present, `!has_ti` is false, so it goes to else.
    // Thus invasion overrides "not assessable" if user checked both (which shouldn't happen but logic handles it).

    const has_ti = data.invasion.t4 || data.invasion.t3b || data.invasion.t3a || data.invasion.t2 || data.invasion.t1b || data.invasion.t1a;

    if (data.isNotAssessable && !has_ti) {
        t_stage.push("x");
    } else if (data.invasion.t4) {
        t_stage.push("4");
    } else if (data.invasion.t3b) {
        t_stage.push("3b");
    } else if (data.invasion.t3a) {
        t_stage.push("3a");
    } else if (data.invasion.t2) {
        t_stage.push("2");
    } else if (data.invasion.t1b) {
        t_stage.push("1b");
    } else if (data.invasion.t1a) {
        t_stage.push("1a");
    } else {
        // T0
        t_stage.push("0");
    }

    // calculate N stage
    if (data.nodes.hasParaaortic) {
        n_stage.push("2");
    } else if (data.nodes.hasRegional) {
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
