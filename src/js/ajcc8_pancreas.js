import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/pancreas.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_PANCREAS_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    'is': 'Carcinoma in situ. This includes high-grade pancreatic intraepithelial neoplasia (PanIn-3), intraductal papillary mucinous neoplasm with high-grade dysplasia, intraductal tubulopapillary neoplasm with high-grade dysplasia, and mucinous cystic neoplasm with high-grade dysplasia.',
    '1': 'Tumor ≤2 cm in greatest dimension',
    '1a': 'Tumor ≤0.5 cm in greatest dimension',
    '1b': 'Tumor >0.5 cm and <1 cm in greatest dimension',
    '1c': 'Tumor 1–2 cm in greatest dimension',
    '2': 'Tumor >2 cm and ≤4 cm in greatest dimension',
    '3': 'Tumor >4 cm in greatest dimension',
    '4': 'Tumor involves celiac axis, superior mesenteric artery, and/or common hepatic artery, regardless of size',
};
const AJCC8_PANCREAS_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in one to three regional lymph nodes',
    '2': 'Metastasis in four or more regional lymph nodes',
};
const AJCC8_PANCREAS_M = {
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
Sagittal and Axial FSE T2WI
Axial FSE T1WI with FS, pre- and post- contrast
Axial T1WI with contrast, abdominal survey
(Coronal FSE T2WI)
(Axial T2WI, lower abdominal survey)`;
    } else {
        if ($('#cb_sp_ncct').is(':checked')) {
            report += `CT protocol
Contrast–enhanced axial imaging at arterial and venous phase
Slice thickness: 5 mm or less
Range: whole liver and pancreas at arterial phase, whole abdomen at venous phase
Coronal reconstruction at arterial phase and venous phase
Slice thickness: 5 mm or less`
        } else {
            report += `CT protocol
Unenhanced axial imaging
Slice thickness: 5 mm or less
Range: upper abdomen`;
        }
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
        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else if (t_length >= 1) {
            t_stage.push("1c");
        } else if (t_length > 0.5) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    }
    report += "\n\n";

    // Tumor invasion or encasement
    report += "3. Tumor invasion or encasement\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ") + "\n";

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
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Yes:\n";
        report += "--- Number: " + rln_num + "\n";

        if (rln_num >= 4) {
            n_stage.push("2");
        } else if (rln_num >= 1) {
            n_stage.push("1");
        } else {
            n_stage.push("0");
        }
        //console.log(n_stage);

        var pos_rn = new Set();
        if ($('.cb_tl_hn:checked').length) {
            $('.cb_rn_hn:checked').each(function(){
                pos_rn.add($(this).val());
            });
        }
        if ($('.cb_tl_bt:checked').length) {
            $('.cb_rn_bt:checked').each(function(){
                pos_rn.add($(this).val());
            });
        }
        report += "--- Location:\n";
        report += "* " + Array.from(pos_rn).join("\n* ") + "\n";
        report += "\n";
    }
    if ($('.cb_rn:not(:checked)').length) {
        var neg_rn = new Set();
        if ($('.cb_tl_hn:checked').length) {
            $('.cb_rn_hn:not(:checked)').each(function(){
                neg_rn.add($(this).val());
            });
        }
        if ($('.cb_tl_bt:checked').length) {
            $('.cb_rn_bt:not(:checked)').each(function(){
                neg_rn.add($(this).val());
            });
        }
        report += "--- No or Equivocal:\n";
        report += "* " + Array.from(neg_rn).join(", ") + "\n";
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
    let t_str = AJCC8_PANCREAS_T[t];
    let n_str = AJCC8_PANCREAS_N[n];
    let m_str = AJCC8_PANCREAS_M[m];
    report += ajcc_template("Pancreatic Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Pancreatic Cancer Staging Form");
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
