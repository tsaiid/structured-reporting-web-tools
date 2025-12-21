export const map_prostate_invasion = {
    'One-half of one lobe or less': '2a',
    'More than one-half of one lobe but not both lobes': '2b',
    'Involves both lobes': '2c',
};

export function calculateProstateStage(data) {
    // data structure expected:
    // {
    //   isNotAssessable: boolean (Tx),
    //   isNoOrEquivocal: boolean (T0),
    //   tumorSize: number,
    //   invasion: {
    //     prostateInvasionType: string, // key for map_prostate_invasion
    //     t3a: boolean,
    //     t3b: boolean,
    //     t4: boolean
    //   },
    //   hasNodes: boolean,
    //   metastasis: { m1a: boolean, m1b: boolean, m1c: boolean }
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // Calculate T staging
    if (data.isNotAssessable) {
        t_stage.push("x");
    } else if (data.isNoOrEquivocal || data.tumorSize === 0) {
        t_stage.push("0");
    } else {
        if (data.invasion.prostateInvasionType && map_prostate_invasion[data.invasion.prostateInvasionType]) {
            t_stage.push(map_prostate_invasion[data.invasion.prostateInvasionType]);
        }
        if (data.invasion.t3a) {
            t_stage.push("3a");
        }
        if (data.invasion.t3b) {
            t_stage.push("3b");
        }
        if (data.invasion.t4) {
            t_stage.push("4");
        }
    }

    // calculate N stage
    if (data.hasNodes) {
        n_stage.push("1");
    }

    // Distant metastasis
    if (data.metastasis.m1a) {
        m_stage.push("1a");
    }
    if (data.metastasis.m1b) {
        m_stage.push("1b");
    }
    if (data.metastasis.m1c) {
        m_stage.push("1c");
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
