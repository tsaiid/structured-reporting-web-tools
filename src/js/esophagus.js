import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/esophagus.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateEsophagusStage } from './esophagus_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor invades the lamina propria, muscularis mucosae, or submucosa'],
    ['1a', 'Tumor invades the lamina propria or muscularis mucosae'],
    ['1b', 'Tumor invades the submucosa'],
    ['2', 'Tumor invades the muscularis propria'],
    ['3', 'Tumor invades adventitia'],
    ['4', 'Tumor invades adjacent structures'],
    ['4a', 'Tumor invades the pleura, pericardium, azygos vein, diaphragm, or peritoneum'],
    ['4b', 'Tumor invades other adjacent structures, such as the aorta, vertebral body, or airway'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in one or two regional lymph nodes'],
    ['2', 'Metastasis in three to six regional lymph nodes'],
    ['3', 'Metastasis in seven or more regional lymph nodes'],
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
  - Location:
`;
    $('.cb_tl').each(function(){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });

    // Tumor size
    report += "  - Size:";
    let has_no_measurable_tumor = $('#cb_ts_nm').is(':checked') || !$('#txt_ts_len').val() || !$('#txt_ts_thick').val();
    if (has_no_measurable_tumor) {
        report += `
    [+] Non-measurable
    [ ] Measurable: Length: ___ cm, Max thickness: ___ cm`;
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        let t_thick = parseFloat($('#txt_ts_thick').val());
        report += `
    [ ] Non-measurable
    [+] Measurable: Length: ${t_length} cm, Max thickness: ${t_thick} cm`;
    }
    report += "\n\n";

    // Tumor invasion
    let has_inv = $('.cb_ti:checked').length > 0;
    let ti_no_check = !has_inv ? "+" : " ";
    let ti_yes_check = has_inv ? "+" : " ";
    let ti_mp_check = $('#cb_ti_mp').is(':checked') ? "+" : " ";
    let ti_ad_check = $('#cb_ti_ad').is(':checked') ? "+" : " ";
    let ti_pl_check = $('#cb_ti_pl').is(':checked') ? "+" : " ";
    let ti_pc_check = $('#cb_ti_pc').is(':checked') ? "+" : " ";
    let ti_av_check = $('#cb_ti_av').is(':checked') ? "+" : " ";
    let ti_di_check = $('#cb_ti_di').is(':checked') ? "+" : " ";
    let ti_pt_check = $('#cb_ti_pt').is(':checked') ? "+" : " ";
    let ti_aw_check = $('#cb_ti_aw').is(':checked') ? "+" : " ";
    let ti_car_check = $('#cb_ti_car').is(':checked') ? "+" : " ";
    let ti_law_check = $('#cb_ti_law').is(':checked') ? "+" : " ";
    let ti_vb_check = $('#cb_ti_vb').is(':checked') ? "+" : " ";
    let ti_pwot_check = $('#cb_ti_pwot').is(':checked') ? "+" : " ";
    let ti_pwomb_check = $('#cb_ti_pwomb').is(':checked') ? "+" : " ";
    let ti_s_check = $('#cb_ti_s').is(':checked') ? "+" : " ";
    report += `3. Tumor invasion
    [${ti_no_check}] No or Equivocal
    [${ti_yes_check}] Yes, if yes:
        [${ti_mp_check}] Esophageal muscularis propria    [${ti_ad_check}] Esophageal adventitia    [${ti_pl_check}] Pleura
        [${ti_pc_check}] Pericardium                      [${ti_av_check}] Azygos vein              [${ti_di_check}] Diaphragm
        [${ti_pt_check}] Peritoneum                       [${ti_aw_check}] Aortic wall              [${ti_car_check}] Carina
        [${ti_law_check}] Left atrial wall                 [${ti_vb_check}] Vertebral body           [${ti_pwot_check}] Posterior wall of trachea
        [${ti_pwomb_check}] Posterior wall of main bronchus  [${ti_s_check}] Stomach

`;

    // Calculate staging via logic
    const data = {
        hasInvasion: has_inv,
        hasNoMeasurableTumor: has_no_measurable_tumor,
        invasion: {
            t4b: $('.cb_ti_t4b:checked').length > 0,
            t4a: $('.cb_ti_t4a:checked').length > 0,
            t3: $('.cb_ti_t3:checked').length > 0,
            t2: $('.cb_ti_t2:checked').length > 0
        },
        nodesCount: ($('.cb_rn:checked').length && $('#txt_rln_num').val() > 0) ? parseInt($('#txt_rln_num').val()) : 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculateEsophagusStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    report += "4. Regional nodal metastasis\n";
    report += "    [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_rln ? "+" : " ") + "] Yes, if yes, number of suspicious lymph node: " + rln_num + ", and locations:";

    let rn_rlc_check = $('#cb_rn_rlc').is(':checked') ? "+" : " ";
    let rn_llc_check = $('#cb_rn_llc').is(':checked') ? "+" : " ";
    let rn_rup_check = $('#cb_rn_rup').is(':checked') ? "+" : " ";
    let rn_lup_check = $('#cb_rn_lup').is(':checked') ? "+" : " ";
    let rn_rlp_check = $('#cb_rn_rlp').is(':checked') ? "+" : " ";
    let rn_llp_check = $('#cb_rn_llp').is(':checked') ? "+" : " ";
    let rn_utpe_check = $('#cb_rn_utpe').is(':checked') ? "+" : " ";
    let rn_mtpe_check = $('#cb_rn_mtpe').is(':checked') ? "+" : " ";
    let rn_ltpe_check = $('#cb_rn_ltpe').is(':checked') ? "+" : " ";
    let rn_rpl_check = $('#cb_rn_rpl').is(':checked') ? "+" : " ";
    let rn_lpl_check = $('#cb_rn_lpl').is(':checked') ? "+" : " ";
    let rn_sca_check = $('#cb_rn_sca').is(':checked') ? "+" : " ";
    let rn_di_check = $('#cb_rn_di').is(':checked') ? "+" : " ";
    let rn_pc_check = $('#cb_rn_pc').is(':checked') ? "+" : " ";
    let rn_lga_check = $('#cb_rn_lga').is(':checked') ? "+" : " ";
    let rn_cha_check = $('#cb_rn_cha').is(':checked') ? "+" : " ";
    let rn_sa_check = $('#cb_rn_sa').is(':checked') ? "+" : " ";
    let rn_c_check = $('#cb_rn_c').is(':checked') ? "+" : " ";
    let rn_others_check = $('#cb_rn_others').is(':checked') ? "+" : " ";
    let txt_rn_others = $('#txt_rn_others').val() ? $('#txt_rn_others').val() : "___";
    report += `
        Lower cervical          [${rn_rlc_check}] Right    [${rn_llc_check}] Left
        Upper paratracheal      [${rn_rup_check}] Right    [${rn_lup_check}] Left
        Lower paratracheal      [${rn_rlp_check}] Right    [${rn_llp_check}] Left
        Thoracic paraesophageal [${rn_utpe_check}] Upper    [${rn_mtpe_check}] Middle   [${rn_ltpe_check}] Lower
        Pulmonary ligament      [${rn_rpl_check}] Right    [${rn_lpl_check}] Left
        [${rn_sca_check}] Subcarinal       [${rn_di_check}] Diaphragmatic    [${rn_pc_check}] Paracardial  [${rn_lga_check}] Left gastric
        [${rn_cha_check}] Common hepatic   [${rn_sa_check}] Splenic          [${rn_c_check}] Celiac       [${rn_others_check}] Others: ${txt_rn_others}

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
    report += ajcc_template_with_parent("Esophageal Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Esophageal Cancer Staging Form");
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
    ajccTitleHtml: "AJCC Definitions for Esophageal Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
