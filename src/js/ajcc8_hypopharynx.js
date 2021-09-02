import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/hypopharynx.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc8_common.js';

const AJCC8_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    'is': 'Carcinoma in situ',
    '1': 'Tumor limited to one subsite of hypopharynx and/or 2 cm or smaller in greatest dimension',
    '2': 'Tumor invades more than one subsite of hypopharynx or an adjacent site, or measures larger than 2 cm but not larger than 4 cm in greatest dimension without fixation of hemilarynx',
    '3': 'Tumor larger than 4 cm in greatest dimension or with fixation of hemilarynx or extension to esophageal mucosa',
    '4': 'Moderately advanced and very advanced local disease',
    '4a': 'Moderately advanced local disease: Tumor invades thyroid/cricoid cartilage, hyoid bone, thyroid gland, or central compartment soft tissue',
    '4b': 'Very advanced local disease: Tumor invades prevertebral fascia, encases carotid artery, or involves mediastinal structures',
};
const AJCC8_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in a single ipsilateral lymph node, 3 cm or smaller in greatest dimension and ENE(-)',
    '2': 'Metastasis in a single ipsilateral node, larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(-); or metastases in multiple ipsilateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-); or metastasis in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-)',
    '2a': 'Metastasis in a single ipsilateral node, larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(-)',
    '2b': 'Metastases in multiple ipsilateral nodes, none larger than 6 cm in greatest dimension and ENE(-)',
    '2c': 'Metastases in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-)',
    '3': 'Metastasis in a lymph node, larger than 6 cm in greatest dimension and ENE(-); or metastasis in any lymph node(s) with clinically overt ENE(+)',
    '3a': 'Metastasis in a lymph node, larger than 6 cm in greatest dimension and ENE(-)',
    '3b': 'Metastasis in any lymph node(s) with clinically overt ENE(+)',
};
const AJCC8_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
};

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
    let tl_rps_check = $('#cb_tl_rps').is(':checked') ? "+" : " ";
    let tl_lps_check = $('#cb_tl_lps').is(':checked') ? "+" : " ";
    let tl_rpcr_check = $('#cb_tl_rpcr').is(':checked') ? "+" : " ";
    let tl_lpcr_check = $('#cb_tl_lpcr').is(':checked') ? "+" : " ";
    let tl_rppw_check = $('#cb_tl_rppw').is(':checked') ? "+" : " ";
    let tl_lppw_check = $('#cb_tl_lppw').is(':checked') ? "+" : " ";
    let tl_others_check = $('#cb_tl_others').is(':checked') ? "+" : " ";
    let txt_tl_others = $('#txt_tl_others').val() ? $('#txt_tl_others').val() : "___";
    report += `2. Tumor location / Size
    [${ts_nm_check}] Not assessable
    [${ts_no_check}] No evidence of primary tumor
    Size: ${txt_ts_len} cm (largest diameter)
    Tumor thickness: ${txt_ts_thick} cm
    Tumor location (subsites):
        [${tl_rps_check}] Right pyriform sinus   [${tl_lps_check}] Left pyriform sinus
        [${tl_rpcr_check}] Right postcricoid region   [${tl_lpcr_check}] Left postcricoid region
        [${tl_rppw_check}] Right posterior pharyngeal wall   [${tl_lppw_check}] Left posterior pharyngeal wall
        [${tl_others_check}] Others: ${txt_tl_others}

`;

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_foh_check = $('#cb_ti_foh').is(':checked') ? "+" : " ";
    let ti_eoem_check = $('#cb_ti_eoem').is(':checked') ? "+" : " ";
    let ti_tc_check = $('#cb_ti_tc').is(':checked') ? "+" : " ";
    let ti_cc_check = $('#cb_ti_cc').is(':checked') ? "+" : " ";
    let ti_hb_check = $('#cb_ti_hb').is(':checked') ? "+" : " ";
    let ti_tg_check = $('#cb_ti_tg').is(':checked') ? "+" : " ";
    let ti_em_check = $('#cb_ti_em').is(':checked') ? "+" : " ";
    let ti_ccst_check = $('#cb_ti_ccst').is(':checked') ? "+" : " ";
    let ti_pvf_check = $('#cb_ti_pvf').is(':checked') ? "+" : " ";
    let ti_eca_check = $('#cb_ti_eca').is(':checked') ? "+" : " ";
    let ti_ms_check = $('#cb_ti_ms').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    [${ti_no_check}] No regional invasion
    [${ti_foh_check}] Fixation of hemilarynx   [${ti_eoem_check}] Extension to esophageal mucosa
    [${ti_tc_check}] Thyroid cartilage   [${ti_cc_check}] Cricoid cartilage   [${ti_hb_check}] Hyoid bone
    [${ti_tg_check}] Thyroid gland   [${ti_em_check}] Esophageal muscle
    [${ti_ccst_check}] Central compartment soft tissue (prelaryngeal strap muscles and subcutaneous fat)
    [${ti_pvf_check}] Prevertebral fascia   [${ti_eca_check}] Encasement of carotid artery   [${ti_ms_check}] Mediastinal structures
    [${ti_others_check}] Others: ${txt_ti_others}

`;

    // calculate T stage
    if (has_ts_nm) {
        t_stage.push('x');
    } else if (has_ts_no || !has_tl) {
        t_stage.push('0');
    } else {
        // by invasion
        if ($('.cb_ti_t4b:checked').length) {
            t_stage.push("4b");
        } else if ($('.cb_ti_t4a:checked').length) {
            t_stage.push("4a");
        } else if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }

        // by size
        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }

        // by location
        if ($('.cb_tl:checked').length > 1) {
            t_stage.push('2');
        }
    }

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

    // Calculate N stage
    if (has_rln) {
        if (has_ene) {
            n_stage.push("3b");
        } else if (n_length > 6.0) {
            n_stage.push("3a");
        } else if ((   $('.cb_rn_r:checked').length && $('.cb_rn_l:checked').length)        // bilateral
                    || ($('.cb_tl_r:checked').length && $('.cb_rn_l:checked').length)       // tumor right, LAP left
                    || ($('.cb_tl_l:checked').length && $('.cb_rn_r:checked').length)   ) { // tumor left, LAP right
            n_stage.push("2c");
        } else if (!has_sin) {          // multiple ipsilateral
            n_stage.push("2b");
        } else if (n_length > 3.0) {    // single ipsilateral, > 3 cm
            n_stage.push("2a");
        } else {                        // single ipsilateral, <= 3 cm
            n_stage.push("1");
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
    report += ajcc_template_with_parent("Hypopharynx Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

    $('#reportModalLongTitle').html("Hypopharyngeal Cancer Staging Form");
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
