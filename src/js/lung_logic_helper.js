
// Lymph Node Helper Logic
const LN_HELPER_STATE = {
    selectedUIDs: new Set(),
    tumorSide: null // 'Right' or 'Left'
};

$('#btn_ln_helper').click(function() {
    // 1. Determine Tumor Side
    let hasRight = $('#cb_tp_tl_rul').is(':checked') || $('#cb_tp_tl_rml').is(':checked') || $('#cb_tp_tl_rll').is(':checked');
    let hasLeft = $('#cb_tp_tl_lul').is(':checked') || $('#cb_tp_tl_lll').is(':checked');

    if (hasRight && hasLeft) {
        alert("Bilateral tumor location selected. Please select one side to use the helper.");
        return;
    }
    if (!hasRight && !hasLeft) {
        alert("Please select a Tumor Location (RUL, RML, RLL, etc.) first.");
        return;
    }

    LN_HELPER_STATE.tumorSide = hasRight ? 'Right' : 'Left';
    $('#lbl_helper_lat').text(LN_HELPER_STATE.tumorSide);

    // Restore selection UI
    $('.ln-station-btn').removeClass('selected');
    LN_HELPER_STATE.selectedUIDs.forEach(uid => {
        $(`.ln-station-btn[data-uid='${uid}']`).addClass('selected');
    });

    // Open Modal
    document.getElementById('modal_ln_helper').showModal();
});

$('.ln-station-btn').click(function() {
    $(this).toggleClass('selected');
    const uid = $(this).data('uid');

    if ($(this).hasClass('selected')) {
        LN_HELPER_STATE.selectedUIDs.add(uid.toString());
    } else {
        LN_HELPER_STATE.selectedUIDs.delete(uid.toString());
    }
});

$('#btn_ln_clear').click(function() {
    LN_HELPER_STATE.selectedUIDs.clear();
    $('.ln-station-btn').removeClass('selected');
});

$('#btn_ln_submit').click(function() {
    const side = LN_HELPER_STATE.tumorSide;

    // Convert UIDs to Stations
    let stations = new Set();
    LN_HELPER_STATE.selectedUIDs.forEach(uid => {
         const st = $(`.ln-station-btn[data-uid='${uid}']`).data('station');
         if (st) stations.add(st.toString());
    });
    const stationArray = Array.from(stations);

    // Logic to determine N stage
    let isN3 = false;
    let n2Stations = new Set(); // To count distinct N2 stations
    let isN1 = false;

    // Reset Main Form Checkboxes
    $('.cb_rn').prop('checked', false);
    $('input[name="radio_n2"]').prop('checked', false);

    // Map stations
    stationArray.forEach(st => {
        let stSide = null; // 'Right' or 'Left' or 'Mid'
        if (st.endsWith('R')) stSide = 'Right';
        else if (st.endsWith('L') || ['3A', '5', '6'].includes(st)) stSide = 'Left';
        else stSide = 'Mid'; // 1, 7

        // Station 1: Scalene/Supraclavicular -> N3
        if (st === '1') {
            $('#cb_rn_spc').prop('checked', true); // generic supraclavicular/scalene
            isN3 = true;
        }

        // Mediastinal Stations: 2, 3A, 4, 5, 6, 7, 8, 9
        // 5, 6 are Left side nodes generally
        else if (['2R', '2L', '3A', '4R', '4L', '5', '6', '7', '8R', '8L', '9R', '9L'].includes(st)) {
            // Check Ipsilateral vs Contralateral
            let isContra = false;

            if (stSide === 'Mid') {
                // 7 (Subcarinal) -> N2 (Ipsilateral mediastinal)
                // So always N2.
                n2Stations.add(st);
            } else {
                if (side === 'Right') {
                    if (stSide === 'Left' || st === '5' || st === '6') isContra = true;
                } else { // Left
                    if (stSide === 'Right') isContra = true;
                }

                if (isContra) {
                    $('#cb_rn_cm').prop('checked', true); // Contralateral mediastinal
                    isN3 = true;
                } else {
                    // Ipsilateral Mediastinal
                    n2Stations.add(st);
                    $('#cb_rn_im').prop('checked', true);
                }
            }
            if (st === '7') $('#cb_rn_sbc').prop('checked', true);
        }

        // Hilar/Lobar: 10, 11
        else if (['10R', '10L', '11R', '11L'].includes(st)) {
             let isContra = false;
             if (side === 'Right' && stSide === 'Left') isContra = true;
             if (side === 'Left' && stSide === 'Right') isContra = true;

             if (isContra) {
                 // Contralateral Hilar -> N3
                 $('#cb_rn_ch').prop('checked', true);
                 isN3 = true;
             } else {
                 isN1 = true;
                 if (st.includes('10')) $('#cb_rn_ih').prop('checked', true); // Hilar
                 if (st.includes('11')) $('#cb_rn_ip').prop('checked', true); // Peribronchial
             }
        }
    });

    // Handle N2a vs N2b
    if (n2Stations.size > 0) {
        if (n2Stations.size > 1) {
            $('#radio_n2b').prop('checked', true);
        } else {
            $('#radio_n2a').prop('checked', true);
        }
    }

    document.getElementById('modal_ln_helper').close();
});
