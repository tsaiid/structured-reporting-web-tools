import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/ccc_pbd.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_CCC_PBD_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    'is': 'Carcinoma in situ/high-grade dysplasia.',
    '1': 'Tumor confined to the bile duct, with extension up to the muscle layer or fibrous tissue.',
    '2': 'Tumor invades beyond the wall of the bile duct to surrounding adipose tissue, or tumor invades adjacent hepatic parenchyma.',
    '2a': 'Tumor invades beyond the wall of the bile duct to surrounding adipose tissue.',
    '2b': 'Tumor invades adjacent hepatic parenchyma.',
    '3': 'Tumor invades unilateral branches of the portal vein or hepatic artery.',
    '4': 'Tumor invades the main portal vein or its branches bilaterally, or the common hepatic artery; or unilateral second-order biliary radicals with contralateral portal vein or hepatic artery involvement.',
};
const AJCC8_CCC_PBD_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'One to three positive lymph nodes typically involving the hilar, cystic duct, common bile duct, hepatic artery, posterior pancreatoduodenal, and portal vein lymph nodes.',
    '2': 'Four or more positive lymph nodes from the sites described for N1.',
};
const AJCC8_CCC_PBD_M = {
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
Slice thickness: 5 mm or less
Range: upper abdomen
Unenhanced axial T1WI and T2WI
Magnetic Resonance Cholangiopancreatography (MRCP)
Dynamic contrast-enhanced axial T1WI with fat saturation, at arterial and portal venous phase
(Dynamic contrast-enhanced axial T1WI with fat saturation, at equilibrium phase)
(Diffusion-weighted sequences, axial image)`;
    } else {
        report += `CT protocol
Slice thickness: 5 mm or less
Range: upper abdomen
Unenhanced image, axial image
Dynamic contrast-enhanced axial image at arterial phase and portal venous phase
(Dynamic contrast-enhanced imaging at equilibrium phase)
(Whole abdomen survey at portal venous phase or equilibrium phase)
(Coronal reconstruction)`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor size\n`;

    let t_length = parseFloat($('#txt_ts_len').val());
    report += "--- Size: ";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "Non-measurable";
    } else {
        report += "Measurable: " + t_length + " cm (greatest dimension)" + "\n";
        //console.log(t_stage);
    }
    report += "--- Location: " + $('input[name="radio_tl"]:checked').val() + "\n";
    report += "\n";

    // Tumor characteristics and associated liver features
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ") + "\n";
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_ti:not(:checked)'), "\n* ") + "\n";
    }
    report += "\n";

    if ($('.cb_ti_t4:checked').length) {
        t_stage.push('4');
    } else if ($('.cb_ti_t3:checked').length) {
        t_stage.push('3');
    } else if ($('.cb_ti_t2b:checked').length) {
        t_stage.push('2b');
    } else if ($('.cb_ti_t2a:checked').length) {
        t_stage.push('2a');
    } else if ($('.cb_ti_t1:checked').length) {
        t_stage.push('1');
    }

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Numbers: " + rln_num + "\n";
        report += "--- Location:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ") + "\n";

        if (rln_num >= 4) {
            n_stage.push("2");
        } else if (rln_num >= 1) {
            n_stage.push("1");
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
    let t_str = AJCC8_CCC_PBD_T[t];
    let n_str = AJCC8_CCC_PBD_N[n];
    let m_str = AJCC8_CCC_PBD_M[m];
    report += ajcc_template("Cholangiocarcinoma: Perihilar Bile Duct", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Cholangiocarcinoma: Perihilar Bile Duct Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

$('.cb_rn, input[name="radio_rn"]').change(function() {
    if ($(this).parent().parent().find('.cb_rn:checked').length) {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", true);
    } else {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", false);
    }
    $(this).parent().parent().siblings().find('.cb_rn').prop('checked', false);
});

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
