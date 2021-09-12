import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/cervix.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc_common.js';

const AJCC8_CX_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Cervical carcinoma confined to the uterus (extension to corpus should be disregarded)',
    '1a': 'Invasive carcinoma diagnosed only by microscopy. Stromal invasion with a maximum depth of 5.0 mm measured from the base of the epithelium and a horizontal spread of 7.0 mm or less. Vascular space involvement, venous or lymphatic, does not affect classification.',
    '1a1': 'Measured stromal invasion of 3.0 mm or less in depth and 7.0 mm or less in horizontal spread',
    '1a2': 'Measured stromal invasion of more than 3.0 mm and not more than 5.0 mm, with a horizontal spread of 7.0 mm or less',
    '1b': 'Clinically visible lesion confined to the cervix or microscopic lesion greater than T1a/IA2. Includes all macroscopically visible lesions, even those with superficial invasion.',
    '1b1': 'Clinically visible lesion 4.0 cm or less in greatest dimension',
    '1b2': 'Clinically visible lesion more than 4.0 cm in greatest dimension',
    '2': 'Cervical carcinoma invading beyond the uterus but not to the pelvic wall or to lower third of vagina',
    '2a': 'Tumor without parametrial invasion',
    '2a1': 'Clinically visible lesion 4.0 cm or less in greatest dimension',
    '2a2': 'Clinically visible lesion more than 4.0 cm in greatest dimension',
    '2b': 'Tumor with parametrial invasion',
    '3': 'Tumor extends to pelvic sidewall* and/or involving the lower third of vagina and/or causing hydronephrosis or nonfunctioning kidney',
    '3a': 'Tumor involves lower third of vagina but not extending to the pelvic wall',
    '3b': 'Tumor extending to the pelvic wall and/or causing hydronephrosis or nonfunctioning kidney',
    '4': 'Tumor invading the mucosa of the bladder or rectum and/or extending beyond the true pelvis (bullous edema is not sufficient to classify a tumor as T4)',
};
const AJCC8_CX_N = {
    'x': 'Regional lymph node cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '0(i+)': 'Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm',
    '1': 'Regional lymph node metastasis',
};
const AJCC8_CX_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis (including peritoneal spread or involvement of the supraclavicular, mediastinal, or distant lymph nodes; lung; liver; or bone)',
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
    report += "2. Tumor size\n";
    report += "  - Size: ";
    if ($('#cb_ts_nm').is(':checked') || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (in maximum diameter)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (in maximal diameter)`;
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    $('.lb_ti').each(function(){
        let cb_ti = $(this).attr('for');
        if ($(this).hasClass('has_parts')) {
            let check_or_not = $('.' + cb_ti + ':checked').length > 0 ? "+" : " ";
            report += `  [${check_or_not}] ` + $(this).text() + ": ";
            let parts = $('.' + cb_ti);
            parts.each(function(i, e){
                let check_or_not = $(this).is(':checked') ? "+" : " ";
                report += `[${check_or_not}] ` + $(this).val();
                if (i !== parts.length - 1) {
                    report += "  ";
                }
            });
            report += "\n";
        } else {
            let check_or_not = $('#' + cb_ti).is(':checked') ? "+" : " ";
            report += `  [${check_or_not}] ` + $(this).text() + "\n";
        }
    });
    let other_check_or_not = $('#cb_ti_others').is(':checked') ? "+" : " ";
    report += `  [${other_check_or_not}] Others (beyond the true pelvis): `;
    report += $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += "\n\n";

    if ($('.cb_ti_t4:checked').length) {
        t_stage.push("4");
    } else if ($('.cb_ti_t3b:checked').length) {
        t_stage.push("3b");
    } else if ($('.cb_ti_t3a:checked').length) {
        t_stage.push("3a");
    } else if ($('.cb_ti_t2b:checked').length) {
        t_stage.push("2b");
    } else if ($('.cb_ti_t2a:checked').length) {
        t_stage.push("2a");
    } else if ($('.cb_ti_t1:checked').length) {
        if (!$('#cb_ts_nm').is(':checked') && t_length > 0) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    } else if (t_length === 0) {
        t_stage.push("0");
    } else {
        t_stage.push("x");
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

    if (has_rln) {
        n_stage.push("1");
    }
    report += "\n";

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
    report += ajcc_template_with_parent("Cervical Carcinoma", t, AJCC8_CX_T, n, AJCC8_CX_N, m, AJCC8_CX_M);

    $('#reportModalLongTitle').html("Cervical Cancer Staging Form");
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
