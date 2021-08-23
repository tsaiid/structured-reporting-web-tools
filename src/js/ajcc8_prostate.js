import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/prostate.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc8_common.js';

const AJCC8_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Clinically inapparent tumor that is not palpable',
    '1a': 'Tumor incidental histologic finding in 5% or less of tissue resected',
    '1b': 'Tumor incidental histologic finding in more than 5% of tissue resected',
    '1c': 'Tumor identified by needle biopsy found in one or both sides, but not palpable',
    '2': 'Tumor is palpable and confined within prostate',
    '2a': 'Tumor involves one-half of one lobe or less',
    '2b': 'Tumor involves more than one-half of one lobe but not both lobes',
    '2c': 'Tumor involves both lobes',
    '3': 'Extraprostatic tumor that is not fixed or does not invade adjacent structures',
    '3a': 'Extracapsular extension (unilateral or bilateral)',
    '3b': 'Tumor invades seminal vesicle(s)',
    '4': 'Tumor is fixed or invades adjacent structures other than seminal vesicles such as external sphincter, rectum, bladder, levator muscles, and/or pelvic wall',
};
const AJCC8_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No positive regional nodes',
    '1': 'Metastasis in regional node(s)',
};
const AJCC8_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
    '1a': 'Nonregional lymph node(s)',
    '1b': 'Bone(s)',
    '1c': 'Other site(s) with or without bone disease',
};
const map_prostate_invasion = {
    'One-half of one lobe or less': '2a',
    'More than one-half of one lobe but not both lobes': '2b',
    'Involves both lobes': '2c',
};

