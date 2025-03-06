import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/oropharynx.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';

const AJCC_T_HPV = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No primary identified'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor 2 cm or smaller in greatest dimension'],
    ['2', 'Tumor larger than 2 cm but not larger than 4 cm in greatest dimension'],
    ['3', 'Tumor larger than 4 cm in greatest dimension or extension to lingual surface of epiglottis'],
    ['4', 'Moderately advanced or very advanced local disease; Tumor invades the larynx, extrinsic muscle of tongue, medial pterygoid, hard palate, or mandible or beyond (* Mucosal extension to lingual surface of epiglottis from primary tumors of the base of the tongue and vallecula does not constitute invasion of the larynx.)'],
]);
const AJCC_T_NONHPV = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No primary identified'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor 2 cm or smaller in greatest dimension'],
    ['2', 'Tumor larger than 2 cm but not larger than 4 cm in greatest dimension'],
    ['3', 'Tumor larger than 4 cm in greatest dimension or extension to lingual surface of epiglottis'],
    ['4', 'Moderately advanced or very advanced local disease'],
    ['4a', 'Moderately advanced local disease: Tumor invades the larynx, extrinsic muscle of tongue, medial pterygoid, hard palate, or mandible'],
    ['4b', 'Very advanced local disease: Tumor invades lateral pterygoid muscle, pterygoid plates, lateral nasopharynx, or skull base or encases carotid artery'],
]);
const AJCC_N_HPV = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'One or more ipsilateral lymph nodes, none larger than 6 cm'],
    ['2', 'Contralateral or bilateral lymph nodes, none larger than 6 cm'],
    ['3', 'Lymph node(s) larger than 6 cm'],
]);
const AJCC_N_NONHPV = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in a single ipsilateral lymph node, 3 cm or smaller in greatest dimension and ENE(−)'],
    ['2', 'Metastasis in a single ipsilateral node larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(−); or metastases in multiple ipsilateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−); or in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['2a', 'Metastasis in a single ipsilateral node larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(−)'],
    ['2b', 'Metastases in multiple ipsilateral nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['2c', 'Metastases in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(−)'],
    ['3', 'Metastasis in a lymph node larger than 6 cm in greatest dimension and ENE(−); or metastasis in any node(s) and clinically overt ENE(+)'],
    ['3a', 'Metastasis in a lymph node larger than 6 cm in greatest dimension and ENE(−)'],
    ['3b', 'Metastasis in any node(s) and clinically overt ENE(+)'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

function generate_report(){
    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];
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

    // calculate T stage
    let is_hpv = $('#cb_rn_hpv').is(':checked');
    if (has_ts_nm) {
        t_stage.push('x');
    } else if (has_ts_no || !has_tl) {
        t_stage.push('0');
    } else {
        // by invasion
        if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }
        if (is_hpv) {
            if ($('.cb_ti_t4:checked').length) {
                t_stage.push("4");
            }
        } else {
            if ($('.cb_ti_t4a:checked').length) {
                t_stage.push("4a");
            }
            if ($('.cb_ti_t4b:checked').length) {
                t_stage.push("4b");
            }
        }

        // by size
        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }
    }

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
        [${rn_hpv_check}] HPV-mediated (p16+)
        [${rn_sin_check}] Single lymphadenopathy

`;

    // Calculate N stage
    if (is_hpv) {
        if ((has_rln && n_length > 6.0)) {
            n_stage.push("3");
        } else if ((    $('.cb_rn_r:checked').length && $('.cb_rn_l:checked').length)           // bilateral
                    || ($('#cb_tl_r').is(':checked') && $('.cb_rn_l:checked').length)       // tumor right, LAP left
                    || ($('#cb_tl_l').is(':checked') && $('.cb_rn_r:checked').length)) {    // tumor left, LAP right
            n_stage.push("2");
        } else if (($('#cb_tl_r').is(':checked') && $('.cb_rn_r:checked').length)           // tumor right, LAP right
                    || ($('#cb_tl_l').is(':checked') && $('.cb_rn_l:checked').length)) {    // tumor left, LAP left
            n_stage.push("1");
        }
    } else {    // non-viral
        if (has_rln) {
            if (has_ene) {
                n_stage.push("3b");
            } else if (n_length > 6.0) {
                n_stage.push("3a");
            } else if ((    $('.cb_rn_r:checked').length && $('.cb_rn_l:checked').length)       // bilateral
                        || ($('#cb_tl_r').is(':checked') && $('.cb_rn_l:checked').length)       // tumor right, LAP left
                        || ($('#cb_tl_l').is(':checked') && $('.cb_rn_r:checked').length)) {    // tumor left, LAP right
                n_stage.push("2c");
            } else if (!has_sin) {          // multiple ipsilateral
                n_stage.push("2b");
            } else if (n_length > 3.0) {    // single ipsilateral, > 3 cm
                n_stage.push("2a");
            } else {                        // single ipsilateral, <= 3 cm
                n_stage.push("1");
            }
        }
    }

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

        m_stage.push("1");
        //console.log(m_stage);
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
    let FORM_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Cancer Staging Form" : "Oropharyngeal Cancer (p16-) Staging Form");
    let AJCC_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Carcinoma" : "Oropharyngeal Carcinoma (p16-)");
    let AJCC_T = (is_hpv ? AJCC_T_HPV : AJCC_T_NONHPV);
    let AJCC_N = (is_hpv ? AJCC_N_HPV : AJCC_N_NONHPV);
    report += ajcc_template_with_parent(AJCC_TITLE, t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html(FORM_TITLE);
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

$('#btn_copy').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)

    /*
    // form validation
    var f, is_valid
    f = document.getElementById('form_tumor_size');
    is_valid = f.checkValidity();
    if (!is_valid && !$('#cb_tp_ts_nm').is(':checked')) {
        f.classList.add('was-validated');
        return;
    }
    f = document.getElementById('form_tumor_location');
    is_valid = f.checkValidity();
    if (is_valid) {
        f.classList.add('was-validated');
        return;
    }
    */

    generate_report();
});

new ClipboardJS('#btn_copy', {
    text: function(trigger) {
        let report_title = $("#reportModalLongTitle").text();
        let report_body = $("#reportModalBody pre code").text();
        return report_title + "\n\n" + report_body;
    }
});

$('#btn_ajcc').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#ajccModalLong').modal('show');
});

$('#ajccModalLong').on('show.bs.modal', function () {
    $('body > *:not(#ajccModalLong)').attr('inert', 'true'); // 禁用背景內容
});

$('#ajccModalLong').on('hidden.bs.modal', function () {
    $('body > *:not(#ajccModalLong)').removeAttr('inert'); // 恢復互動
});

$( document ).ready(function() {
    console.log( "document loaded" );
    let is_hpv = $('#cb_rn_hpv').is(':checked');
    let AJCC_TITLE = (is_hpv ? "HPV-Mediated Oropharyngeal Carcinoma" : "Oropharyngeal Carcinoma (p16-)");
    let AJCC_T = (is_hpv ? AJCC_T_HPV : AJCC_T_NONHPV);
    let AJCC_N = (is_hpv ? AJCC_N_HPV : AJCC_N_NONHPV);
    let ajcc_table = generate_ajcc_table(AJCC_T, AJCC_N, AJCC_M);
    $('#ajccModalLongTitle').html(`AJCC Definitions for ${AJCC_TITLE}`);
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
