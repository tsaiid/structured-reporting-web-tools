export function calculateHCCStage(data) {
    // data structure expected:
    // {
    //   tumorCount: number (or NaN if multiple/unspecified),
    //   largestTumorSize: number (cm),
    //   majorVascularInvasion: boolean (T4 criteria),
    //   hasNodes: boolean,
    //   hasMetastasis: boolean
    // }

    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];

    // calculate T stage
    if (data.majorVascularInvasion) {
        t_stage.push('4');
    } else if (data.tumorCount === 1) {
        if (data.largestTumorSize > 2) {
            t_stage.push('1b');
        } else {
            // Includes size 0 or undefined as '1a' in legacy logic if not handled? 
            // Legacy code: let t_length = parseFloat($('#txt_ts_len').val()); 
            // if empty, t_length is NaN. NaN > 2 is false. -> 1a.
            // But if size is missing, it should probably be X or handle gracefully?
            // The original code defaults to 1a if size is missing or 0.
            t_stage.push('1a');
        }
    } else {
        // Multiple tumors (count > 1 or NaN/multiple)
        if (data.largestTumorSize > 5) {
            t_stage.push('3');
        } else {
            t_stage.push('2');
        }
    }

    // calculate N stage
    if (data.hasNodes) {
        n_stage.push('1');
    }

    // calculate M stage
    if (data.hasMetastasis) {
        m_stage.push('1');
    }

    return {
        t: t_stage,
        n: n_stage,
        m: m_stage
    };
}
