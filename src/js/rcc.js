import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/rcc.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateRCCStage } from './rcc_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor ≤7 cm in greatest dimension, limited to the kidney'],
    ['1a', 'Tumor ≤4 cm in greatest dimension, limited to the kidney'],
    ['1b', 'Tumor >4 cm but ≤7 cm in greatest dimension limited to the kidney'],
    ['2', 'Tumor >7 cm in greatest dimension, limited to the kidney'],
    ['2a', 'Tumor >7 cm but ≤10 cm in greatest dimension, limited to the kidney'],
    ['2b', 'Tumor >10 cm, limited to the kidney'],
    ['3', 'Tumor extends into major veins or perinephric tissues, but not into the ipsilateral adrenal gland and not beyond Gerota’s fascia'],
    ['3a', 'Tumor extends into the renal vein or its segmental branches, or invades the pelvicalyceal system, or invades perirenal and/or renal sinus fat but not beyond Gerota’s fascia'],
    ['3b', 'Tumor extends into the vena cava below the diaphragm'],
    ['3c', 'Tumor extends into the vena cava above the diaphragm or invades the wall of the vena cava'],
    ['4', 'Tumor invades beyond Gerota’s fascia (including contiguous extension into the ipsilateral adrenal gland)'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in regional node(s)'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

function generate_report(){
    var report = "1. ";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
Sagittal and Axial FSE T2WI
Axial FSE T1WI with FS, pre- and post- contrast
Axial T1WI with contrast, abdominal survey
(Coronal FSE T2WI)
(Axial T2WI, lower abdominal survey)`;
    } else {
        report += `CT protocol
Without and with contrast medium at nephrographic phase
Axial section slice thickness/interval: 5/5mm
Coronal section slice thickness/interval: 5/5mm
Range: diaphragm to the pelvis cavity`;
    }
    report += "\n\n";

    // Tumor location / size
    let t_dia = parseFloat($('#txt_ts_dia').val());
    report += "2. Tumor location / size\n";
    if ($('#cb_ts_na').is(':checked')) {
        report += "--- Not assessable";
    } else {
        report += "Location: ";
        if ($('.cb_tl:checked').length) {
            report += join_checkbox_values($('.cb_tl:checked')) + "\n";
        }
        report += `Size: ${t_dia} cm (largest diameter of the biggest tumor)`;
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('#cb_ti_na').is(':checked')) {
        report += "--- Not assessable\n";
    } else {
        if ($('.cb_ti:checked').length) {
            report += "--- Yes:\n";
            if ($('.cb_ti_t3a:checked').length) {
                report += "* " + join_checkbox_values($('.cb_ti_t3a:checked'), "\n* ") + "\n";
            }
            if ($('.cb_ti_t3bc:checked').length) {
                var ivc = [];
                if ($("input[name='rb_ti_ivc']:checked").length) {
                    ivc.push($("input[name='rb_ti_ivc']:checked").next().text());
                }
                if ($('.cb_ti_t3c:checked').length) {
                    ivc.push($('.cb_ti_t3c:checked').next().text());
                }
                report += "* IVC: " + ivc.join(", ") + "\n";
            }
            if ($('.cb_ti_t4:checked').length) {
                report += "* " + join_checkbox_values($('.cb_ti_t4:checked'), "\n* ");
                if ($('#cb_ti_others').is(':checked')) {
                    report += "\n* " + $('#txt_ti_others').val();
                }
                report += "\n";
            }
            //console.log(t_stage);
        }
        if ($('.cb_ti:not(:checked)').length) {
            report += "--- No or Equivocal:\n";
            report += "* " + join_checkbox_values($('.cb_ti:not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_rn:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_rn:not(:checked)')) + "\n";
        }
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
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not("#cb_dm_others"):not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):not(:checked)')) + "\n";
    }
    report += "\n";

    // Calculate staging via Logic
    const data = {
        tumorSize: t_dia,
        isNotAssessable: $('#cb_ts_na').is(':checked'),
        invasion: {
            t3a: $('.cb_ti_t3a:checked').length > 0,
            t3bc: $('.cb_ti_t3bc:checked').length > 0,
            t3c: $('.cb_ti_t3c:checked').length > 0,
            t4: $('.cb_ti_t4:checked').length > 0,
            ivcLevel: $("input[name='rb_ti_ivc']:checked").val() || ''
        },
        hasNodes: $('.cb_rn:checked').length > 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculateRCCStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Renal Cell Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Renal Cell Carcinoma Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Renal Cell Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
