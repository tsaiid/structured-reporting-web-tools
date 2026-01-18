import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/nasopharynx.html?raw');
}

// Nasopharynx Neck Lymph Node Helper
import '../css/nasopharynx_helper.css';
import '../image/neck_lymph_node_stations.webp';
import './nasopharynx_logic_helper.js';

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateNasopharynxStage } from './nasopharynx_logic.js';

// AJCC 9th Edition Definitions
const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor, but EBV-positive cervical node(s) involvement'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor confined to nasopharynx, OR Tumor with extension to oropharynx and/or nasal cavity without parapharyngeal involvement'],
    ['2', 'Tumor with extension to parapharyngeal space, and/or adjacent soft tissue involvement (medial pterygoid, lateral pterygoid, prevertebral muscles)'],
    ['3', 'Tumor with unequivocal infiltration into bony structures: skull base (including pterygoid structures), paranasal sinuses, cervical vertebrae'],
    ['4', 'Tumor with intracranial extension, involvement of cranial nerves, hypopharynx, orbit, parotid gland, and/or extensive soft tissue infiltration beyond the anterolateral surface of the lateral pterygoid muscle'],
]);

const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No tumor involvement of regional lymph node(s)'],
    ['1', 'Unilateral cervical lymph node(s) and/or unilateral or bilateral retropharyngeal lymph node(s), &le; 6 cm, above caudal border of cricoid cartilage, without advanced extranodal extension'],
    ['2', 'Bilateral cervical lymph nodes, &le; 6 cm, above caudal border of cricoid cartilage, without advanced extranodal extension'],
    ['3', 'Unilateral or bilateral cervical lymph node(s) > 6 cm, and/or extension below the caudal border of cricoid cartilage, and/or advanced radiologic extranodal extension with involvement of adjacent muscles, skin, and/or neurovascular bundle'],
]);

const AJCC_M = new Map([
    ['0', 'No distant metastasis'],
    ['1', 'Distant metastasis'],
    ['1a', '&le; 3 metastatic lesions in one or more organs/sites'],
    ['1b', '> 3 metastatic lesions in one or more organs/sites'],
]);

