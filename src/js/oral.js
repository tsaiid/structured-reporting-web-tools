import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/oral.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateOralStage } from './oral_logic.js';

const AJCC_T_LIP = new Map([
    ['x', 'Primary tumor cannot be assessed.'],
    ['0', 'No evidence of primary tumor.'],
    ['is', 'Tumor in situ.'],
    ['1', 'Tumor ≤ 2 cm in greatest dimension.'],
    ['2', 'Tumor > 2 cm but ≤ 4 cm in greatest dimension.'],
    ['3', 'Tumor > 4 cm in greatest dimension.'],
    ['4', 'Moderately advanced local disease.'],
    ['4a', 'Tumor invades through cortical bone or involves the inferior alveolar nerve, floor of mouth, or skin of face (i.e., chin or nose).'],
    ['4b', 'Very advanced local disease: Tumor invades lateral pterygoid muscle, pterygoid plates, lateral nasopharynx, or skull base or encases carotid artery.'],
]);
const AJCC_T_ORAL = new Map([
    ['x', 'Primary tumor cannot be assessed.'],
    ['0', 'No evidence of primary tumor.'],
    ['is', 'Tumor in situ.'],
    ['1', 'Tumor ≤ 2 cm in greatest dimension.'],
    ['2', 'Tumor > 2 cm but ≤ 4 cm in greatest dimension.'],
    ['3', 'Tumor > 4 cm in greatest dimension.'],
    ['4', 'Moderately advanced local disease.'],
    ['4a', 'Tumor invades adjacent structures only (e.g., through cortical bone [mandible or maxilla] into deep [extrinsic] muscle of tongue [genioglossus, hyoglossus, palatoglossus, and styloglossus], maxillary sinus, skin of face).'],
    ['4b', 'Very advanced local disease: Tumor invades lateral pterygoid muscle, pterygoid plates, lateral nasopharynx, or skull base or encases carotid artery.'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed.'],
    ['0', 'No regional lymph node metastasis.'],
    ['1', 'Metastasis in a single ipsilateral lymph node, ≤ 3 cm in greatest dimension and ENE(-).'],
    ['2', 'Metastasis in a single ipsilateral lymph node, > 3 cm but ≤ 6 cm in greatest dimension and ENE(-); or in bilateral or contralateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).'],
    ['2a', 'Metastasis in a single ipsilateral lymph node > 3 cm but ≤ 6 cm in greatest dimension and ENE(-).'],
    ['2b', 'Metastasis in multiple ipsilateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).'],
    ['2c', 'Metastasis in bilateral or contralateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).'],
    ['3', 'Metastasis in a lymph node > 6 cm in greatest dimension and ENE(-) or metastasis in any node(s) and clinically overt ENE(+).'],
    ['3a', 'Metastasis in a lymph node >6 cm in greatest dimension and ENE(-).'],
    ['3b', 'Metastasis in any node(s) and clinically overt ENE(+).'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study).'],
    ['1', 'Distant metastasis.'],
]);

function generate_report(){
    // Protocol
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `[+] CT scan  [ ] MRI`;
    } else {
        report += `[ ] CT scan  [+] MRI`;
    }
    report += "\n\n";

    // Tumor location
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let has_ts_no = $('#cb_ts_no').is(':checked');
    let t_length = parseFloat($('#txt_ts_len').val());
    let txt_ts_len = t_length ? t_length : "___";
    let has_tl = $('.cb_tl:checked').length ? true : false;
    let ts_nm_check = has_ts_nm ? "+" : " ";
    let ts_no_check = has_ts_no ? "+" : " ";
    let has_tl_r = $('#cb_tl_r').is(':checked')
    let has_tl_l = $('#cb_tl_l').is(':checked')
    let tl_r_check = has_tl_r && !has_tl_l ? "+" : " ";
    let tl_l_check = has_tl_l && !has_tl_r ? "+" : " ";
    let tl_b_check = has_tl_l && has_tl_r ? "+" : " ";
    let tl_ul_check = $('#cb_tl_ul').is(':checked') ? "+" : " ";
    let tl_ll_check = $('#cb_tl_ll').is(':checked') ? "+" : " ";
    let tl_ugm_check = $('#cb_tl_ugm').is(':checked') ? "+" : " ";
    let tl_lgm_check = $('#cb_tl_lgm').is(':checked') ? "+" : " ";
    let tl_hp_check = $('#cb_tl_hp').is(':checked') ? "+" : " ";
    let tl_ot_check = $('#cb_tl_ot').is(':checked') ? "+" : " ";
    let tl_mf_check = $('#cb_tl_mf').is(':checked') ? "+" : " ";
    let tl_rt_check = $('#cb_tl_rt').is(':checked') ? "+" : " ";
    let tl_others_check = $('#cb_tl_others').is(':checked') ? "+" : " ";
    let txt_tl_others = $('#txt_tl_others').val() ? $('#txt_tl_others').val() : "___";
    report += `2. Tumor location / Size
    [${ts_nm_check}] Not assessable
    [${ts_no_check}] No evidence of primary tumor
    Size: ${txt_ts_len} cm (largest diameter)
    Laterality: [${tl_l_check}] Left   [${tl_r_check}] Right   [${tl_b_check}] Bilateral
    Tumor location:
        [${tl_ul_check}] Upper Lip                    [${tl_ll_check}] Lower Lip           [${tl_ugm_check}] Upper gingivobuccal mucosa
        [${tl_lgm_check}] Lower gingivobuccal mucosa   [${tl_hp_check}] Hard palate         [${tl_ot_check}] Oral tongue
        [${tl_mf_check}] Mouth floor                  [${tl_rt_check}] Retromolar trigone
        [${tl_others_check}] Others: ${txt_tl_others}

`;

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_l_check = $('#cb_ti_l').is(':checked') ? "+" : " ";
    let ti_ltcb_check = $('#cb_ti_ltcb').is(':checked') ? "+" : " ";
    let ti_lian_check = $('#cb_ti_lian').is(':checked') ? "+" : " ";
    let ti_lfom_check = $('#cb_ti_lfom').is(':checked') ? "+" : " ";
    let ti_lsof_check = $('#cb_ti_lsof').is(':checked') ? "+" : " ";
    let ti_otcb_check = $('#cb_ti_otcb').is(':checked') ? "+" : " ";
    let ti_oemt_check = $('#cb_ti_oemt').is(':checked') ? "+" : " ";
    let ti_oms_check = $('#cb_ti_oms').is(':checked') ? "+" : " ";
    let ti_osof_check = $('#cb_ti_osof').is(':checked') ? "+" : " ";
    let ti_ms_check = $('#cb_ti_ms').is(':checked') ? "+" : " ";
    let ti_pp_check = $('#cb_ti_pp').is(':checked') ? "+" : " ";
    let ti_sb_check = $('#cb_ti_sb').is(':checked') ? "+" : " ";
    let ti_eca_check = $('#cb_ti_eca').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    [${ti_no_check}] No regional invasion
    T4a (lip): [${ti_ltcb_check}] Through cortical bone   [${ti_lian_check}] Inferior alveolar nerve
               [${ti_lfom_check}] Floor of mouth          [${ti_lsof_check}] Skin of face
    T4a (oral cavity): [${ti_otcb_check}] Through cortical bone [mandible or maxilla]
                       [${ti_oemt_check}] Extrinsic muscle of tongue   [${ti_oms_check}] Maxillary sinus   [${ti_osof_check}] Skin of face
    T4b: [${ti_ms_check}] Masticator space   [${ti_pp_check}] Pterygoid plates    [${ti_sb_check}] Skull base
         [${ti_eca_check}] Encase internal carotid artery             [${ti_others_check}] Others: ${txt_ti_others}

`;

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let n_length = parseFloat($('#txt_rn_len').val());
    let txt_rn_len = n_length ? n_length : "___";
    let has_ene = $('#cb_rn_ene').is(':checked');
    let has_sin = $('#cb_rn_sin').is(':checked');
    let rn_ene_check = has_ene ? "+" : " ";
    let rn_sin_check = has_sin ? "+" : " ";
    report += "4. Regional nodal metastasis\n";
    report += "    [" + (has_rln ? " " : "+") + "] No regional nodal metastasis\n";
    report += "    [" + (has_rln ? "+" : " ") + "] Yes, if yes:\n";
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
    report += `        Maximal size of the largest positive node: ${txt_rn_len} cm (long axis)
        [${rn_ene_check}] Extranodal extension (ENE)
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

    // Calculate staging via Logic
    const data = {
        tumorSize: t_length,
        isNotAssessable: has_ts_nm,
        isNoEvidence: has_ts_no,
        hasTumorLocation: has_tl,
        isLip: $('.cb_tl_l:checked').length > 0,
        isOral: $('.cb_tl_o:checked').length > 0,
        invasion: {
            lipT4a: $('.cb_ti_lip.cb_ti_t4a:checked').length > 0,
            oralT4a: $('.cb_ti_oral.cb_ti_t4a:checked').length > 0,
            t4b: $('.cb_ti_t4b:checked').length > 0
        },
        nodes: {
            hasNodes: has_rln,
            nodeSize: n_length,
            hasENE: has_ene,
            isSingleNode: has_sin,
            isBilateralOrContralateral: (
                ($('.cb_rn_r:checked').length && $('.cb_rn_l:checked').length) ||
                ($('#cb_tl_r').is(':checked') && $('.cb_rn_l:checked').length) ||
                ($('#cb_tl_l').is(':checked') && $('.cb_rn_r:checked').length)
            )
        },
        hasMetastasis: has_dm
    };

    const stageResult = calculateOralStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let AJCC_T = (data.isLip ? AJCC_T_LIP : AJCC_T_ORAL );
    report += ajcc_template_with_parent("Oral Cavity Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Oral Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
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

let has_lip_initial = $('.cb_tl_l:checked').length > 0;
setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: (has_lip_initial ? AJCC_T_LIP : AJCC_T_ORAL),
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Oral Cavity Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
