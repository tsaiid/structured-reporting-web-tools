import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/gastric.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_GASTRIC_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    'is': 'Carcinoma in situ: Intraepithelial tumor without invasion of the lamina propria.',
    '1': 'Tumor invades lamina propria, muscularis mucosae, or submucosa.',
    '1a': 'Tumor invades lamina propria or muscularis mucosae.',
    '1b': 'Tumor invades submucosa.',
    '2': 'Tumor invades muscularis propria.',
    '3': 'Tumor penetrates subserosal connective tissue without invasion of visceral peritoneum or adjacent structures.',
    '4a': 'Tumor invades serosa (visceral peritoneum).',
    '4b': 'Tumor invades adjacent structures.',
};
const AJCC8_GASTRIC_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Metastasis in 1-2 regional lymph nodes.',
    '2': 'Metastasis in 3-6 regional lymph nodes.',
    '3a': 'Metastasis in 7-15 regional lymph nodes.',
    '3b': 'Metastasis in 16 or more regional lymph nodes.',
};
const AJCC8_GASTRIC_M = {
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
        report += `MR protocol
Sagittal and Axial FSE T2WI
Axial FSE T1WI with FS, pre- and post- contrast
Axial T1WI with contrast, abdominal survey
(Coronal FSE T2WI)
(Axial T2WI, lower abdominal survey)`;
    } else {
        report += `CT protocol
With contrast, range: whole abdomen, slice thickness <= 5mm`;
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
        report += "* Measurable: " + t_length + " cm (greatest diameter)";
    }
    report += "\n\n";

    // Tumor invasion depth
    report += "3. Tumor invasion depth\n";
    $('input[name="radios_tid"]').each(function(){
        var item_str = ($(this).is(':checked') ? '(+) ' : '(-) ');
        report += item_str + $(this).next().text();
        if ($(this).val() == "4b") {
            report += ', location: ' + $('#txt_tid_loc').val();
        }
        report += "\n";
    });
    report += "\n";
    t_stage.push($('input[name="radios_tid"]:checked').val());

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Yes:\n";
        report += "--- Number of suspicious lymph node: " + rln_num + "\n";

        if (rln_num >= 16) {
            n_stage.push("3b");
        } else if (rln_num >= 7) {
            n_stage.push("3a");
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
    let t_str = AJCC8_GASTRIC_T[t];
    let n_str = AJCC8_GASTRIC_N[n];
    let m_str = AJCC8_GASTRIC_M[m];
    report += ajcc_template("Colorectal Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Colorectal Cancer Staging Form");
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
