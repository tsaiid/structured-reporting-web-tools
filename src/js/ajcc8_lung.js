import {join_checkbox_values, ajcc_template} from './ajcc8_common';

const AJCC8_LUNG_T = {
    '1a': 'Tumor ≦1 cm in greatest dimension. A superficial, spreading tumor of any size whose invasive component is limited to the bronchial wall and may extend proximal to the main bronchus.',
    '1b': '1 cm < Tumor ≦2 cm in greatest dimension.',
    '1c': '2 cm < Tumor ≦3 cm in greatest dimension.',
    '2a': '3 cm < Tumor ≦4 cm in greatest dimension or tumor size cannot be determined but with features of: (1) Involves main bronchus, but without involvement of the carina; (2) Invades visceral pleura (PL1 or PL2); (3) Associated with atelectasis or obstructive pneumonitis that extends to the hilar region, involving part or anterior longitudinal ligament of the lung.',
    '2b': '4 cm < Tumor ≦5 cm in greatest dimension.',
    '3': '5 cm < Tumor ≦7 cm in greatest dimension or one that directly invades any of the following: parietal pleural (PL3), chest wall (including superior sulcus tumors), phrenic nerve, parietal pericardium; or separate tumor nodule(s) in the same lobe as the primary.',
    '4': 'Tumor > 7 cm or tumor of any size that invades any of the following: diaphragm, mediastinum, heart, great vessels, trachea, recurrent laryngeal nerve, esophagus, vertebral body, or carina; separate tumor nodule(s) in a different ipsilateral lobe.',
};
const AJCC8_LUNG_N = {
    '0': 'No regional lymph node metastasis.',
    '1': 'Metastasis in ipsilateral peribronchial and/or ipsilateral hilar lymph nodes and intrapulmonary nodes, including involvement by direct extension.',
    '2': 'Metastasis in ipsilateral mediastinal and/or subcarinal lymph node(s).',
    '3': 'Metastasis in contralateral mediastinal, contralateral hilar, ipsilateral or contralateral scalene, or supraclavicular lymph node(s).',
};
const AJCC8_LUNG_M = {
    '0': 'No distant metastasis (in this study).',
    '1a': 'Separate tumor nodule(s) in a contralateral lobe; tumor with pleural or pericardial nodules. or malignant pleural (or pericardial) effusion**.',
    '1b': 'Single extrathoracic metastasis in a single organ (including involvement of a single nonregional node)',
    '1c': 'Multiple extrathoracic metastasis in a single organ or in multiple organs',
};

function get_t_stage_by_size(t_size) {
    var t_stage;
    if (t_size <= 1) {
        t_stage = "1a";
    } else if (t_size <= 2) {
        t_stage = "1b";
    } else if (t_size <= 3) {
        t_stage = "1c";
    } else if (t_size <= 4) {
        t_stage = "2a";
    } else if (t_size <= 5) {
        t_stage = "2b";
    } else if (t_size <= 7) {
        t_stage = "3";
    } else {
        t_stage = "4";
    }
    return t_stage;
}

function generate_report(){
    var t_stage = ["0"];
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
    report += "2. Tumor location / size\n";
    if ($('.cb_tp_tl:checked').length) {
        report += "--- Location: " + join_checkbox_values($('.cb_tp_tl:checked'));
        if ($('#cb_tp_tl_others:checked').length) {
            report += $('#txt_tp_tl_others').val();
        }
        report += "\n";
    }

    // Tumor size
    report += "--- Size: ";
    if ($('#cb_tp_ts_nm').is(':checked')) {
        report += "Non-measurable";
    } else {
        var t_size = parseFloat($('#txt_tp_ts_diameter').val());
        report += t_size + " cm";
        t_stage.push(get_t_stage_by_size(t_size));
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
        report += "\n";

        if ($('.cb_ti_t2:checked').length) {
            t_stage.push("2a");
        }
        if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }
        if ($('.cb_ti_t4:checked').length) {
            t_stage.push("4");
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
        if ($('.cb_ti_t4:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4:not(:checked)')));
        }
        report += ti_array.join("\n") + "\n"
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";

        if ($('.cb_rn_n1:checked').length) {
            n_stage.push("1");
        }
        if ($('.cb_rn_n2:checked').length) {
            n_stage.push("2");
        }
        if ($('.cb_rn_n3:checked').length) {
            n_stage.push("3");
        }
        //console.log(n_stage);
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var rn_array = [];
        if ($('.cb_rn_n1:not(:checked)').length) {
            rn_array.push("* " + join_checkbox_values($('.cb_rn_n1:not(:checked)')));
        }
        if ($('.cb_rn_n2:not(:checked)').length) {
            rn_array.push("* " + join_checkbox_values($('.cb_rn_n2:not(:checked)')));
        }
        if ($('.cb_rn_n3:not(:checked)').length) {
            rn_array.push("* " + join_checkbox_values($('.cb_rn_n3:not(:checked)')));
        }
        report += rn_array.join("\n") + "\n"
    }
    /*
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_rn:not(:checked)'), "\n* ");
        report += "\n";
    }
    */
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_dm:checked'), "\n* ");
        if ($('.cb_dm_m1bc:checked').length == 1 && $('#cb_dm_m1b').is(':checked')) {
            report += " (single metastasis in a single organ)";
        }
        if ($('#cb_dm_others:checked').length) {
            report += $('#txt_dm_others').val();
        }
        report += "\n";
        report += "\n";

        if ($('.cb_dm_m1a:checked').length) {
            m_stage.push("1a");
        }
        if ($('.cb_dm_m1bc:checked').length == 1 && $('#cb_dm_m1b').is(':checked')) {
            m_stage.push("1b");
        }
        if ($('.cb_dm_m1bc:checked').length > 1 || $('.cb_dm_m1bc:checked').length && !$('#cb_dm_m1b').is(':checked')) {
            m_stage.push("1c");
        }
        console.log(m_stage);
    } else {
        report += "* No distant metastasis in the scanned range.\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    var t = t_stage.sort()[t_stage.length-1];
    var n = n_stage.sort()[n_stage.length-1];
    var m = m_stage.sort()[m_stage.length-1];
    var t_str = AJCC8_LUNG_T[t];
    var n_str = AJCC8_LUNG_N[n];
    var m_str = AJCC8_LUNG_M[m];
    report += ajcc_template("Lung Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Lung Cancer Staging Form");
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
        var report_title = $("#reportModalLongTitle").text();
        var report_body = $("#reportModalBody pre code").text();
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
