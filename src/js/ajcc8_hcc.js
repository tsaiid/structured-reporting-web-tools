import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/hcc.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_HCC_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1a': 'Solitary tumor ≤ 2 cm.',
    '1b': 'Solitary tumor >2cm without vascular invasion.',
    '2': 'Solitary tumor >2cm with vascular invasion or multiple tumors, none > 5 cm.',
    '3': 'Multiple tumors, at least one of which is >5 cm.',
    '4': 'Single tumor or multiple tumors of any size involving a major branch of the portal vein or hepatic vein, or tumor(s) with direct invasion of adjacent organs other than the gallbladder or with perforation of visceral peritoneum.',
};
const AJCC8_HCC_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Regional lymph node metastasis.',
};
const AJCC8_HCC_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis.',
};

function generate_report(){
    var t_stage = ["0"];    // at least T1?
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol`;
    } else {
        report += `CT protocol
With contrast, range: whole abdomen, slice thickness <= 5mm`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor location / size\n`;

    let txt_tl_num = $('#txt_tl_num').val();
    let tl_num = parseInt(txt_tl_num, 10);
    report += "--- Number: " + txt_tl_num + "\n";

    let txt_tl_loc = $('#txt_tl_loc').val();
    report += "--- Location: " + txt_tl_loc + "\n";

    report += "--- Size:\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "* Non-measurable";
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        report += "* Measurable: " + t_length + " cm (the largest tumor)";
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor characteristics and associated liver features
    report += "3. Tumor characteristics and associated liver features\n";
    if ($('.cb_tc:checked').length) {
        report += "--- Yes:";
        if ($('.cb_tc:not(.cb_tc_pvt):checked').length) {
            report += "\n* " + join_checkbox_values($('.cb_tc:not(.cb_tc_pvt):checked'), "\n* ");
        }
        if ($('.cb_tc_pvt:checked').length) {
            report += "\n* " + $('#cb_tc_pvt').val() + ", location: " + $('#txt_tc_pvt').val();
        }
        report += "\n";

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
    if ($('.cb_tc:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_tc:not(:checked)')) + "\n";
    }
    report += "\n";

    if (tl_num == 1) {
        if ($('#cb_tc_pvt').is(':checked')) {
            t_stage.push('2');
        } else {
            if (t_length > 2) {
                t_stage.push('1b');
            } else {
                t_stage.push('1a');
            }
        }
    } else {

    }

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "--- Location:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";

        n_stage.push('1');
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var rn_array = [];
        if ($('.cb_rn:not(:checked)').length) {
            rn_array.push("* " + join_checkbox_values($('.cb_rn:not(:checked)')));
        }
        report += rn_array.join("\n") + "\n"
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
        if ($('.cb_dm:checked').length) {
            m_stage.push("1");
        }
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
    let t_str = AJCC8_HCC_T[t];
    let n_str = AJCC8_HCC_N[n];
    let m_str = AJCC8_HCC_M[m];
    report += ajcc_template("Hepatocellular Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Hepatocellular Carcinoma Staging Form");
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
