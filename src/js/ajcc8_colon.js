import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/colon.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_COLON_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    'is': 'Carcinoma in situ, intramucosal carcinoma (involvement of lamina propria with no extension through muscularis mucosae).',
    '1': 'Tumor invades submucosa (through the muscularis mucosa but not into the muscularis propria).',
    '2': 'Tumor invades muscularis propria.',
    '3': 'Tumor invades through the muscularis propria into the perirectal tissues.',
    '4a': 'Tumor penetrates to the surface of the visceral peritoneum (including gross perforation of the bowel through tumor and continuous invasion of tumor through areas of inflammation to the surface of the visceral peritoneum).',
    '4b': 'Tumor directly invades or adheres to adjacent organs or structures.',
};
const AJCC8_COLON_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1a': 'Metastasis in 1 regional lymph node.',
    '1b': 'Metastasis in 2-3 regional lymph nodes.',
    '1c': 'Tumor deposit(s) in the subserosa, mesentery, or non-peritonealized pericolic or perirectal/mesorectal tissues without regional nodal metastasis.',
    '2a': 'Metastasis in 4 to 6 regional lymph nodes.',
    '2b': 'Metastasis in 7 or more regional lymph nodes.',
};
const AJCC8_COLON_M = {
    '0': 'No distant metastasis (in this study).',
    '1a': 'Metastasis confined to one site or organs is identified without peritoneal metastasis.',
    '1b': 'Metastases to two or more site or organs is identified without peritoneal metastasis.',
    '1c': 'Metastases to the peritoneal surface is identified alone or with other site or organ metastases.',
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
        report += "* Measurable: Length " + t_length + " cm";
        let t_thick = parseFloat($('#txt_ts_thick').val());
        if (t_thick) {
            report += ", Max thickness " + t_thick + " cm";
        }
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:";
        if ($('.cb_ti:not(.cb_ti_t4b):checked').length) {
            report += "\n* " + join_checkbox_values($('.cb_ti:not(.cb_ti_t4b):checked'), "\n* ");
        }
        if ($('.cb_ti_t4b:checked').length) {
            report += "\n* " + $('#txt_ti_others').val();
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
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var ti_array = [];
        if ($('.cb_ti_t1:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t1:not(:checked)')));
        }
        if ($('.cb_ti_t2:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t2:not(:checked)')));
        }
        if ($('.cb_ti_t3:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t3:not(:checked)')));
        }
        if ($('.cb_ti_t4a:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4a:not(:checked)')));
        }
        report += ti_array.join("\n") + "\n"
    }
    report += "\n";

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Yes:\n";
        report += "--- Number of suspicious lymph node: " + rln_num + "\n";

        if (rln_num >= 7) {
            n_stage.push("2b");
        } else if (rln_num >= 4) {
            n_stage.push("2a");
        } else if (rln_num >= 2) {
            n_stage.push("1b");
        } else if (rln_num >= 1) {
            n_stage.push("1a");
        } else {
            n_stage.push("0");
        }
        //console.log(n_stage);

        report += "--- Location:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
    } else {
        if ($('.cb_td:checked').length) {
            n_stage.push("1c");
        }
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
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
        if ($('.cb_dm_m1c:checked').length) {
            m_stage.push("1c");
        } else {
            if ($('.cb_dm_m1ab:checked').length == 1) {
                m_stage.push("1a");
            } else {
                m_stage.push("1b");
            }
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
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_COLON_T[t];
    let n_str = AJCC8_COLON_N[n];
    let m_str = AJCC8_COLON_M[m];
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