function generate_report(){
    var t_stage = [];
    var n_stage = ["0"];
    var m_stage = ["0"];
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
    let has_tl_na = $('#cb_tl_na').is(':checked');
    let tl_na_check = has_tl_na ? "+" : " ";
    let tl_no_check = !has_tl_na && !$('.cb_tl:checked').length ? "+" : " ";
    let tl_yes_check = !has_tl_na && $('.cb_tl:checked').length ? "+" : " ";
    let tl_r_check = !has_tl_na && $('#cb_tl_r').is(':checked') ? "+" : " ";
    let tl_l_check = !has_tl_na && $('#cb_tl_l').is(':checked') ? "+" : " ";
    report += `2. Tumor location / size
  [${tl_na_check}] Not assessable
  [${tl_no_check}] No or Equivocal
  [${tl_yes_check}] Yes, if yes:
    [${tl_r_check}] Right lobe   [${tl_l_check}] Left lobe
       Size ${txt_ts_len} cm (largest diameter of the biggest tumor)

`;

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 || $("input[name='rb_ti_p']:checked").length > 0;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_yes_check = has_ti ? "+" : " ";
    let ti_loh_check = $('#rb_ti_loh').is(':checked') ? "+" : " ";
    let ti_moh_check = $('#rb_ti_moh').is(':checked') ? "+" : " ";
    let ti_bl_check = $('#rb_ti_bl').is(':checked') ? "+" : " ";
    let ti_ecr_check = $('#cb_ti_ecr').is(':checked') ? "+" : " ";
    let ti_ecl_check = $('#cb_ti_ecl').is(':checked') ? "+" : " ";
    let ti_svr_check = $('#cb_ti_svr').is(':checked') ? "+" : " ";
    let ti_svl_check = $('#cb_ti_svl').is(':checked') ? "+" : " ";
    let ti_psr_check = $('#cb_ti_psr').is(':checked') ? "+" : " ";
    let ti_psl_check = $('#cb_ti_psl').is(':checked') ? "+" : " ";
    let ti_ub_check = $('#cb_ti_ub').is(':checked') ? "+" : " ";
    let ti_rec_check = $('#cb_ti_rec').is(':checked') ? "+" : " ";
    let ti_es_check = $('#cb_ti_es').is(':checked') ? "+" : " ";
    let ti_lm_check = $('#cb_ti_lm').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
  [${ti_no_check}] No or Equivocal
  [${ti_yes_check}] Yes, if yes:
    Prostate
      [${ti_loh_check}] One-half of one lobe or less
      [${ti_moh_check}] More than one-half of one lobe but not both lobes
      [${ti_bl_check}] Involves both lobes
    Extracapsular extension [${ti_ecr_check}] right  [${ti_ecl_check}] left
    Seminal vesicle invasion [${ti_svr_check}] right  [${ti_svl_check}] left
    Pelvic sidewall [${ti_psr_check}] right  [${ti_psl_check}] left
    Pelvic organs invasion
      [${ti_ub_check}] Bladder   [${ti_rec_check}] Rectum   [${ti_es_check}] External sphincter   [${ti_lm_check}] Levator muscles
      [${ti_others_check}] Others ${txt_ti_others}

`;
    // Calculate T staging
    // No T1, do not know if palpable or not
    if (has_tl_na) {
        t_stage.push("x");
    } else if (tl_no_check === "+" || t_length === 0) {
        t_stage.push("0");
    } else if (has_ti) {
        if ($("input[name='rb_ti_p']:checked").length) {
            t_stage.push(map_prostate_invasion[$("input[name='rb_ti_p']:checked").val()]);
        }
        if ($('.cb_ti_t3a:checked').length) {
            t_stage.push("3a");
        }
        if ($('.cb_ti_t3b:checked').length) {
            t_stage.push("3b");
        }
        if ($('.cb_ti_t4:checked').length) {
            t_stage.push("4");
        }
        //console.log(t_stage);
    }

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes:\n";
    $('.lb_rn').each(function(){
        let cb_rn = $(this).attr('for');
        if ($(this).hasClass('has_parts')) {
            let check_or_not = $('.' + cb_rn + ':checked').length > 0 ? "+" : " ";
            report += `    [${check_or_not}] ` + $(this).text() + ": ";
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
            report += `    [${check_or_not}] ` + $(this).text() + "\n";
        }
    });
    report += "\n";

    if (has_rln) {
        n_stage.push("1");
    }

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    let dm_no_check = !has_dm ? "+" : " ";
    let dm_yes_check = has_dm ? "+" : " ";
    let dm_nrl_check = $('.cb_dm_nrl:checked').length > 0 ? "+" : " ";
    let dm_nrl_ci_check = $('.cb_dm_nrl_ci:checked').length > 0 ? "+" : " ";
    let dm_nrl_ci_r_check = $('#cb_dm_nrl_ci_r').is(':checked') ? "+" : " ";
    let dm_nrl_ci_l_check = $('#cb_dm_nrl_ci_l').is(':checked') ? "+" : " ";
    let dm_nrl_i_check = $('.cb_dm_nrl_i:checked').length > 0 ? "+" : " ";
    let dm_nrl_i_r_check = $('#cb_dm_nrl_i_r').is(':checked') ? "+" : " ";
    let dm_nrl_i_l_check = $('#cb_dm_nrl_i_l').is(':checked') ? "+" : " ";
    let dm_nrl_pa_check = $('#cb_dm_nrl_pa').is(':checked') ? "+" : " ";
    let dm_nrl_others_check = $('#cb_dm_nrl_others').is(':checked') ? "+" : " ";
    let txt_dm_nrl_others = $('#txt_dm_nrl_others').val() ? $('#txt_dm_nrl_others').val() : "___";
    let dm_li_check = $('#cb_dm_li').is(':checked') ? "+" : " ";
    let dm_ad_check = $('#cb_dm_ad').is(':checked') ? "+" : " ";
    let dm_lu_check = $('#cb_dm_lu').is(':checked') ? "+" : " ";
    let dm_b_check = $('#cb_dm_b').is(':checked') ? "+" : " ";
    let dm_others_check = $('#cb_dm_others').is(':checked') ? "+" : " ";
    let txt_dm_others = $('#txt_dm_others').val() ? $('#txt_dm_others').val() : "___";
    report += `5. Distant metastasis (In this study)
  [${dm_no_check}] No or Equivocal
  [${dm_yes_check}] Yes, if yes:
    [${dm_nrl_check}] Non-regional lymph nodes
      [${dm_nrl_ci_check}] Common iliac: [${dm_nrl_ci_r_check}] right  [${dm_nrl_ci_l_check}] left
      [${dm_nrl_i_check}] Inguinal: [${dm_nrl_i_r_check}] right  [${dm_nrl_i_l_check}] left
      [${dm_nrl_pa_check}] Paraaortic
      [${dm_nrl_others_check}] Others: ${txt_dm_nrl_others}
    [${dm_li_check}] Liver
    [${dm_ad_check}] Adrenal
    [${dm_lu_check}] Lung
    [${dm_b_check}] Bone
    [${dm_others_check}] Others: ${txt_dm_others}`;
    report += "\n\n";

    if (has_dm) {
        if ($('.cb_dm_m1a:checked').length) {
            m_stage.push("1a");
        }
        if ($('.cb_dm_m1b:checked').length) {
            m_stage.push("1b");
        }
        if ($('.cb_dm_m1c:checked').length) {
            m_stage.push("1c");
        }
        //console.log(m_stage);
    }

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Prostate Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

    $('#reportModalLongTitle').html("Prostate Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

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
