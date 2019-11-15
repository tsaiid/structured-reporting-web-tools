import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/gist.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_GIST_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Tumor 2 cm or less',
    '2': 'Tumor more than 2 cm but not more than 5 cm',
    '3': 'Tumor more than 5 cm but not more than 10 cm',
    '4': 'Tumor more than 10 cm in greatest dimension',
};
const AJCC8_GIST_N = {
    '0': 'No regional lymph node metastasis or unknown lymph node status',
    '1': 'Regional lymph node metastasis',
};
const AJCC8_GIST_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
};

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
Slice thickness: 5 mm or less
Range: abdomen
T1 in-phase/opposed phase, axial
T2 axial or coronal
Dynamic T1 fat saturation, axial
T1 fat saturation, coronal
DWI, axial`;
    } else {
        report += `CT protocol
Slice thickness: 5 mm or less
Range: abdomen
Contrast enhanced imaging, axial image
Dynamic contrast–enhanced axial imaging at arterial phase, venous phase
(+venous phase coronal reformation optionally)`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor location / size
--- Location:
`;
    if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n* ") + "\n";
    }

    report += "--- Size:\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "* Non-measurable";
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        report += "* Measurable: " + t_length + " cm (greatest dimension of the largest tumor)";
        if (t_length > 10) {
            t_stage.push("4");
        } else if (t_length > 5) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else if (t_length > 0) {
            t_stage.push("1");
        }
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('input[name="radios_ti"]:checked').length) {
        let radio_ti = $('input[name="radios_ti"]:checked');
        report += "* " + radio_ti.next().text();
        if (radio_ti.val() == "ti") {
            report += ', location: ' + $('#txt_ti_loc').val();
        }
        report += "\n";
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes: " + $('#txt_rn_others').val() + "\n";

        n_stage.push("1");
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal\n";
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm_nrn:checked').length) {
            report += "* Non-regional lymph nodes: " + join_checkbox_values($('.cb_dm_nrn:checked')) + "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrn):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):checked'), "\n* ");
        }
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
        if ($('.cb_dm_nrn:not(:checked)').length) {
            report += "* Non-regional lymph nodes: " + join_checkbox_values($('.cb_dm_nrn:not(:checked)')) + "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrn):not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_GIST_T[t];
    let n_str = AJCC8_GIST_N[n];
    let m_str = AJCC8_GIST_M[m];
    report += ajcc_template("Gastrointestinal Stromal Tumor", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Gastrointestinal Stromal Tumor Staging Form");
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
