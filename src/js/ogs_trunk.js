import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/ogs_trunk.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage, getMaxStage} from './ajcc_common.js';
import {calculateOgsTrunkStage, AJCC_T, AJCC_N, AJCC_M} from './ogs_trunk_logic.js';

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
    if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n* ") + "\n";
    }

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
    $('input[name="radio_ti"]').each(function(){
        var item_str = ($(this).is(':checked') ? '(+) ' : '(-) ');
        report += item_str + $(this).next().text();
        report += "\n";
    });
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
    const stageResult = calculateOgsTrunkStage({
        isNonMeasurable,
        tumorSize: isNaN(t_length) ? 0 : t_length,
        hasDiscontinuousTumor: $('.cb_tl_t3:checked').length > 0,
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
    report += ajcc_template_with_parent("OGS for Appendicular Skeleton, Trunk, Skull and Facial Bones", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("OGS for Appendicular Skeleton, Trunk, Skull and Facial Bones Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

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
    ajccTitleHtml: "AJCC Definitions for OGS for Appendicular Skeleton, Trunk, Skull and Facial Bones <span class='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ml-2' style='vertical-align: super;'>8th</span>"
});
