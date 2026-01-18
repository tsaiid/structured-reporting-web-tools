import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/gist.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateGistStage } from './gist_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor 2 cm or less'],
    ['2', 'Tumor more than 2 cm but not more than 5 cm'],
    ['3', 'Tumor more than 5 cm but not more than 10 cm'],
    ['4', 'Tumor more than 10 cm in greatest dimension'],
]);
const AJCC_N = new Map([
    ['0', 'No regional lymph node metastasis or unknown lymph node status'],
    ['1', 'Regional lymph node metastasis'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

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
--- Location:
`;
    if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n* ") + "\n";
    }

    let t_length = parseFloat($('#txt_ts_len').val());
    report += "--- Size:\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "* Non-measurable";
    } else {
        report += "* Measurable: " + t_length + " cm (greatest dimension of the largest tumor)";
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('input[name="radios_ti"]:checked').length) {
        let radio_ti = $('input[name="radios_ti"]:checked');
        report += "* " + radio_ti.next().text();
        if (radio_ti.val() == "ti") {
            report += ', location: ' + $('#txt_ti_loc').val();
        }
        report += "\n";
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
        if ($('.cb_dm_nrn:checked').length) {
            report += "* Non-regional lymph nodes: " + join_checkbox_values($('.cb_dm_nrn:checked')) + "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrn):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):checked'), "\n* ");
        }
        if ($('#cb_dm_others:checked').length) {
            report += $('#txt_dm_others').val();
        }
        report += "\n";
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_dm_nrn:not(:checked)').length) {
            report += "* Non-regional lymph nodes: " + join_checkbox_values($('.cb_dm_nrn:not(:checked)')) + "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrn):not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Calculate staging via Logic
    const data = {
        tumorSize: t_length,
        isNonMeasurable: $('#cb_ts_nm').is(':checked'),
        hasNodes: $('.cb_rn:checked').length > 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculateGistStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC_T[t];
    let n_str = AJCC_N[n];
    let m_str = AJCC_M[m];
    report += ajcc_template_with_parent("Gastrointestinal Stromal Tumor", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Gastrointestinal Stromal Tumor Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

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
    ajccTitleHtml: "AJCC Definitions for Gastrointestinal Stromal Tumor <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
