
// Gastric Lymph Node Helper Logic
const LN_HELPER_STATE = {
    selectedUIDs: new Set()
};

$('#btn_ln_helper').click(function() {
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
    // Reset Main Form Regional Checkboxes
    // We only reset the ones that are in the helper to avoid clearing "Others" or manual inputs if we can avoid it.
    // However, usually "Apply" implies a strict mapping. Let's uncheck known stations.

    // Regional List:
    const regionalSelectors = [
        '#cb_rn_rpc', '#cb_rn_lpc', '#cb_rn_lc', '#cb_rn_gc', '#cb_rn_sp', '#cb_rn_ip',
        '#cb_rn_lga', '#cb_rn_cha', '#cb_rn_ca', '#cb_rn_sh', '#cb_rn_sa', '#cb_rn_hp',
        '#cb_rn_smv'
    ];
    regionalSelectors.forEach(sel => $(sel).prop('checked', false));

    // Distant List that are in helper:
    const distantSelectors = [
        '#cb_dm_nrn_rp', '#cb_dm_nrn_mr', '#cb_dm_nrn_mca', '#cb_dm_nrn_pa'
    ];
    distantSelectors.forEach(sel => $(sel).prop('checked', false));

    // Map stations
    LN_HELPER_STATE.selectedUIDs.forEach(uid => {
        // Mapping based on data-station or uid
        // Regional
        if (uid === '1') $('#cb_rn_rpc').prop('checked', true); // Right paracardial
        if (uid === '2') $('#cb_rn_lpc').prop('checked', true); // Left paracardial
        if (uid === '3') $('#cb_rn_lc').prop('checked', true);  // Lesser curvature
        if (uid === '4sa' || uid === '4sb' || uid === '4d') $('#cb_rn_gc').prop('checked', true); // Greater curvature
        if (uid === '5') $('#cb_rn_sp').prop('checked', true);  // Suprapyloric
        if (uid === '6') $('#cb_rn_ip').prop('checked', true);  // Infrapyloric
        if (uid === '7') $('#cb_rn_lga').prop('checked', true); // Left gastric artery
        if (uid === '8') $('#cb_rn_cha').prop('checked', true); // Common hepatic artery
        if (uid === '9') $('#cb_rn_ca').prop('checked', true);  // Celiac artery
        if (uid === '10') $('#cb_rn_sh').prop('checked', true); // Splenic hilum
        if (uid === '11') $('#cb_rn_sa').prop('checked', true); // Splenic artery
        if (uid === '12') $('#cb_rn_hp').prop('checked', true); // Hepatic pedicle
        if (uid === '14v') $('#cb_rn_smv').prop('checked', true); // Superior mesenteric vein

        // Distant
        if (uid === '13' || uid === '13b') $('#cb_dm_nrn_rp').prop('checked', true); // Retropancreatic
        if (uid === '14a') $('#cb_dm_nrn_mr').prop('checked', true); // Superior mesenteric artery
        if (uid === '15') $('#cb_dm_nrn_mca').prop('checked', true); // Middle colic artery
        if (uid === '16' || uid === '16b') $('#cb_dm_nrn_pa').prop('checked', true); // Para-aortic
    });

    // Update Number of Suspicious Lymph Nodes (Regional only)
    // We count how many REGIONAL checkboxes are checked now.
    // Note: The helper might select multiple stations.
    // The user requirement says: "Checkbox 的改動要和 generate report 和計算 stage 正確連動".
    // Usually if I select 3 stations, the number should be at least 3, or I should just let the user adjust.
    // But `gastric.js` has logic: `$('.cb_rn').change(function(){ ... increment/decrement ... })`
    // Since we are setting prop checked programmatically, the 'change' event might not fire automatically unless we trigger it.
    // However, blindly triggering change for every set might be chaotic.
    // Let's count the checked regional boxes and update the number if the current number is less than that count.

    let checkedRegionalCount = 0;
    regionalSelectors.forEach(sel => {
        if($(sel).is(':checked')) checkedRegionalCount++;
    });

    // Update the number input
    // If the input is empty or 0, set it to count.
    // If the input is less than count, set it to count.
    // (We assume at least 1 node per station if station is positive).
    let currentNum = parseInt($('#txt_rln_num').val()) || 0;
    if (currentNum < checkedRegionalCount) {
        $('#txt_rln_num').val(checkedRegionalCount);
    }

    document.getElementById('modal_ln_helper').close();
});
