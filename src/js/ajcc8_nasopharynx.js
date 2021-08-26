import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/nasopharynx.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc8_common.js';

const AJCC8_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No tumor identified, but EBV-positive cervical node(s) involvement',
    'is': 'Tumor in situ',
    '1': 'Tumor confined to nasopharynx, or extension to oropharynx and/or nasal cavity without parapharyngeal involvement',
    '2': 'Tumor with extension to parapharyngeal space, and/or adjacent soft tissue involvement (medial pterygoid, lateral pterygoid, prevertebral muscles)',
    '3': 'Tumor with infiltration of bony structures at skull base, cervical vertebra, pterygoid structures, and/or paranasal sinuses',
    '4': 'Tumor with intracranial extension, involvement of cranial nerves, hypopharynx, orbit, parotid gland, and/or extensive soft tissue infiltration beyond the lateral surface of the lateral pterygoid muscle',
};
const AJCC8_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Unilateral metastasis in cervical lymph node(s) and/or unilateral or bilateral metastasis in retropharyngeal lymph node(s), 6 cm or smaller in greatest dimension, above the caudal border of cricoid cartilage',
    '2': 'Bilateral metastasis in cervical lymph node(s), 6 cm or smaller in greatest dimension, above the caudal border of cricoid cartilage',
    '3': 'Unilateral or bilateral metastasis in cervical lymph node(s), larger than 6 cm in greatest dimension, and/or extension below the caudal border of cricoid cartilage',
};
const AJCC8_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
};

function generate_report(){
    var t_stage = ["0"];
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

    // Tumor location / size
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

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_yes_check = has_ti ? "+" : " ";
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
        T1: [${ti_np_check}] Nasopharynx  [${ti_op_check}] Oropharynx  [${ti_nc_check}] Nasal cavity
        T2: [${ti_pps_check}] Parapharyngeal space  [${ti_mpt_check}] Medial pterygoid  [${ti_lpt_check}] Lateral pterygoid
            [${ti_pvm_check}] Preverebral muscles
        T3: [${ti_sb_check}] Skull base bone invasion  [${ti_cv_check}] Cervical vertebra  [${ti_pb_check}] Pterygoid structures
            [${ti_pns_check}] Paranasal sinus ([${ti_pns_e_check}] Ethmoid   [${ti_pns_m_check}] Maxillary   [${ti_pns_f_check}] Frontal   [${ti_pns_s_check}] Sphenoid)
        T4: [${ti_ic_check}] Intracranial   [${ti_cn_check}] Cranial nerves  [${ti_hp_check}] Hypopharynx  [${ti_ob_check}] Orbit  [${ti_p_check}] Parotid gland
            [${ti_blp_check}] Infiltration beyond the lateral surface of the lateral pterygoid muscle
            [${ti_others_check}] Others: ${txt_ti_others}

`;
    // calculate T stage
    if (has_ts_nm) {
        t_stage.push("x");
    }
    if (has_ti) {
        if ($('.cb_ti_t1:checked').length) {
            t_stage.push("1");
        }
        if ($('.cb_ti_t2:checked').length) {
            t_stage.push("2");
        }
        if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }
        if ($('.cb_ti_t4:checked').length) {
            t_stage.push("4");
        }
        //console.log(t_stage);
    }

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let n_length = parseFloat($('#txt_rn_len').val());
    let txt_rn_len = n_length ? n_length : "___";
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

`
    // Calculate N stage
    if ((has_rln && n_length > 6.0) || $('.cb_rn_n3:checked').length) {
        n_stage.push("3");
    } else if ($('.cb_rn_r_nrp:checked').length && $('.cb_rn_l_nrp:checked').length) {
        n_stage.push("2");
    } else if (($('.cb_rn_r:checked').length ^ $('.cb_rn_l:checked').length) || $('.cb_rn_n1:checked').length) {
        n_stage.push("1");
    }

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location: ";
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
    report += ajcc_template_with_parent("Nasopharyngeal Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

    $('#reportModalLongTitle').html("Nasopharyngeal Carcinoma Staging Form");
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
