import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/hcc.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateHCCStage } from './hcc_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Solitary tumor ≤2 cm, or >2 cm without vascular invasion'],
    ['1a', 'Solitary tumor ≤2 cm'],
    ['1b', 'Solitary tumor >2 cm without vascular invasion'],
    ['2', 'Solitary tumor >2 cm with vascular invasion, or multiple tumors, none >5 cm'],
    ['3', 'Multiple tumors, at least one of which is >5 cm'],
    ['4', 'Single tumor or multiple tumors of any size involving a major branch of the portal vein or hepatic vein, or tumor(s) with direct invasion of adjacent organs other than the gallbladder or with perforation of visceral peritoneum'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
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
    let txt_tl_num = $('#txt_tl_num').val();
    let tl_num = parseInt(txt_tl_num, 10);
    if (tl_num > 3 || isNaN(tl_num)) {
        txt_tl_num = 'multiple';
    }
    let txt_tl_loc = $('#txt_tl_loc').val();
    let t_length = parseFloat($('#txt_ts_len').val());
    let ts_nm_check = $('#cb_ts_nm').is(':checked') || !t_length ? "+" : " ";
    let ts_m_check = !$('#cb_ts_nm').is(':checked') && t_length ? "+" : " ";
    let txt_ts_len = t_length ? t_length : "___";
    report += `2. Tumor location / size
  - Number (1,2,3 or multiple): ${txt_tl_num}
  - Location (segment or lobe): ${txt_tl_loc}
  - Size:
    [${ts_nm_check}] Non-measurable
    [${ts_m_check}] Measurable: ${txt_ts_len} cm (the largest tumor)

`;

    // Tumor characteristics and associated liver features
    report += "3. Tumor characteristics and associated liver features\n";
    $('.cb_tc').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val();
        if ($(this).hasClass('has_txt')) {
            report += ", location: ";
            let loc_txt = $(this).parent().next().children('input:text').val();
            report += loc_txt ? loc_txt : "___";
        }
        report += "\n";
    });
    report += "\n";

    // Collect data for calculation
    const data = {
        tumorCount: tl_num,
        largestTumorSize: t_length,
        majorVascularInvasion: $('.cb_tc_t4:checked').length > 0,
        hasNodes: $('.cb_rn:checked').length > 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculateHCCStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length;
    let rn_no_check = !has_rln ? "+" : " ";
    let rn_yes_check = has_rln ? "+" : " ";
    let rn_hh_check = $('#cb_rn_hh').is(':checked') ? "+" : " ";
    let rn_hl_check = $('#cb_rn_hl').is(':checked') ? "+" : " ";
    let rn_ip_check = $('#cb_rn_ip').is(':checked') ? "+" : " ";
    let rn_c_check = $('#cb_rn_c').is(':checked') ? "+" : " ";
    let rn_others_check = $('#cb_rn_others').is(':checked') ? "+" : " ";
    let txt_rn_others = $('#txt_rn_others').val() ? $('#txt_rn_others').val() : "___";
    report += `4. Regional nodal metastasis
    [${rn_no_check}] No or Equivocal
    [${rn_yes_check}] Yes, if yes, location (specified as below):
        [${rn_hh_check}] Hepatic hilum    [${rn_hl_check}] Hepatoduodenal ligament  [${rn_ip_check}] Inferior phrenic
        [${rn_c_check}] Caval            [${rn_others_check}] Others: ${txt_rn_others}

`;

    // calculate N stage (calculated via calculateHCCStage)

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
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

        // M stage calculated via calculateHCCStage
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
    report += ajcc_template_with_parent("Hepatocellular Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M);

    $('#reportModalLongTitle').html("Hepatocellular Carcinoma Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

// (Auto-increment logic removed as txt_rln_num is not present in the current layout)

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Hepatocellular Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
