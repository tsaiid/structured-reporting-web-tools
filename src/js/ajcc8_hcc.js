import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/hcc.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_HCC_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Solitary tumor ≤2 cm, or >2 cm without vascular invasion',
    '1a': 'Solitary tumor ≤2 cm',
    '1b': 'Solitary tumor >2 cm without vascular invasion',
    '2': 'Solitary tumor >2 cm with vascular invasion, or multiple tumors, none >5 cm',
    '3': 'Multiple tumors, at least one of which is >5 cm',
    '4': 'Single tumor or multiple tumors of any size involving a major branch of the portal vein or hepatic vein, or tumor(s) with direct invasion of adjacent organs other than the gallbladder or with perforation of visceral peritoneum',
};
const AJCC8_HCC_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Regional lymph node metastasis',
};
const AJCC8_HCC_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
};

function generate_report(){
    var t_stage = ["0"];    // at least T1?
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `[+] CT scan  [ ] MRI`;
    } else {
        report += `[ ] CT scan  [+] MRI`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor location / size\n`;

    let txt_tl_num = $('#txt_tl_num').val();
    let tl_num = parseInt(txt_tl_num, 10);
    if (tl_num > 3 || isNaN(tl_num)) {
        txt_tl_num = 'multiple';
    }
    report += "  - Number (1,2,3 or multiple): " + txt_tl_num + "\n";

    let txt_tl_loc = $('#txt_tl_loc').val();
    report += "  - Location (segment or lobe): " + txt_tl_loc + "\n";

    let t_length = parseFloat($('#txt_ts_len').val());
    report += "  - Size:";
    if ($('#cb_ts_nm').is(':checked') || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (the largest tumor)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (the largest tumor)`;
    }
    report += "\n\n";

    // Tumor characteristics and associated liver features
    report += "3. Tumor characteristics and associated liver features\n";
    $('.cb_tc').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `  [${check_or_not}] ` + $(this).val();
        if ($(this).hasClass('has_txt')) {
            report += ", location: ";
            let loc_txt = $(this).parent().next().children('input:text').val();
            report += loc_txt ? loc_txt : "___";
        }
        report += "\n";
    });
    report += "\n";

    if ($('.cb_tc_t4:checked').length) {
        t_stage.push('4');
    } else if (tl_num == 1) {
        if (t_length > 2) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
    } else {
        if (t_length > 5) {
            t_stage.push('3');
        } else {
            t_stage.push('2');
        }
    }

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length;
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes, locations (specified as below):\n";
    $('.cb_rn:not("#cb_rn_others")').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + "\n";
    });
    if ($('#cb_rn_others').is(':checked')) {
        report += "    [+] Others: " + $('#txt_rn_others').val();
    } else {
        report += "    [ ] Others: ___";
    }
    if ($('.cb_rn:checked').length) {
        n_stage.push('1');
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location: ";
    if (has_dm) {
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'));
        }
        if ($('#cb_dm_others').is(':checked')) {
            if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
                report += ', '
            }
            report += $('#txt_dm_others').val();
        }

        m_stage.push("1");
        //console.log(m_stage);
    } else {
        report += "___";
    }
    report += "\n\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

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