function generate_report(){
    // 1. Imaging Modality
    var report = `1. Imaging modality
  - Imaging by `;
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `(+) CT scan  ( ) MRI`;
    } else {
        report += `( ) CT scan  (+) MRI`;
    }
    report += "\n\n";

    // 2. Tumor location / size
    let t_length = parseFloat($('#txt_ts_len').val());
    let txt_ts_len = t_length ? t_length : "___";
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let has_tl = $('.cb_tl:checked').length ? true : false;
    let ts_nm_check = has_ts_nm || !has_tl ? "+" : " ";
    let ts_m_check = !has_ts_nm && has_tl && t_length > 0 ? "+" : " ";
    let tl_l_check = $('#cb_tl_l').is(':checked') ? "+" : " ";
    let tl_r_check = $('#cb_tl_r').is(':checked') ? "+" : " ";

    report += `2. Tumor location / Size
    [${ts_nm_check}] Non-measurable
    [${ts_m_check}] Measurable: Size: ${txt_ts_len} cm (largest diameter)
        Location: [${tl_l_check}] Left   [${tl_r_check}] Right

`;

    // 3. Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_yes_check = has_ti ? "+" : " ";

    // Checkbox mappings
    let ti_np_check = $('#cb_ti_np').is(':checked') ? "+" : " ";
    let ti_op_check = $('#cb_ti_op').is(':checked') ? "+" : " ";
    let ti_nc_check = $('#cb_ti_nc').is(':checked') ? "+" : " ";
    let ti_pps_check = $('#cb_ti_pps').is(':checked') ? "+" : " ";
    let ti_mpt_check = $('#cb_ti_mpt').is(':checked') ? "+" : " ";
    let ti_lpt_check = $('#cb_ti_lpt').is(':checked') ? "+" : " ";
    let ti_pvm_check = $('#cb_ti_pvm').is(':checked') ? "+" : " ";
    let ti_sb_check = $('#cb_ti_sb').is(':checked') ? "+" : " ";
    let ti_cv_check = $('#cb_ti_cv').is(':checked') ? "+" : " ";
    let ti_pb_check = $('#cb_ti_pb').is(':checked') ? "+" : " ";
    let ti_pns_check = $('.cb_ti_pns:checked').length ? "+" : " ";
    let ti_pns_e_check = $('#cb_ti_pns_e').is(':checked') ? "+" : " ";
    let ti_pns_m_check = $('#cb_ti_pns_m').is(':checked') ? "+" : " ";
    let ti_pns_f_check = $('#cb_ti_pns_f').is(':checked') ? "+" : " ";
    let ti_pns_s_check = $('#cb_ti_pns_s').is(':checked') ? "+" : " ";
    let ti_ic_check = $('#cb_ti_ic').is(':checked') ? "+" : " ";
    let ti_cn_check = $('#cb_ti_cn').is(':checked') ? "+" : " ";
    let ti_hp_check = $('#cb_ti_hp').is(':checked') ? "+" : " ";
    let ti_ob_check = $('#cb_ti_ob').is(':checked') ? "+" : " ";
    let ti_p_check = $('#cb_ti_p').is(':checked') ? "+" : " ";
    let ti_blp_check = $('#cb_ti_blp').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";

    report += `3. Tumor invasion
    [${ti_no_check}] No or Equivocal
    [${ti_yes_check}] Yes, if yes:
        T1: [${ti_np_check}] Nasopharynx               [${ti_op_check}] Oropharynx         [${ti_nc_check}] Nasal cavity
        T2: [${ti_pps_check}] Parapharyngeal space      [${ti_mpt_check}] Medial pterygoid   [${ti_lpt_check}] Lateral pterygoid
            [${ti_pvm_check}] Prevertebral muscles
        T3: [${ti_sb_check}] Skull base bone invasion  [${ti_cv_check}] Cervical vertebra  [${ti_pb_check}] Pterygoid structures
            [${ti_pns_check}] Paranasal sinus ([${ti_pns_e_check}] Ethmoid    [${ti_pns_m_check}] Maxillary    [${ti_pns_f_check}] Frontal    [${ti_pns_s_check}] Sphenoid)
        T4: [${ti_ic_check}] Intracranial              [${ti_cn_check}] Cranial nerves     [${ti_hp_check}] Hypopharynx
            [${ti_ob_check}] Orbit                     [${ti_p_check}] Parotid gland
            [${ti_blp_check}] Infiltration beyond the anterolateral surface of the lateral pterygoid muscle
            [${ti_others_check}] Others: ${txt_ti_others}

`;

    // 4. Regional nodal metastasis
    let has_rln = $('.cb_rn:not("#cb_rn_ene"):checked').length > 0; // Check LNs excluding the ENE checkbox
    let has_ene = $('#cb_rn_ene').is(':checked'); // Check if ENE is explicitly checked
    let n_length = parseFloat($('#txt_rn_len').val());
    let txt_rn_len = n_length ? n_length : "___";

    // If ENE is present, we consider RN positive even if specific locations aren't checked (though they should be)
    let is_rn_positive = has_rln || has_ene;

    report += "4. Regional nodal metastasis\n";
    report += "    [" + (is_rn_positive ? " " : "+") + "] No regional nodal metastasis\n";
    report += "    [" + (is_rn_positive ? "+" : " ") + "] Yes, if yes:\n";

    // Iterate specific locations
    $('.lb_rn').each(function(){
        let cb_rn = $(this).attr('for');
        if ($(this).hasClass('has_parts')) {
            let check_or_not = $('.' + cb_rn + ':checked').length > 0 ? "+" : " ";
            report += `        [${check_or_not}] ` + $(this).text() + ":\n            ";
            let parts = $('.' + cb_rn);
            parts.each(function(i, e){
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

    report += `        Maximal size of the largest positive node: ${txt_rn_len} cm (long axis)\n`;
    report += `        [${has_ene ? "+" : " "}] Advanced radiologic extranodal extension (involvement of adjacent muscles, skin, and/or neurovascular bundle)\n\n`;

    // 5. Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;

    report += "5. Distant metastasis\n";
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

        // M1a / M1b Logic
        let is_m1b = $('#radio_dm_m1b').is(':checked');
        let m1a_chk = !is_m1b ? "+" : " ";
        let m1b_chk = is_m1b ? "+" : " ";

        report += `\n        [${m1a_chk}] <= 3 lesions (M1a)    [${m1b_chk}] > 3 lesions (M1b)`;
    } else {
        report += "___";
    }
    report += "\n\n";

    // Calculate staging via Logic
    // 計算 N stage：
    // - cb_rn_r / cb_rn_l: 右側/左側 checkbox
    // - cb_rn_above / cb_rn_below: cricoid 上/下
    // - cb_rn_n3: below cricoid (N3 criteria)
    // - cb_rn_rp: retropharyngeal (VIIA)
    const rightChecked = $('.cb_rn_r:checked').length > 0;
    const leftChecked = $('.cb_rn_l:checked').length > 0;
    const rightNonRPChecked = $('.cb_rn_r:not(.cb_rn_rp):checked').length > 0;
    const leftNonRPChecked = $('.cb_rn_l:not(.cb_rn_rp):checked').length > 0;
    const rpOnlyChecked = $('.cb_rn_rp:checked').length > 0 && !rightNonRPChecked && !leftNonRPChecked;

    const data = {
        isNonMeasurable: has_ts_nm,
        invasion: {
            t1: $('.cb_ti_t1:checked').length > 0,
            t2: $('.cb_ti_t2:checked').length > 0,
            t3: $('.cb_ti_t3:checked').length > 0,
            t4: $('.cb_ti_t4:checked').length > 0
        },
        nodes: {
            isPositive: is_rn_positive,
            maxSize: n_length,
            hasN3Location: $('.cb_rn_n3:checked').length > 0, // below cricoid → N3
            hasENE: has_ene,
            isBilateral: rightNonRPChecked && leftNonRPChecked, // 雙側 cervical (非 RP)
            isUnilateral: (rightChecked || leftChecked) && !(rightNonRPChecked && leftNonRPChecked), // 單側
            isRPOnly: rpOnlyChecked // 僅 retropharyngeal
        },
        metastasis: {
            isPositive: has_dm,
            isMoreThan3: $('#radio_dm_m1b').is(':checked')
        }
    };

    const stageResult = calculateNasopharynxStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // 6. Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];

    // Pass '9' as the version number
    report += ajcc_template_with_parent("Nasopharyngeal Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 9);

    $('#reportModalLongTitle').html("Nasopharyngeal Carcinoma Staging Form (AJCC 9th)");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

// ... event listeners remain the same ...
$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) { }
});

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
    ajccTitleHtml: "AJCC Definitions for Nasopharyngeal Carcinoma <span class='badge badge-primary ml-2' style='font-size: 60%; vertical-align: super;'>9th</span>"
});