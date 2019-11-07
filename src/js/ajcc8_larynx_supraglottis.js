import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/larynx_supraglottis.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_LARYNX_SUPRAGLOTTIS_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    'is': 'Tumor in situ.',
    '1': 'Tumor limited to one subsite of supraglottis with normal vocal cord mobility.',
    '2': 'Tumor invades mucosa of more than one adjacent subsite of supraglottis or glottis or region outside the supraglottis (e.g., mucosa of base of tongue,vallecula, medial wall of pyriform sinus) without fixation of the larynx.',
    '3': 'Tumor limited to larynx with vocal cord fixation and/or invades any of the following: postcricoid area, pre-epiglottic space, paraglottic space, and/or inner cortex of thyroid cartilage.',
    '4a': 'Moderately advanced local disease. Tumor invades through the thyroid cartilage and /or invades tissues beyond the larynx (e.g., trachea, soft tissues of neck including deep extrinsic muscle of the tongue, strap muscles, thyroid, or esophagus.',
    '4b': 'Very advanced local disease. Tumor invades prevertebral space, encases carotid artery, or invades mediastinal structures.',
};
const AJCC8_LARYNX_SUPRAGLOTTIS_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Metastasis in a single ipsilateral lymph node, ≤ 3 cm in greatest dimension and ENE(-).',
    '2': 'Metastasis in a single ipsilateral lymph node, > 3 cm but ≤ 6 cm in greatest dimension and ENE(-); or in bilateral or contralateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).',
    '2a': 'Metastasis in a single ipsilateral lymph node > 3 cm but ≤ 6 cm in greatest dimension and ENE(-).',
    '2b': 'Metastasis in multiple ipsilateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).',
    '2c': 'Metastasis in bilateral or contralateral lymph nodes, none > 6 cm in greatest dimension and ENE(-).',
    '3': 'Metastasis in a lymph node > 6 cm in greatest dimension and ENE(-) or metastasis in any node(s) and clinically overt ENE(+).',
    '3a': 'Metastasis in a lymph node >6 cm in greatest dimension and ENE(-).',
    '3b': 'Metastasis in any node(s) and clinically overt ENE(+).',
};
const AJCC8_LARYNX_SUPRAGLOTTIS_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis.',
};

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    // Protocol
    var report = `1. MR protocol
SEQUENCES:
- Axial T1WI and T2WI with fat suppression;
`;
    if ($('#cb_sp_cemr').is(':checked')) {
        report += '- Axial, coronal and sagittal post Gd-enhanced T1WI with fat suppression';
    } else {
        report += '- Axial, coronal and sagittal T1WI with fat suppression';
    }
    report += '\n\n';

    // Tumor location
    report += "2. Tumor location\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Not assessable";
    } else if ($('#cb_ts_no').is(':checked')) {
        report += "--- No evidence of primary tumor";
    } else if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n* ") + "\n";
        report += "Laterality: " + join_checkbox_values($('.cb_tl_lat:checked'));

        if ($('.cb_tl:checked').length > 1) {
            t_stage.push("2");
        } else {
            t_stage.push("1");
        }
    }
    report += "\n\n";

    // Tumor size
    report += "3. Tumor size\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Non-measurable";
        t_stage.push('x');
    } else if ($('#cb_ts_no').is(':checked')) {
        report += "--- No evidence of primary tumor";
    } else {
        let t_length = parseFloat($('#txt_ts_dia').val());
        report += "--- Size: " + t_length + " cm (largest diameter)\n";
    }
    report += "\n";

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
    let n_length = parseFloat($('#txt_rn_len').val());
    report += "5. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_rn_r:checked').length) {
            report += "* Right neck level: " + join_checkbox_values($('.cb_rn_r:checked')) + "\n";
        }
        if ($('.cb_rn_l:checked').length) {
            report += "* Left neck level: " + join_checkbox_values($('.cb_rn_l:checked')) + "\n";
        }
        report += "* Maximum size of the largest positive node: " + n_length + " cm.\n";
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_rn_r:not(:checked)').length) {
            report += "* Right neck level: " + join_checkbox_values($('.cb_rn_r:not(:checked)')) + "\n";
        }
        if ($('.cb_rn_l:not(:checked)').length) {
            report += "* Left neck level: " + join_checkbox_values($('.cb_rn_l:not(:checked)')) + "\n";
        }
    }
    report += "\n";
    if ($('.cb_rn:checked').length) {
        if ($('#cb_rn_ene').is(':checked')) {
            n_stage.push("3b");
        } else if (n_length > 6.0) {
            n_stage.push("3a");
        } else if ((   $('.cb_rn_r:checked').length && $('.cb_rn_l:checked').length)
                    || ($('#cb_tl_r').is(':checked') && $('.cb_rn_l:checked').length)
                    || ($('#cb_tl_l').is(':checked') && $('.cb_rn_r:checked').length)   ) {
            n_stage.push("2c");
        } else if (!$('#cb_rn_sin').is(':checked')) {
            n_stage.push("2b");
        } else if (n_length > 3.0) {
            n_stage.push("2a");
        } else {
            n_stage.push("1");
        }
    }

    // Distant metastasis
    report += "6. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
        m_stage.push("1");
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
    report += "7. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_LARYNX_SUPRAGLOTTIS_T[t];
    let n_str = AJCC8_LARYNX_SUPRAGLOTTIS_N[n];
    let m_str = AJCC8_LARYNX_SUPRAGLOTTIS_M[m];
    report += ajcc_template("Laryngeal Cancer (Supraglottis) Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Laryngeal Cancer (Supraglottis) Staging Form");
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
