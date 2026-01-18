import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/colon.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateColonStage } from './colon_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ, intramucosal carcinoma (involvement of lamina propria with no extension through muscularis mucosae)'],
    ['1', 'Tumor invades the submucosa (through the muscularis mucosa but not into the muscularis propria)'],
    ['2', 'Tumor invades the muscularis propria'],
    ['3', 'Tumor invades through the muscularis propria into pericolorectal tissues'],
    ['4', 'Tumor invades the visceral peritoneum or invades or adheres to adjacent organ or structure'],
    ['4a', 'Tumor invades through the visceral peritoneum (including gross perforation of the bowel through tumor and continuous invasion of tumor through areas of inflammation to the surface of the visceral peritoneum)'],
    ['4b', 'Tumor directly invades or adheres to adjacent organs or structures'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'One to three regional lymph nodes are positive (tumor in lymph nodes measuring ≥ 0.2 mm), or any number of tumor deposits are present and all identifiable lymph nodes are negative'],
    ['1a', 'One regional lymph node is positive'],
    ['1b', 'Two or three regional lymph nodes are positive'],
    ['1c', 'No regional lymph nodes are positive, but there are tumor deposits in the subserosa, mesentery or nonperitonealized pericolic, or perirectal/mesorectal tissues'],
    ['2', 'Four or more regional nodes are positive'],
    ['2a', 'Four to six regional lymph nodes are positive'],
    ['2b', 'Seven or more regional lymph nodes are positive'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis by imaging, etc.; no evidence of tumor in distant sites or organs (This category is not assigned by pathologists.)'],
    ['1', 'Metastasis to one or more distant sites or organs or peritoneal metastasis is identified'],
    ['1a', 'Metastasis to one site or organ is identified without peritoneal metastasis'],
    ['1b', 'Metastasis to two or more sites or organs is identified without peritoneal metastasis'],
    ['1c', 'Metastasis to the peritoneal surface is identified alone or with other site or organ metastases'],
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
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let tl_c_check = $('#cb_tl_c').is(':checked') ? "+" : " ";
    let tl_ac_check = $('#cb_tl_ac').is(':checked') ? "+" : " ";
    let tl_hf_check = $('#cb_tl_hf').is(':checked') ? "+" : " ";
    let tl_tc_check = $('#cb_tl_tc').is(':checked') ? "+" : " ";
    let tl_sf_check = $('#cb_tl_sf').is(':checked') ? "+" : " ";
    let tl_dc_check = $('#cb_tl_dc').is(':checked') ? "+" : " ";
    let tl_sc_check = $('#cb_tl_sc').is(':checked') ? "+" : " ";
    let tl_rsj_check = $('#cb_tl_rsj').is(':checked') ? "+" : " ";
    let tl_r_check = $('#cb_tl_r').is(':checked') ? "+" : " ";
    let ts_nm_check = (has_ts_nm || !$('#txt_ts_len').val()) ? "+" : " ";
    let ts_m_check = (!has_ts_nm && $('#txt_ts_len').val()) ? "+" : " ";
    let t_length = parseFloat($('#txt_ts_len').val());
    let txt_ts_len = t_length ? t_length : "___";
    report += `2. Tumor location / Size
  - Location:
    [${tl_c_check}] Cecum            [${tl_ac_check}] Ascending                [${tl_hf_check}] Hepatic flexure
    [${tl_tc_check}] Transverse       [${tl_sf_check}] Splenic flexure          [${tl_dc_check}] Descending
    [${tl_sc_check}] Sigmoid          [${tl_rsj_check}] Rectosigmoid junction    [${tl_r_check}] Rectum
  - Size:
    [${ts_nm_check}] Non-measurable
    [${ts_m_check}] Measurable: ${txt_ts_len} cm (largest diameter)

`;

    // Tumor invasion
    let has_ti_na = $('#cb_ti_na').is(':checked');
    let ti_na_check = has_ti_na ? "+" : " ";
    let ti_mp_check = $('#cb_ti_mp').is(':checked') ? "+" : " ";
    let ti_pt_check = $('#cb_ti_pt').is(':checked') ? "+" : " ";
    let ti_vp_check = $('#cb_ti_vp').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    (${ti_na_check}) Tx: Tumor cannot be visualized in this imaging study
    (${ti_mp_check}) T2: Colonic or rectal wall
    (${ti_pt_check}) T3: Invades non-peritonealized pericolonic or perirectal tissues
    (${ti_vp_check}) T4a: Penetrates to the surface of the visceral peritoneum
    (${ti_others_check}) T4b: Adjacent organs: ${txt_ti_others}

`;

    // Calculate T staging via Logic
    const data = {
        isNotVisualized: has_ti_na,
        isNonMeasurable: has_ts_nm,
        tumorSize: t_length,
        invasion: {
            t4b: $('#cb_ti_others').is(':checked'),
            t4a: $('#cb_ti_vp').is(':checked'),
            t3: $('#cb_ti_pt').is(':checked'),
            t2: $('#cb_ti_mp').is(':checked')
        },
        nodesCount: ($('.cb_rn:checked').length && $('#txt_rln_num').val() > 0) ? parseInt($('#txt_rln_num').val()) : 0,
        metastasis: {
            m1c: $('.cb_dm_m1c:checked').length > 0,
            m1abCount: $('.cb_dm_m1ab:checked').length
        }
    };

    const stageResult = calculateColonStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    let rn_pc_check = $('#cb_rn_pc').is(':checked') ? "+" : " ";
    let rn_sr_check = $('#cb_rn_sr').is(':checked') ? "+" : " ";
    let rn_ic_check = $('#cb_rn_ic').is(':checked') ? "+" : " ";
    let rn_rc_check = $('#cb_rn_rc').is(':checked') ? "+" : " ";
    let rn_mc_check = $('#cb_rn_mc').is(':checked') ? "+" : " ";
    let rn_lc_check = $('#cb_rn_lc').is(':checked') ? "+" : " ";
    let rn_sma_check = $('#cb_rn_sma').is(':checked') ? "+" : " ";
    let rn_ima_check = $('#cb_rn_ima').is(':checked') ? "+" : " ";
    let rn_ril_check = $('#cb_rn_ril').is(':checked') ? "+" : " ";
    let rn_lil_check = $('#cb_rn_lil').is(':checked') ? "+" : " ";
    report += "4. Regional nodal metastasis\n";
    report += "    [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_rln ? "+" : " ") + "] Yes, if yes, number of suspicious lymph node: " + rln_num + ", and locations:";
    report += `
        [${rn_pc_check}] Pericolic/perirectal         [${rn_sr_check}] Superior rectal          [${rn_ic_check}] Ileocolic
        [${rn_rc_check}] Right colic                  [${rn_mc_check}] Middle colic             [${rn_lc_check}] Left colic
        [${rn_sma_check}] Superior mesenteric artery   [${rn_ima_check}] Inferior mesenteric artery
        [${rn_ril_check}] Right internal iliac         [${rn_lil_check}] Left internal iliac

`;

    // calculate N stage (Calculated via Logic)

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "    [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_dm ? "+" : " ") + "] Yes, location(s): ";
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
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Colorectal Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Colorectal Cancer Staging Form");
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
    ajccTitleHtml: "AJCC Definitions for Colorectal Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
