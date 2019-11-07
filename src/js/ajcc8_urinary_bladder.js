import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/urinary_bladder.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_UB_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    'a': 'Non-invasive papillary carcinoma.',
    'is': 'Urothelial carcinoma in situ: "flat tumor"',
    '1': 'Tumor invades lamina propria (subepithelial connective tissue).',
    '2': 'Tumor invades muscularis propria.',
    '3': 'Tumor invades perivesical soft tissue.',
    '4': 'Extravesical tumor directly invades any of the following: prostatic stroma, seminal vesicles, uterus, vagina, pelvic wall, abdominal wall.',
    '4a': 'Extravesical tumor directly invades into prostatic stroma, uterus, vagina.',
    '4b': 'Extravesical tumor invades pelvic wall, abdominal wall.',
};
const AJCC8_UB_N = {
    'x': 'Regional lymph node cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Single regional lymph node metastasis in the true pelvis (perivesical, obturator, internal and external iliac, or sacral lymph node).',
    '2': 'Multiple regional lymph node metastases in the true pelvis (perivesical, obturator, internal and external iliac, or sacral lymph node metastasis).',
    '3': 'Lymph node metastasis to common iliac lymph nodes.',
};
const AJCC8_UB_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis.',
    '1a': 'Distant metastasis limited to lymph nodes beyond the common iliacs.',
    '1b': 'Non-lymph-node distant metastases.',
};

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
Axial and Sagittal T2WI
Axial T1WI or T1FS: pre- and post-contrast
Sagittal T1FS: post-contrast
For lymph node assessment: axial T1FS or axial DWI/ADC
For other sites of the urinary tract: coronal MRU`;
    } else {
        report += `CT protocol
Slice thickness: 5 mm or less
Range: kidney to urinary bladder
Pre-contrast imaging: axial imaging
Post-contrast imaging: axial imaging
(excretory phase, at least 5 minutes after contrast medium administration): axial imaging and coronal reformation`;
    }
    report += "\n\n";

    // Tumor size
    report += "2. Tumor location / size\n";
    report += "Tumor number: " + $('input[name="radio_tn"]:checked').val() + "\n";
    report += "Tumor locations: " + join_checkbox_values($('.cb_tl:checked')) + "\n";
    report += "Largest tumor size: ";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "Non-measurable";
    } else {
        let t_dia = parseFloat($('#txt_ts_dia').val());
        report += "Measurable: " + t_dia + " cm (greatest dimension) at " + join_checkbox_values($('.cb_tl_l:checked')) + "\n";
    }
    report += "\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_ti_t1:checked, .cb_ti_t2:checked, .cb_ti_t3:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t1:checked, .cb_ti_t2:checked, .cb_ti_t3:checked')) + "\n";
        }
        if ($('.cb_ti_t4a:checked').length) {
            report += "* " + join_checkbox_values($('input[name="radio_gender"]:checked').first().parent().parent().find('.cb_ti:checked')) + "\n";
        }
        if ($('.cb_ti_t4b:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4b:checked')) + "\n";
        }

        if ($('.cb_ti_t1:checked').length) {
            t_stage.push("1");
        }
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
        //console.log(t_stage);
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_ti_t1:not(:checked), .cb_ti_t2:not(:checked), .cb_ti_t3:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t1:not(:checked), .cb_ti_t2:not(:checked), .cb_ti_t3:not(:checked)')) + "\n";
        }
        if ($('.cb_ti_t4a:not(:checked)').length) {
            report += "* " + join_checkbox_values($('input[name="radio_gender"]:checked').first().parent().parent().find('.cb_ti:not(:checked)')) + "\n";
        }
        if ($('.cb_ti_t4b:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4b:not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";

        if ($('.cb_rn_n3:checked').length) {
            n_stage.push("3");
        } else if ($('.cb_rn:checked').length > 1 || !$('#cb_rn_sln').is(':checked')) {
            n_stage.push("2");
        } else {
            n_stage.push("1");
        }
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_rn:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_rn:not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
        if ($('.cb_dm_m1b:checked').length) {
            m_stage.push("1b");
        } else {
            m_stage.push("1a");
        }
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not("#cb_dm_others"):not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n";
    report += "- Hydronephrosis: ";
    if ($('.cb_o_hn:checked').length) {
        report += join_checkbox_values($('.cb_o_hn:checked')) + "\n";
    } else {
        report += "no\n";
    }

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_UB_T[t];
    let n_str = AJCC8_UB_N[n];
    let m_str = AJCC8_UB_M[m];
    report += ajcc_template("Urinary Bladder Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Urinary Bladder Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

$('.cb_ti_t4a, input[name="radio_gender"]').change(function() {
    $(this).parent().parent().find('input[name="radio_gender"]').prop("checked", true);
    $(this).parent().parent().siblings().find('.cb_ti').prop('checked', false);
});

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
