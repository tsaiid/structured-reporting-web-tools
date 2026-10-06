import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/ogs_spine.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage, getMaxStage} from './ajcc_common.js';
import {
    calculateOgsSpineStage,
    isNonAdjacentVertebralSegments,
    AJCC_T,
    AJCC_N,
    AJCC_M
} from './ogs_spine_logic.js';

function generate_report(){
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `(+) CT scan  ( ) MRI`;
    } else {
        report += `( ) CT scan  (+) MRI`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor location / size
--- Location: ` + $('#txt_tl').val() + "\n";

    report += "--- Size: ";
    const isNonMeasurable = $('#cb_ts_nm').is(':checked');
    const t_length = parseFloat($('#txt_ts_len').val());
    if (isNonMeasurable) {
        report += "Non-measurable";
    } else {
        report += "Measurable: " + t_length + " cm (greatest dimension of the largest tumor)\n";
    }
    report += "\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_ti_ss:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_ss:checked')) + "\n";
        }
        if ($('.cb_ti_t4:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4:checked'), "\n* ") + "\n";
        }
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal\n";
        if ($('.cb_ti_ss:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_ss:not(:checked)')) + "\n";
        }
        if ($('.cb_ti_t4:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4:not(:checked)'), "\n* ") + "\n";
        }
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes: " + $('#txt_rn_others').val() + "\n";
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal\n";
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
    }
    if ($('.cb_dm:not("#cb_dm_others"):not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

    // 分期計算 (純函式)
    const selectedSegments = $('.cb_ti_ss:checked').map(function(){ return $(this).val(); }).get();
    const stageResult = calculateOgsSpineStage({
        isNonMeasurable,
        segments: selectedSegments,
        hasNonAdjacentSegments: isNonAdjacentVertebralSegments(selectedSegments),
        invasion: {
            t4a: $('.cb_ti_t4a:checked').length > 0,
            t4b: $('.cb_ti_t4b:checked').length > 0
        },
        nodes: {
            hasNodes: $('.cb_rn:checked').length > 0
        },
        metastasis: {
            hasMetastasis: $('.cb_dm:checked').length > 0,
            isM1b: $('.cb_dm_m1b:checked').length > 0,
            hasLungMetastasis: $('#cb_dm_lu').is(':checked')
        }
    });

    let t = getMaxStage(stageResult.t);
    let n = getMaxStage(stageResult.n);
    let m = getMaxStage(stageResult.m);
    report += ajcc_template_with_parent("OGS for Spine", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("OGS for Spine");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

// check if any nonadj vb seg
$('.cb_ti_ss').change(function() {
    const selected = $('.cb_ti_ss:checked').map(function(){ return $(this).val(); }).get();
    $('#cb_ti_navs').prop('checked', isNonAdjacentVertebralSegments(selected));
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
    ajccTitleHtml: "AJCC Definitions for OGS for Spine <span class='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ml-2' style='vertical-align: super;'>8th</span>"
});
