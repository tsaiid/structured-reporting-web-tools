import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/rcc.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_RCC_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1': 'Tumor ≤ 7 cm in greatest dimension, limited to the kidney.',
    '1a': 'Tumor ≤ 4 cm in greatest dimension, limited to the kidney.',
    '1b': 'Tumor > 4 cm but ≤ 7 cm in greatest dimension, limited to the kidney.',
    '2': 'Tumor > 7 cm in greatest dimension, limited to the kidney.',
    '2a': 'Tumor > 7 cm but ≤ 10 cm in greatest dimension, limited to the kidney.',
    '2b': 'Tumor > 10 cm, limited to the kidney.',
    '3': 'Tumor extends into major veins or perinephric tissues, but not into the ipsilateral adrenal gland and not beyond Gerota fascia.',
    '3a': 'Tumor extends into the renal vein or its segmental branches, or invades the pelvicalyceal system, or invades perirenal and/or renal sinus fat but not beyond Gerota fascia.',
    '3b': 'Tumor extends into the vena cava below the diaphragm.',
    '3c': 'Tumor extends into the vena cava above the diaphragm or invades the wall of the vena cava.',
    '4': 'Tumor invades beyond Gerota fascia (including contiguous extension into the ipsilateral adrenal gland).',
};
const AJCC8_RCC_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Metastasis in regional node(s).',
};
const AJCC8_RCC_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis.',
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
        report += `CT protocol
Without and with contrast medium at nephrographic phase
Axial section slice thickness/interval: 5/5mm
Coronal section slice thickness/interval: 5/5mm
Range: diaphragm to the pelvis cavity`;
    }
    report += "\n\n";

    // Tumor location / size
    report += "2. Tumor location / size\n";
    if ($('#cb_ts_na').is(':checked')) {
        report += "--- Not assessable";
    } else {
        report += "Location: ";
        if ($('.cb_tl:checked').length) {
            report += join_checkbox_values($('.cb_tl:checked')) + "\n";
        }
        let t_dia = parseFloat($('#txt_ts_dia').val());
        report += `Size: ${t_dia} cm (largest diameter of the biggest tumor)`;

        if (t_dia > 10) {
            t_stage.push('2b');
        } else if (t_dia > 7) {
            t_stage.push('2a');
        } else if (t_dia > 4) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('#cb_ti_na').is(':checked')) {
        report += "--- Not assessable\n";
    } else {
        if ($('.cb_ti:checked').length) {
            report += "--- Yes:\n";
            if ($('.cb_ti_t3a:checked').length) {
                report += "* " + join_checkbox_values($('.cb_ti_t3a:checked'), "\n* ") + "\n";
                t_stage.push("3a");
            }
            if ($('.cb_ti_t3bc:checked').length) {
                t_stage.push("3b");
                var ivc = [];
                if ($("input[name='rb_ti_ivc']:checked").length) {
                    ivc.push($("input[name='rb_ti_ivc']:checked").next().text());
                    t_stage.push($("input[name='rb_ti_ivc']:checked").val());
                }
                if ($('.cb_ti_t3c:checked').length) {
                    ivc.push($('.cb_ti_t3c:checked').next().text());
                    t_stage.push("3c");
                }
                report += "* IVC: " + ivc.join(", ") + "\n";
            }
            if ($('.cb_ti_t4:checked').length) {
                report += "* " + join_checkbox_values($('.cb_ti_t4:checked'), "\n* ");
                if ($('#cb_ti_others').is(':checked')) {
                    report += "\n* " + $('#txt_ti_others').val();
                }
                report += "\n";
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
        n_stage.push("1");
        //console.log(n_stage);
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
    let t_str = AJCC8_RCC_T[t];
    let n_str = AJCC8_RCC_N[n];
    let m_str = AJCC8_RCC_M[m];
    report += ajcc_template("Renal Cell Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Renal Cell Carcinoma Staging Form");
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
