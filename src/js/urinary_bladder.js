import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/urinary_bladder.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateUrinaryBladderStage } from './urinary_bladder_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['a', 'Non-invasive papillary carcinoma'],
    ['is', 'Urothelial carcinoma in situ: "flat tumor"'],
    ['1', 'Tumor invades lamina propria (subepithelial connective tissue)'],
    ['2', 'Tumor invades muscularis propria'],
    ['3', 'Tumor invades perivesical soft tissue'],
    ['4', 'Extravesical tumor directly invades any of the following: prostatic stroma, seminal vesicles, uterus, vagina, pelvic wall, abdominal wall'],
    ['4a', 'Extravesical tumor directly invades into prostatic stroma, uterus, vagina'],
    ['4b', 'Extravesical tumor invades pelvic wall, abdominal wall'],
]);
const AJCC_N = new Map([
    ['x', 'Lymph nodes cannot be assessed'],
    ['0', 'No lymph node metastasis'],
    ['1', 'Single regional lymph node metastasis in the true pelvis (perivesical, obturator, internal and external iliac, or sacral lymph node)'],
    ['2', 'Multiple regional lymph node metastases in the true pelvis (perivesical, obturator, internal and external iliac, or sacral lymph node metastasis)'],
    ['3', 'Lymph node metastasis to the common iliac lymph nodes'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
    ['1a', 'Distant metastasis limited to lymph nodes beyond the common iliacs'],
    ['1b', 'Non-lymph-node distant metastases'],
]);

function generate_report(){
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `[+] CT scan  [ ] MRI`;
    } else {
        report += `[ ] CT scan  [+] MRI`;
    }
    report += "\n\n";

    // Tumor size
    let has_tl_na = $('#cb_tl_na').is(':checked');
    let cb_tn_s_check = $('#cb_tn_s').is(':checked') ? "+" : " ";
    let cb_tn_m_check = $('#cb_tn_m').is(':checked') ? "+" : " ";
    let cb_tl_na_check = has_tl_na ? "+" : " ";
    let cb_tl_pwt_check = $('#cb_tl_pwt').is(':checked') ? "+" : " ";
    let cb_tl_rlw_check = $('#cb_tl_rlw').is(':checked') ? "+" : " ";
    let cb_tl_llw_check = $('#cb_tl_llw').is(':checked') ? "+" : " ";
    let cb_tl_aw_check = $('#cb_tl_aw').is(':checked') ? "+" : " ";
    let cb_tl_dsw_check = $('#cb_tl_dsw').is(':checked') ? "+" : " ";
    let cb_tl_iwn_check = $('#cb_tl_iwn').is(':checked') ? "+" : " ";
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let t_length = parseFloat($('#txt_ts_len').val());
    let cb_ts_nm_check = has_ts_nm ? "+" : " ";
    let cb_ts_m_check = !has_ts_nm && t_length ? "+" : " ";
    let txt_ts_len = t_length ? t_length : "___";
    let cb_tl_l_pwt_check = $('#cb_tl_l_pwt').is(':checked') ? "+" : " ";
    let cb_tl_l_rlw_check = $('#cb_tl_l_rlw').is(':checked') ? "+" : " ";
    let cb_tl_l_llw_check = $('#cb_tl_l_llw').is(':checked') ? "+" : " ";
    let cb_tl_l_aw_check = $('#cb_tl_l_aw').is(':checked') ? "+" : " ";
    let cb_tl_l_dsw_check = $('#cb_tl_l_dsw').is(':checked') ? "+" : " ";
    let cb_tl_l_iwn_check = $('#cb_tl_l_iwn').is(':checked') ? "+" : " ";
    report += `2. Tumor location / size
    Tumor number: [${cb_tn_s_check}] Solitary   [${cb_tn_m_check}] Multiple
    Locations at the urinary bladder:
        [${cb_tl_na_check}] Not assessable
        At [${cb_tl_pwt_check}] Posterior wall or Trigone  [${cb_tl_rlw_check}] Right lateral wall  [${cb_tl_llw_check}] Left lateral wall
           [${cb_tl_aw_check}] Anterior wall  [${cb_tl_dsw_check}] Dome or Superior wall  [${cb_tl_iwn_check}] Inferior wall or Neck
    Largest tumor size:
        [${cb_ts_nm_check}] Non-measurable
        [${cb_ts_m_check}] Measurable: ${txt_ts_len} cm (greatest dimension of the largest tumor)
        At [${cb_tl_l_pwt_check}] Posterior wall or Trigone  [${cb_tl_l_rlw_check}] Right lateral wall  [${cb_tl_l_llw_check}] Left lateral wall
           [${cb_tl_l_aw_check}] Anterior wall  [${cb_tl_l_dsw_check}] Dome or Superior wall  [${cb_tl_l_iwn_check}] Inferior wall or Neck

`;

    // Tumor invasion
    let has_ti_na = $('#cb_ti_na').is(':checked');
    let cb_ti_na_check = has_ti_na ? "+" : " ";
    let cb_ti_no_check = !$('.cb_ti:checked').length ? "+" : " ";
    let cb_ti_mp_check = $('#cb_ti_mp').is(':checked') ? "+" : " ";
    let cb_ti_pvt_check = $('#cb_ti_pvt').is(':checked') ? "+" : " ";
    let cb_ti_t4_check = $('.cb_ti_t4:checked').length > 0 ? "+" : " ";
    let cb_ti_p_check = $('#cb_ti_p').is(':checked') ? "+" : " ";
    let cb_ti_sv_check = $('#cb_ti_sv').is(':checked') ? "+" : " ";
    let cb_ti_u_check = $('#cb_ti_u').is(':checked') ? "+" : " ";
    let cb_ti_v_check = $('#cb_ti_v').is(':checked') ? "+" : " ";
    let cb_ti_pw_check = $('#cb_ti_pw').is(':checked') ? "+" : " ";
    let cb_ti_aw_check = $('#cb_ti_aw').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    [${cb_ti_na_check}] Not assessable
    [${cb_ti_no_check}] No or Equivocal
    [${cb_ti_mp_check}] Tumor invasion of deep muscle
    [${cb_ti_pvt_check}] Gross tumor invasion of perivesical tissue
    [${cb_ti_t4_check}] Tumor invasion to adjacent organs:
        For male: [${cb_ti_p_check}] Prostate   [${cb_ti_sv_check}] Seminal vesicles
        For female: [${cb_ti_u_check}] Uterus   [${cb_ti_v_check}] Vagina
    [${cb_ti_pw_check}] Pelvic wall
    [${cb_ti_aw_check}] Abdominal wall
    [${ti_others_check}] Others: ${txt_ti_others}

`;
    // Calculate staging via Logic
    const data = {
        isNotAssessable: has_tl_na,
        isNonMeasurable: has_ts_nm,
        isTInvasionNotAssessable: has_ti_na,
        invasion: {
            t4b: $('.cb_ti_t4b:checked').length > 0,
            t4a: $('.cb_ti_t4a:checked').length > 0,
            t3: $('.cb_ti_t3:checked').length > 0,
            t2: $('.cb_ti_t2:checked').length > 0
        },
        nodes: {
            hasNodes: $('.cb_rn:checked').length > 0,
            hasCommonIliacNodes: $('.cb_rn_n3:checked').length > 0,
            isMultipleNodes: $('#cb_rn_m').is(':checked'),
            nodesCount: ($('.cb_rn:checked').length) // count is proxy for multiple selection here
        },
        metastasis: {
            hasMetastasis: $('.cb_dm:checked').length > 0,
            isM1b: $('.cb_dm_m1b:checked').length > 0
        }
    };

    const stageResult = calculateUrinaryBladderStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let cb_rn_s_check = $('#cb_rn_s').is(':checked') ? "+" : " ";
    let cb_rn_m_check = $('#cb_rn_m').is(':checked') ? "+" : " ";
    report += "4. Regional nodal metastasis\n";
    report += "    [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_rln ? "+" : " ") + "] Yes, if yes:\n";
    report += `    Numbers: [${cb_rn_s_check}] single   [${cb_rn_m_check}] multiple\n`;
    $('.lb_rn').each(function(){
        let cb_rn = $(this).attr('for');
        if ($(this).hasClass('has_parts')) {
            let check_or_not = $('.' + cb_rn + ':checked').length > 0 ? "+" : " ";
            report += `        [${check_or_not}] ` + $(this).text() + ": ";
            let parts = $('.' + cb_rn);
            parts.each(function(i, e){
                let check_or_not = $(this).is(':checked') ? "+" : " ";
                report += `[${check_or_not}] ` + $(this).val();
                if (i !== parts.length - 1) {
                    report += "  ";
                }
            });
            report += "\n";
        } else {
            let check_or_not = $('#' + cb_rn).is(':checked') ? "+" : " ";
            report += `        [${check_or_not}] ` + $(this).text() + "\n";
        }
    });
    report += "\n";

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

        // M stage calculated via logic
    } else {
        report += "___";
    }
    report += "\n\n";

    // Other Findings
    let cb_o_hn_check = $('.cb_o_hn:checked').length > 0 ? "+" : " ";
    let cb_o_hn_r_check = $('#cb_o_hn_r').is(':checked') ? "+" : " ";
    let cb_o_hn_l_check = $('#cb_o_hn_l').is(':checked') ? "+" : " ";
    report += `6. Other findings
    [${cb_o_hn_check}] Hydronephrosis: [${cb_o_hn_r_check}] right   [${cb_o_hn_l_check}] left

`;

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Urinary Bladder Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Urinary Bladder Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('.cb_ti_t4a, input[name="radio_gender"]').change(function() {
    $(this).parent().parent().find('input[name="radio_gender"]').prop("checked", true);
    $(this).parent().parent().siblings().find('.cb_ti').prop('checked', false);
});

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
    ajccTitleHtml: "AJCC Definitions for Urinary Bladder Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
