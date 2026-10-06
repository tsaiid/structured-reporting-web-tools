import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/oropharynx.html?raw');
}

// Oropharynx Neck Lymph Node Helper
import '../css/nasopharynx_helper.css';  // 共用 nasopharynx 的 CSS
import '../image/neck_lymph_node_stations.webp';
import './oropharynx_logic_helper.js';

import { join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage, getMaxStage } from './ajcc_common.js';
import {
    calculateOropharynxStage,
    AJCC_T_HPV,
    AJCC_T_NONHPV,
    AJCC_N_HPV,
    AJCC_N_NONHPV,
    AJCC_M
} from './oropharynx_logic.js';

function generate_report() {
    let is_hpv = $('#cb_rn_hpv').is(':checked');
    // Protocol
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `(+) CT scan  ( ) MRI`;
    } else {
        report += `( ) CT scan  (+) MRI`;
    }
    report += "\n\n";

    // Tumor location
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let has_ts_no = $('#cb_ts_no').is(':checked');
    let t_length = parseFloat($('#txt_ts_len').val());
    let txt_ts_len = t_length ? t_length : "___";
    let t_thick = parseFloat($('#txt_ts_thick').val());
    let txt_ts_thick = t_thick ? t_thick : "___";
    let has_tl = $('.cb_tl:checked').length ? true : false;
    let ts_nm_check = has_ts_nm ? "+" : " ";
    let ts_no_check = has_ts_no ? "+" : " ";
    let tl_bt_check = $('#cb_tl_bt').is(':checked') ? "+" : " ";
    let tl_tf_check = $('#cb_tl_tf').is(':checked') ? "+" : " ";
    let tl_sp_check = $('#cb_tl_sp').is(':checked') ? "+" : " ";
    let tl_ow_check = $('#cb_tl_ow').is(':checked') ? "+" : " ";
    let tl_others_check = $('#cb_tl_others').is(':checked') ? "+" : " ";
    let txt_tl_others = $('#txt_tl_others').val() ? $('#txt_tl_others').val() : "___";
    let tl_r_check = $('#cb_tl_r').is(':checked') ? "+" : " ";
    let tl_l_check = $('#cb_tl_l').is(':checked') ? "+" : " ";
    report += `2. Tumor location / Size
    [${ts_nm_check}] Not assessable
    [${ts_no_check}] No evidence of primary tumor
    Size: ${txt_ts_len} cm (largest diameter)
    Tumor thickness: ${txt_ts_thick} cm
    Tumor location:
        [${tl_r_check}] Right                [${tl_l_check}] Left
        [${tl_bt_check}] Base of the tongue   [${tl_tf_check}] Tonsillar fossa
        [${tl_sp_check}] Soft palate          [${tl_ow_check}] Oropharyngeal walls
        [${tl_others_check}] Others: ${txt_tl_others}

`;

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_else_check = $('#cb_ti_else').is(':checked') ? "+" : " ";
    let ti_l_check = $('#cb_ti_l').is(':checked') ? "+" : " ";
    let ti_emt_check = $('#cb_ti_emt').is(':checked') ? "+" : " ";
    let ti_mpm_check = $('#cb_ti_mpm').is(':checked') ? "+" : " ";
    let ti_hp_check = $('#cb_ti_hp').is(':checked') ? "+" : " ";
    let ti_m_check = $('#cb_ti_m').is(':checked') ? "+" : " ";
    let ti_lpm_check = $('#cb_ti_lpm').is(':checked') ? "+" : " ";
    let ti_pp_check = $('#cb_ti_pp').is(':checked') ? "+" : " ";
    let ti_lnp_check = $('#cb_ti_lnp').is(':checked') ? "+" : " ";
    let ti_sb_check = $('#cb_ti_sb').is(':checked') ? "+" : " ";
    let ti_eca_check = $('#cb_ti_eca').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    [${ti_no_check}] No regional invasion
    T3:  [${ti_else_check}] Extension to lingual surface of epiglottis
    T4a: [${ti_l_check}] Larynx        [${ti_emt_check}] Extrinsic muscle of tongue   [${ti_mpm_check}] Medial pterygoid muscle
         [${ti_hp_check}] Hard palate   [${ti_m_check}] Mandible
    T4b: [${ti_lpm_check}] Lateral pterygoid muscle   [${ti_pp_check}] Pterygoid plates   [${ti_lnp_check}] Lateral nasopharynx
         [${ti_sb_check}] Skull base                 [${ti_eca_check}] Encasement of carotid artery
         [${ti_others_check}] Others: ${txt_ti_others}

