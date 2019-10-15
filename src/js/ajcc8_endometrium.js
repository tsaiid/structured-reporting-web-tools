import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/endometrium.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_ENDOMETRIUM_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1': 'Tumor confined to the corpus uteri, including endocervical glandular involvement.',
    '1a': 'Tumor limited to the endometrium or invading less than half the myometrium.',
    '1b': 'Tumor invading one half or more of the myometrium.',
    '2': 'Tumor invading the stromal connective tissue of the cervix but not extending beyond the uterus. Does NOT include endocervical glandular involvement.',
    '3': 'Tumor involving serosa, adnexa, vagina, or parametrium.',
    '3a': 'Tumor involving the serosa and/or adnexa (direct extension or metastasis).',
    '3b': 'Vaginal involvement (direct extension or metastasis) or parametrial involvement.',
    '4': 'Tumor invading the bladder mucosa and/or bowel mucosa (bullous edema is not sufficient to classify a tumor as T4).',
};
const AJCC8_ENDOMETRIUM_N = {
    'x': 'Regional lymph node cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Regional lymph node metastasis to pelvic lymph nodes.',
    '2': 'Regional lymph node metastasis to para-aortic lymph nodes, with or without positive pelvic lymph nodes.',
};
const AJCC8_ENDOMETRIUM_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis (includes metastasis to inguinal lymph nodes intraperitoneal disease, lung, liver, or bone). (It excludes metastasis to pelvic or para-aortic lymph nodes, vagina, uterine serosa, or adnexa).',
};

function generate_report(){
    var t_stage = ["0"];
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
        report += "CT protocol\n";
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
    if ($('#cb_ti_na').is(':checked')) {
        report += "--- Not assessable\n";
    } else {
        if ($("input[name='rb_ti_uc']:checked").length) {
            report += `Uterine corpus: ${ $("input[name='rb_ti_uc']:checked").next().text() }\n`;
            t_stage.push($("input[name='rb_ti_uc']:checked").val());
            //console.log(t_stage);
        }
        if ($('.cb_ti:checked').length) {
            report += "--- Yes:\n";
            report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
            report += "\n";

            if ($('.cb_ti_t2:checked').length) {
                t_stage.push("2");
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
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
        if ($('.cb_rn_n2:checked').length) {
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
        if ($('.cb_dm_nrl:checked').length) {
            report += "* non-regional lymph node: " + join_checkbox_values($('.cb_dm_nrl:checked'));
            if ($('#cb_dm_nrl_others').is(':checked')) {
                report += $('#txt_dm_nrl_others').val();
            }
            report += "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrl):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrl):checked'), "\n* ");
            if ($('#cb_dm_others:checked').length) {
                report += $('#txt_dm_others').val();
            }
            report += "\n";
        }
        m_stage.push("1");
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if (!$('.cb_dm_nrl:checked').length) {
            report += "* non-regional lymph node\n";
        }
        report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrl):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_ENDOMETRIUM_T[t];
    let n_str = AJCC8_ENDOMETRIUM_N[n];
    let m_str = AJCC8_ENDOMETRIUM_M[m];
    report += ajcc_template("Endometrial Carcinoma", t, t_str, n, n_str, m, m_str);

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
