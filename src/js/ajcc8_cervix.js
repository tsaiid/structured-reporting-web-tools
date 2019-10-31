import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/cervix.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_CX_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1': 'Cervical carcinoma confined to the uterus (extension to corpus should be disregarded).',
    '1a': 'Invasive carcinoma diagnosed only by microscopy. Stromal invasion with a maximum depth of 5.0 mm measured from the base of the epithelium and a horizontal spread of 7.0 mm or less. Vascular space involvement, venous or lymphatic, does not affect classification.',
    '1b': 'Clinically visible lesion confined to the cervix or microscopic lesion greater than T1a/IA2. Includes all macroscopically visible lesions, even those with superficial invasion.',
    '2': 'Cervical carcinoma invading beyond the uterus but not to the pelvic wall or to lower third of vagina.',
    '2a': 'Tumor without parametrial invasion.',
    '2b': 'Tumor with parametrial invasion.',
    '3': 'Tumor extends to pelvic sidewall* and/or involving the lower third of vagina and/or causing hydronephrosis or nonfunctioning kidney.',
    '3a': 'Tumor involves lower third of vagina but not extending to the pelvic wall.',
    '3b': 'Tumor extending to the pelvic wall and/or causing hydronephrosis or nonfunctioning kidney.',
    '4': 'Tumor invading the mucosa of bladder or rectum, and/or extending beyond the true pelvis.',
};
const AJCC8_CX_N = {
    'x': 'Regional lymph node cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Regional lymph node metastasis (+).',
};
const AJCC8_CX_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis (including peritoneal spread or involvement of the supraclavicular, mediastinal, or distant lymph nodes; lung; liver; or bone).',
};

function generate_report(){
    var t_stage = ["1"];    // at least T1?
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";
    //var report = "1. CT protocol\n";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
- Distended rectum with jelly
- Abdomen and pelvis:
  * T2: coronal  * DWI (b=400): coronal
- Uterus:
  * TSE T2: axial, coronal, sagittal  * DWI (b=1000), ADC: axial
  * T1+FS: axial, sagittal  * T1+C+FS: axial, sagittal`;
    } else {
        report += `CT protocol
Intravenous contrast injection
Range: whole abdomen, slice thickness <= 5mm`;
    }
    report += "\n\n";

    // Tumor size
    report += "2. Tumor size\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Non-measurable";
    } else {
        let t_dia = parseFloat($('#txt_ts_dia').val());
        report += "--- Measurable: Greatest diameter " + t_dia + " cm";
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
        report += "\n";

        if ($('.cb_ti_t2a:checked').length) {
            t_stage.push("2a");
        }
        if ($('.cb_ti_t2b:checked').length) {
            t_stage.push("2b");
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
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_ti:not(:checked)')) + "\n";
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        n_stage.push("1");
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
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
        report += "* " + join_checkbox_values($('.cb_dm:checked'), "\n* ");
        if ($('#cb_dm_others:checked').length) {
            report += $('#txt_dm_others').val();
        }
        report += "\n";
        m_stage.push("1");
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_CX_T[t];
    let n_str = AJCC8_CX_N[n];
    let m_str = AJCC8_CX_M[m];
    report += ajcc_template("Cervical Carcinoma", t, t_str, n, n_str, m, m_str);

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
