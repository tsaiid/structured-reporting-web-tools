import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/esophagus.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_ESO_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Tumor invades the lamina propria, muscularis mucosae, or submucosa',
    '1a': 'Tumor invades the lamina propria or muscularis mucosae',
    '1b': 'Tumor invades the submucosa',
    '2': 'Tumor invades the muscularis propria',
    '3': 'Tumor invades adventitia',
    '4': 'Tumor invades adjacent structures',
    '4a': 'Tumor invades the pleura, pericardium, azygos vein, diaphragm, or peritoneum',
    '4b': 'Tumor invades other adjacent structures, such as the aorta, vertebral body, or airway',
};
const AJCC8_ESO_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in one or two regional lymph nodes',
    '2': 'Metastasis in three to six regional lymph nodes',
    '3': 'Metastasis in seven or more regional lymph nodes',
};
const AJCC8_ESO_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
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
    report += "3. Tumor invasion\n";
    let has_inv = $('.cb_ti:checked').length > 0;
    report += "  [" + (!has_inv ? "+" : " ") + "] No or Equivocal\n";
    report += "  [" + (has_inv ? "+" : " ") + "] Yes, if yes:\n";
    $('.cb_ti').each(function(){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });

    if (!has_inv) {
        if (has_no_measurable_tumor) {
            t_stage.push("x");
        } else {
            t_stage.push("1")
        }
    } else {
        if ($('.cb_ti_t2:checked').length) {
            t_stage.push("2");
        }
        if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }
        if ($('.cb_ti_t4a:checked').length) {
            t_stage.push("4a");
        }
        if ($('.cb_ti_t4b:checked').length) {
            t_stage.push("4b");
        }
    }
    console.log(t_stage);
    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes, number of suspicious lymph node: " + rln_num + ", and locations:\n";
    $('.cb_rn:not("#cb_rn_others")').each(function(){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });
    if ($('#cb_rn_others').is(':checked')) {
        report += "    [+] " + $('#txt_rn_others').val() + "\n";
    }
    if (has_rln) {
        if (rln_num >= 7) {
            n_stage.push("3");
        } else if (rln_num >= 3) {
            n_stage.push("2");
        } else if (rln_num >= 1) {
            n_stage.push("1");
        } else {
            n_stage.push("0");
        }
        //console.log(n_stage);
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location(s): ";
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
    let t_str = AJCC8_ESO_T[t];
    let n_str = AJCC8_ESO_N[n];
    let m_str = AJCC8_ESO_M[m];
    report += ajcc_template("Esophageal Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Esophageal Cancer Staging Form");
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
