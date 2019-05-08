import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/colon.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_COLON_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No tumor identified, but EBV(+) cervical nodes involvement.',
    '1': 'Tumor confined to the nasopharynx, or extension to oropharynx and/or nasal cavity without parapharyngeal extension.',
    '2': 'Tumor with extension to parapharyngeal space and/or adjacent soft tissue involvement (medial or lateral pterygoid, prevertebral muscles)',
    '3': 'Tumor with infiltration of bony structures at skull base, cervical vertebra, pterygoid structures, and/or paranasal sinuses.',
    '4': 'Tumor with intracranial extension, involvement of cranial nerves, hypopharynx, orbit, parotid gland, and/or extensive soft tissue infiltration beyond the lateral surface of the lateral pterygoid muscle.',
};
const AJCC8_COLON_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Unilateral metastasis in cervical lymph node(s), and/or unilateral or bilateral metastasis in retropharyngeal lymph node(s), ≦ 6 cm in greatest dimension, above the caudal border of cricoid cartilage.',
    '2': 'Bilateral metastasis in cervical lymph node(s), ≦ 6 cm in greatest dimension, above the caudal border of cricoid cartilage.',
    '3': 'Unilateral or bilateral metastasis in cervical lymph node(s), > 6 cm and/or extension below the caudal border of cricoid cartilage.',
};
const AJCC8_COLON_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis.',
};

function generate_report(){
    var t_stage = ["1"];    // at least T1?
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. CT protocol\n";

    // Protocol
    if ($('.cb_sp:checked').length) {
        report += "TECHNIQUE: ";
        $('.cb_sp:checked').each(function(i) {
            report += '(' + (i+1) + ') ' + $(this).val() + ' ';
        });
        report += $('.cb_sp:checked').length > 1 ? 'were ' : 'was ';
        report += "performed\n";
        report += "SCAN RANGE: lower neck to adrenal gland\n\n";
    }

    // Tumor location
    report += "2. Tumor location\n";
    if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n*") + "\n\n";
    }

    // Tumor size
    report += "3. Tumor size\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Non-measurable";
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        report += "--- Measurable: Length " + t_length + " cm, ";
        let t_thick = parseFloat($('#txt_ts_thick').val());
        report += "Max thickness " + t_thick + " cm";
        //t_stage.push(get_t_stage_by_size(t_size));
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "4. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
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
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var ti_array = [];
        if ($('.cb_ti_t2:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t2:not(:checked)')));
        }
        if ($('.cb_ti_t3:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t3:not(:checked)')));
        }
        if ($('.cb_ti_t4a:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4a:not(:checked)')));
        }
        if ($('.cb_ti_t4b:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4b:not(:checked)')));
        }
        report += ti_array.join("\n") + "\n"
    }
    report += "\n";

    // Regional nodal metastasis
    report += "5. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Yes:\n";
        report += "--- Number of suspicious lymph node: " + rln_num + "\n";

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

        report += "--- Location:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
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
    report += "6. Distant metastasis (In this study)\n";
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
    report += "7. Other findings:\n\n\n";

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