`;


    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let n_length = parseFloat($('#txt_rn_len').val());
    let txt_rn_len = n_length ? n_length : "___";
    let has_ene = $('#cb_rn_ene').is(':checked');
    let has_sin = $('#cb_rn_sin').is(':checked');
    let rn_ene_check = has_ene ? "+" : " ";
    let rn_hpv_check = is_hpv ? "+" : " ";
    let rn_sin_check = has_sin ? "+" : " ";
    report += "4. Regional nodal metastasis\n";
    report += "    [" + (has_rln ? " " : "+") + "] No regional nodal metastasis\n";
    report += "    [" + (has_rln ? "+" : " ") + "] Yes, if yes:\n";
    $('.lb_rn').each(function () {
        let cb_rn = $(this).attr('for');
        if ($(this).hasClass('has_parts')) {
            let check_or_not = $('.' + cb_rn + ':checked').length > 0 ? "+" : " ";
            report += `        [${check_or_not}] ` + $(this).text() + ":\n            ";
            let parts = $('.' + cb_rn);
            parts.each(function (i, e) {
                if (i && !(i % 7)) {
                    report += "\n            ";
                }
                let check_or_not = $(this).is(':checked') ? "+" : " ";
                report += `[${check_or_not}] ` + $(this).val();
                if (i !== parts.length - 1) {
                    report += "  ";
                }
            });
            report += "\n";
        } else {
            let check_or_not = $('#' + cb_rn).is(':checked') ? "+" : " ";
            report += `    [${check_or_not}] ` + $(this).text() + "\n";
        }
    });
    report += `        Maximal size of the largest positive node: ${txt_rn_len} cm (long axis)
        [${rn_ene_check}] Extranodal extension (ENE)
        [${rn_hpv_check}] HPV-mediated (p16+)
        [${rn_sin_check}] Single lymphadenopathy

`;

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
    } else {
        report += "___";
    }
    report += "\n\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    const staging = calculateOropharynxStage({
        isHpv: is_hpv,
        isNotAssessable: has_ts_nm,
        isNoEvidence: has_ts_no,
        hasTumorLocation: has_tl,
        tumorSize: t_length,
        invasion: {
            t3: $('.cb_ti_t3:checked').length > 0,
            t4: $('.cb_ti_t4:checked').length > 0,
            t4a: $('.cb_ti_t4a:checked').length > 0,
            t4b: $('.cb_ti_t4b:checked').length > 0
        },
        nodes: {
            hasNodes: has_rln,
            hasRightNodes: $('.cb_rn_r:checked').length > 0,
            hasLeftNodes: $('.cb_rn_l:checked').length > 0,
            isEne: has_ene,
            size: n_length,
            isSingle: has_sin
        },
        tumorSide: {
            isRight: $('#cb_tl_r').is(':checked'),
            isLeft: $('#cb_tl_l').is(':checked')
        },
        hasMetastasis: has_dm
    });

    let t = getMaxStage(staging.t);
    let n = getMaxStage(staging.n);
    let m = getMaxStage(staging.m);
    let FORM_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Cancer Staging Form" : "Oropharyngeal Cancer (p16-) Staging Form");
    let AJCC_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Carcinoma" : "Oropharyngeal Carcinoma (p16-)");
    let AJCC_T = (is_hpv ? AJCC_T_HPV : AJCC_T_NONHPV);
    let AJCC_N = (is_hpv ? AJCC_N_HPV : AJCC_N_NONHPV);
    report += ajcc_template_with_parent(AJCC_TITLE, t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html(FORM_TITLE);
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

// auto- increase or decrease lymph node numbers
$('.cb_rn').change(function () {
    let rln_num = +$('#txt_rln_num').val();
    if (this.checked) {
        $('#txt_rln_num').val(rln_num + 1);
    } else {
        if (rln_num > 0) {
            $('#txt_rln_num').val(rln_num - 1);
        }
    }
});

let is_hpv_initial = $('#cb_rn_hpv').is(':checked');
let AJCC_TITLE_INIT = (is_hpv_initial ? "HPV-Mediated Oropharyngeal Carcinoma" : "Oropharyngeal Carcinoma (p16-)");

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: (is_hpv_initial ? AJCC_T_HPV : AJCC_T_NONHPV),
        N: (is_hpv_initial ? AJCC_N_HPV : AJCC_N_NONHPV),
        M: AJCC_M
    },
    ajccTitleHtml: `AJCC Definitions for ${AJCC_TITLE_INIT} <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>`
});

$('#ajccModalLong').on('show.bs.modal', function () {
    $('body > *:not(#ajccModalLong)').attr('inert', 'true'); // 禁用背景內容
});


$('#ajccModalLong').on('hidden.bs.modal', function () {
    $('body > *:not(#ajccModalLong)').removeAttr('inert'); // 恢復互動
});

$('#cb_rn_hpv').change(function () {
    let is_hpv = $(this).is(':checked');
    let AJCC_T = (is_hpv ? AJCC_T_HPV : AJCC_T_NONHPV);
    let AJCC_N = (is_hpv ? AJCC_N_HPV : AJCC_N_NONHPV);

    let AJCC_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Carcinoma" : "Oropharyngeal Carcinoma (p16-)");
    let ajccTitleHtml = `AJCC Definitions for ${AJCC_TITLE} <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>`;

    let ajcc_table = generate_ajcc_table(AJCC_T, AJCC_N, AJCC_M);
    $('#ajccModalLongTitle').html(ajccTitleHtml);
    $('#ajccModalBody').html(ajcc_table);
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
