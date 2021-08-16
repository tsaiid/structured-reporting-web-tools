import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/endometrium.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc8_common.js';

const AJCC8_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Tumor confined to the corpus uteri, including endocervical glandular involvement',
    '1a': 'Tumor limited to the endometrium or invading less than half the myometrium',
    '1b': 'Tumor invading one half or more of the myometrium',
    '2': 'Tumor invading the stromal connective tissue of the cervix but not extending beyond the uterus. Does NOT include endocervical glandular involvement.',
    '3': 'Tumor involving serosa, adnexa, vagina, or parametrium',
    '3a': 'Tumor involving the serosa and/or adnexa (direct extension or metastasis)',
    '3b': 'Vaginal involvement (direct extension or metastasis) or parametrial involvement',
    '4': 'Tumor invading the bladder mucosa and/or bowel mucosa (bullous edema is not sufficient to classify a tumor as T4)',
};
const AJCC8_N = {
    'x': 'Regional lymph node cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '0(i+)': 'Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm',
    '1': 'Regional lymph node metastasis to pelvic lymph nodes',
    '1mi': 'Regional lymph node metastasis (greater than 0.2 mm but not greater than 2.0 mm in diameter) to pelvic lymph nodes',
    '1a': 'Regional lymph node metastasis (greater than 2.0 mm in diameter) to pelvic lymph nodes',
    '2': 'Regional lymph node metastasis to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
    '2mi': 'Regional lymph node metastasis (greater than 0.2 mm but not greater than 2.0 mm in diameter) to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
    '2a': 'Regional lymph node metastasis (greater than 2.0 mm in diameter) to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
};
const AJCC8_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis (includes metastasis to inguinal lymph nodes intraperitoneal disease, lung, liver, or bone). (It excludes metastasis to pelvic or para-aortic lymph nodes, vagina, uterine serosa, or adnexa).',
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

    // Tumor size
    let t_length = parseFloat($('#txt_ts_len').val());
    report += "2. Tumor size";
    if ($('#cb_ts_nm').is(':checked') || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (greatest dimension)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest dimension)`;
    }
    report += "\n\n";

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 || $("input[name='rb_ti_uc']:checked").length > 0;
    let has_ti_na = $('#cb_ti_na').is(':checked');
    let ti_na_check = has_ti_na && !has_ti ? "+" : " ";
    let ti_no_check = !has_ti_na && !has_ti ? "+" : " ";
    let ti_yes_check = has_ti ? "+" : " ";
    let ti_uc_check = $("input[name='rb_ti_uc']:checked").length > 0 ? "+" : " ";
    let ti_lhm_check = $('#rb_ti_lhm').is(':checked') ? "+" : " ";
    let ti_mhm_check = $('#rb_ti_mhm').is(':checked') ? "+" : " ";
    let ti_cx_check = $('#cb_ti_cx').is(':checked') ? "+" : " ";
    let ti_sa_check = $('#cb_ti_sa').is(':checked') ? "+" : " ";
    let ti_pm_check = $('#cb_ti_pm').is(':checked') ? "+" : " ";
    let ti_va_check = $('#cb_ti_va').is(':checked') ? "+" : " ";
    let ti_bd_check = $('#cb_ti_bd').is(':checked') ? "+" : " ";
    let ti_bw_check = $('#cb_ti_bw').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";

    report += `3. Tumor invasion
  [${ti_na_check}] Not assessable
  [${ti_no_check}] No or Equivocal
  [${ti_yes_check}] Yes, if yes:
    [${ti_uc_check}] Tumor in uterine corpus
      [${ti_lhm_check}] Tumor limited to endometrium or invades less than one half of the myometrium
      [${ti_mhm_check}] Tumor invades more than one half of the myometrium
    [${ti_cx_check}] Tumor invades stromal connective tissue of the cervix but does not extend beyond uterus
    [${ti_sa_check}] Tumor invades serosa &/or adnexa
    [${ti_pm_check}] Parametrial involvement
    [${ti_va_check}] Vaginal involvement
    [${ti_bd_check}] Tumor invades bladder (mucosa)
    [${ti_bw_check}] Tumor invades bowel (mucosa)
    [${ti_others_check}] Others: ${txt_ti_others}`;
    report += "\n\n";

    if (has_ti_na && !has_ti) {
        t_stage.push("x");
    } else if ($('.cb_ti_t4:checked').length) {
                t_stage.push("4");
    } else if ($('.cb_ti_t3b:checked').length) {
        t_stage.push("3b");
    } else if ($('.cb_ti_t3a:checked').length) {
        t_stage.push("3a");
    } else if ($('.cb_ti_t2:checked').length) {
        t_stage.push("2");
    } else if ($('#rb_ti_mhm').is(':checked')) {
        t_stage.push("1b");
    } else if ($('#rb_ti_lhm').is(':checked')) {
        t_stage.push("1a");
    } else {
        t_stage.push("0");
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

    if ($('.cb_rn_n2:checked').length) {
        n_stage.push("2");
    } else if ($('.cb_rn:checked').length) {
        n_stage.push("1");
    }

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    let dm_no_check = !has_dm ? "+" : " ";
    let dm_yes_check = has_dm ? "+" : " ";
    let dm_nrl_check = $('.cb_dm_nrl:checked').length > 0 ? "+" : " ";
    let dm_nrl_i_check = $('.cb_dm_nrl:checked').length > 0 ? "+" : " ";
    let dm_nrl_i_r_check = $('#cb_dm_nrl_i_r').is(':checked') ? "+" : " ";
    let dm_nrl_i_l_check = $('#cb_dm_nrl_i_l').is(':checked') ? "+" : " ";
    let dm_nrl_others_check = $('#cb_dm_nrl_others').is(':checked') ? "+" : " ";
    let txt_dm_nrl_others = $('#txt_dm_nrl_others').val() ? $('#txt_dm_nrl_others').val() : "___";
    let dm_pc_check = $('#cb_dm_pc').is(':checked') ? "+" : " ";
    let dm_lu_check = $('#cb_dm_lu').is(':checked') ? "+" : " ";
    let dm_li_check = $('#cb_dm_li').is(':checked') ? "+" : " ";
    let dm_ad_check = $('#cb_dm_ad').is(':checked') ? "+" : " ";
    let dm_bo_check = $('#cb_dm_bo').is(':checked') ? "+" : " ";
    let dm_others_check = $('#cb_dm_others').is(':checked') ? "+" : " ";
    let txt_dm_others = $('#txt_dm_others').val() ? $('#txt_dm_others').val() : "___";
    report += `5. Distant metastasis (In this study)
  [${dm_no_check}] No or Equivocal
  [${dm_yes_check}] Yes, if yes:
    [${dm_nrl_check}] Non-regional lymph nodes
      [${dm_nrl_i_check}] Inguinal nodes: [${dm_nrl_i_r_check}] right  [${dm_nrl_i_l_check}] left
      [${dm_nrl_others_check}] Others: ${txt_dm_nrl_others}
    [${dm_pc_check}] Peritoneal cavity
    [${dm_lu_check}] Lung
    [${dm_li_check}] Liver
    [${dm_ad_check}] Adrenal
    [${dm_bo_check}] Bone
    [${dm_others_check}] Others: ${txt_dm_others}`;
    report += "\n\n";

    if (has_dm) {
        m_stage.push("1");
    }

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Cervical Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

    $('#reportModalLongTitle').html("Endometrial Cancer Staging Form");
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
