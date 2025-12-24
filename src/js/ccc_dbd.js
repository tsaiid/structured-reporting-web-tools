import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/ccc_dbd.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculate_staging } from './ccc_dbd_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ/high-grade dysplasia'],
    ['1', 'Tumor invades the bile duct wall with a depth less than 5 mm'],
    ['2', 'Tumor invades the bile duct wall with a depth of 5-12 mm'],
    ['3', 'Tumor invades the bile duct wall with a depth greater than 12 mm'],
    ['4', 'Tumor involves the celiac axis, superior mesenteric artery, and/or common hepatic artery'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in one to three regional lymph nodes'],
    ['2', 'Metastasis in four or more regional lymph nodes'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

function generate_report(){
    // Gather data for logic
    const t_length = parseFloat($('#txt_ts_len').val());
    const is_measurable = !$('#cb_ts_nm').is(':checked') && t_length > 0;
    const t_depth = parseInt($('#txt_ti_dep').val()) || 0;
    const has_inv = !$('#cb_ti_na').is(':checked') && t_depth > 0;

    const data = {
        isMeasurable: is_measurable,
        hasInvasion: has_inv,
        invasionDepth: t_depth,
        isT4: $('.cb_ti_t4:checked').length > 0,
        nodesCount: parseInt($('#txt_rln_num').val()) || 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const staging = calculate_staging(data);
    const t_stage = staging.t;
    const n_stage = staging.n;
    const m_stage = staging.m;

    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `[+] CT scan  [ ] MRI`;
    } else {
        report += `[ ] CT scan  [+] MRI`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor size\n`;
    report += "  - Size: ";
    if (!is_measurable) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (greatest dimension)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest dimension)`;
    }
    report += "\n\n";

    report += "3. Tumor invasion\n";
    report += "  - Tumor invades the bile duct wall with a depth (Maximum tumor thickness): " + (has_inv? t_depth + " mm" : "" ) + "\n";
    report += "    [" + (has_inv? " " : "+") + "] Difficult to access\n";
    report += "    [" + (has_inv && t_depth < 5 ? "+" : " ") + "] < 5 mm (T1)\n";
    report += "    [" + (has_inv && t_depth >= 5 && t_depth <= 12 ? "+" : " ") + "] 5-12 mm (T2)\n";
    report += "    [" + (has_inv && t_depth > 12 ? "+" : " ") + "] > 12 mm (T3)\n";
    report += "  - Tumor invades (T4)\n    ";
    $('.cb_ti_t4:not("#cb_ti_others")').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `[${check_or_not}] ` + $(this).val() + "  ";
    });
    report += "\n";
    let has_other_inv = $('#cb_ti_others').is(':checked');
    report += "    [" + (has_other_inv? "+" : " ") + "] Other adjacent organ: ";
    report += $('#txt_ti_others').val()? $('#txt_ti_others').val() : "___";
    report += "\n\n";

    // Regional nodal metastasis
    let rln_num = data.nodesCount;
    let has_rln = rln_num > 0;
    report += `4. Regional nodal metastasis
    [` + (has_rln? " " : "+") + `] No regional lymph node metastasis
    [` + (has_rln && rln_num <= 3 ? "+" : " ") + `] 1-3 positive lymph nodes (N1)
    [` + (has_rln && rln_num > 3 ? "+" : " ") + `] 4 or more positive lymph nodes (N2)
    Number: ` + (Number.isInteger(rln_num)? rln_num : "___");

    report += "\n\n";

    // Distant metastasis
    let has_dm = data.hasMetastasis;
    report += "5. Distant metastasis (In this study)\n";
    report += "    [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_dm ? "+" : " ") + "] Yes, location: ";
    if (has_dm) {
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'));
        }
        if ($('#cb_dm_others').is(':checked')) {
            if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
                report += ', '
            }
            report += $('#txt_dm_others').val();
        }
    } else {
        report += "___";
    }
    report += "\n\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Cholangiocarcinoma: Distal Bile Duct", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Cholangiocarcinoma: Distal Bile Duct Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('.cb_rn, input[name="radio_rn"]').change(function() {
    if ($(this).parent().parent().find('.cb_rn:checked').length) {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", true);
    } else {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", false);
    }
    $(this).parent().parent().siblings().find('.cb_rn').prop('checked', false);
});

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

// auto- increase or decrease lymph node numbers
$('.cb_rn').change(function(){
    let rln_num = +$('#txt_rln_num').val();
    if (this.checked) {
        $('#txt_rln_num').val(rln_num + 1);
    } else {
        if (rln_num > 0) {
            $('#txt_rln_num').val(rln_num - 1);
        }
    }
});

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Cholangiocarcinoma: Distal Bile Duct <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
});



/*
var clipboard = new ClipboardJS('#btn_copy');
clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);

    e.clearSelection();
    $('#btn_copy').tooltip('show');
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
    $('#btn_copy').attr('data-original-title', "Press Ctrl+C to copy!").tooltip('show');
});

$('#btn_copy').mouseleave(function(){
    $(this).tooltip('dispose');
});
*/
