import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/colon.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_COLON_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    'is': 'Carcinoma in situ, intramucosal carcinoma (involvement of lamina propria with no extension through muscularis mucosae)',
    '1': 'Tumor invades the submucosa (through the muscularis mucosa but not into the muscularis propria)',
    '2': 'Tumor invades the muscularis propria',
    '3': 'Tumor invades through the muscularis propria into pericolorectal tissues',
    '4': 'Tumor invades the visceral peritoneum or invades or adheres to adjacent organ or structure',
    '4a': 'Tumor invades through the visceral peritoneum (including gross perforation of the bowel through tumor and continuous invasion of tumor through areas of inflammation to the surface of the visceral peritoneum)',
    '4b': 'Tumor directly invades or adheres to adjacent organs or structures',
};
const AJCC8_COLON_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'One to three regional lymph nodes are positive (tumor in lymph nodes measuring ≥ 0.2 mm), or any number of tumor deposits are present and all identifiable lymph nodes are negative',
    '1a': 'One regional lymph node is positive',
    '1b': 'Two or three regional lymph nodes are positive',
    '1c': 'No regional lymph nodes are positive, but there are tumor deposits in the subserosa, mesentery or nonperitonealized pericolic, or perirectal/mesorectal tissues',
    '2': 'Four or more regional nodes are positive',
    '2a': 'Four to six regional lymph nodes are positive',
    '2b': 'Seven or more regional lymph nodes are positive',
};
const AJCC8_COLON_M = {
    '0': 'No distant metastasis by imaging, etc.; no evidence of tumor in distant sites or organs (This category is not assigned by pathologists.)',
    '1': 'Metastasis to one or more distant sites or organs or peritoneal metastasis is identified',
    '1a': 'Metastasis to one site or organ is identified without peritoneal metastasis',
    '1b': 'Metastasis to two or more sites or organs is identified without peritoneal metastasis',
    '1c': 'Metastasis to the peritoneal surface is identified alone or with other site or organ metastases',
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
    report += `2. Tumor location / size
  - Location:
    `;
    $('.cb_tl').each(function(i){
        report += "[ ] " + $(this).val() + "    ";
    });

    report += `
  - Size:`;
    if ($('#cb_ts_nm').is(':checked') || !$('#txt_ts_len').val()) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (largest diameter)`;
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        let t_thick = parseFloat($('#txt_ts_thick').val());
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (largest diameter)`;
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    report += "[" + ($('#cb_ti_na').is(':checked') ? "+" : " ") + "] Not assessable\n";
    $('.cb_ti:not(.cb_ti_t4b):not(#cb_ti_na)').each(function(){
        report += "[" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });
    if ($('.cb_ti_t4b').is(':checked')) {
        report += "[+] Adjacent organs: " + $('#txt_ti_others').val() + "\n";
    } else {
        report += "[ ] Adjacent organs: ___\n";
    }
    if ($('.cb_ti:checked').length) {
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
    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val();
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes, number of suspicious lymph node: " + rln_num + ", and locations:\n";
    $('.cb_rn').each(function(){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });

    if (has_rln) {
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
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location(s): ";
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
    } else {
        report += "___";
    }
    report += "\n\n";

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
