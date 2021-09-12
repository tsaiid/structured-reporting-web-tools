import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/gastric.html');
}

import {join_checkbox_values, ajcc_template_with_parent} from './ajcc_common.js';

const AJCC8_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    'is': 'Carcinoma in situ: intraepithelial tumor without invasion of the lamina propria, high-grade dysplasia',
    '1': 'Tumor invades the lamina propria, muscularis mucosae, or submucosa',
    '1a': 'Tumor invades the lamina propria or muscularis mucosae',
    '1b': 'Tumor invades the submucosa',
    '2': 'Tumor invades the muscularis propria',
    '3': 'Tumor penetrates the subserosal connective tissue without invasion of the visceral peritoneum or adjacent structures',
    '4': 'Tumor invades the serosa (visceral peritoneum) or adjacent structures',
    '4a': 'Tumor invades the serosa (visceral peritoneum)',
    '4b': 'Tumor invades adjacent structures/organs',
};
const AJCC8_N = {
    'x': 'Regional lymph node(s) cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in one or two regional lymph nodes',
    '2': 'Metastasis in three to six regional lymph nodes',
    '3': 'Metastasis in seven or more regional lymph nodes',
    '3a': 'Metastasis in seven to 15 regional lymph nodes',
    '3b': 'Metastasis in 16 or more regional lymph nodes',
};
const AJCC8_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
};

function generate_report(){
    var t_stage = ["0"];
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
    $('.cb_tl:not(#cb_tl_others)').each(function(i){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });
    if ($('#cb_tl_others').is(':checked')) {
        report += "    [+] Others: " + $('#txt_tl_others').val() + "\n";
    } else {
        report += "    [ ] Others: ___\n";
    }

    report += "  - Size:";
    if ($('#cb_ts_nm').is(':checked') || !$('#txt_ts_len').val()) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (largest diameter)`;
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest diameter)`;
    }
    report += "\n\n";

    // Tumor invasion depth
    report += "3. Tumor invasion depth\n";
    $('input[name="radios_tid"]').each(function(){
        var item_str = ($(this).is(':checked') ? '[+] ' : '[-] ');
        report += "  " + item_str + $(this).next().text();
        if ($(this).val() == "4b") {
            report += ', location: ' + $('#txt_tid_loc').val();
        }
        report += "\n";
    });
    report += "\n";
    t_stage.push($('input[name="radios_tid"]:checked').val());

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes, number of suspicious lymph node: " + rln_num + ", and locations (specified as below):\n";
    $('.cb_rn:not("#cb_rn_others")').each(function(){
        report += "    [" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "\n";
    });
    if ($('#cb_rn_others').is(':checked')) {
        report += "    [+] Others: " + $('#txt_rn_others').val();
    } else {
        report += "    [ ] Others: ___";
    }
    report += "\n";

    if (has_rln) {
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
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes:\n";
    let has_nrn = $('.cb_dm_nrn:checked').length > 0;
    report += "    [" + (has_nrn ? "+" : " ") + "] Non-regional lymph nodes:\n      ";
    $('.cb_dm_nrn').each(function(){
        report += "[" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "  ";
    });
    report += "\n";
    let has_non_nrn_dm = $('.cb_dm:not(.cb_dm_nrn):checked').length > 0;
    report += "    [" + (has_non_nrn_dm ? "+" : " ") + "] Distant organ: ";
    report += (has_non_nrn_dm ? join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):checked')) : "___");
    if ($('#cb_dm_others').is(':checked')) {
        if ($('.cb_dm:not("#cb_dm_others, .cb_dm_nrn"):checked').length) {
            report += ', '
        }
        report += $('#txt_dm_others').val();
    }
    report += "\n\n";

    if (has_dm) {
        m_stage.push("1");
        //console.log(m_stage);
    }

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Gastric Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

    $('#reportModalLongTitle').html("Gastric Cancer Staging Form");
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
