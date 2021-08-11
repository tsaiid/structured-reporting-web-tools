import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/lung.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_LUNG_T = {
    'x': 'Primary tumor cannot be assessed, or tumor proven by the presence of malignant cells in sputum or bronchial washings but not visualized by imaging or bronchoscopy',
    '0': 'No evidence of primary tumor',
    'is': 'Carcinoma in situ; Squamous cell carcinoma in situ (SCIS); Adenocarcinoma in situ (AIS): adenocarcinoma with pure lepidic pattern, ≤3 cm in greatest dimension',
    '1': 'Tumor ≤3 cm in greatest dimension, surrounded by lung or visceral pleura, without bronchoscopic evidence of invasion more proximal than the lobar bronchus (i.e., not in the main bronchus)',
    '1mi': 'Minimally invasive adenocarcinoma: adenocarcinoma (≤3 cm in greatest dimension) with a predominantly lepidic pattern and ≤5 mm invasion in greatest dimension',
    '1a': 'Tumor ≤1 cm in greatest dimension. A superficial, spreading tumor of any size whose invasive component is limited to the bronchial wall and may extend proximal to the main bronchus also is classified as T1a, but these tumors are uncommon',
    '1b': 'Tumor >1 cm but ≤2 cm in greatest dimension',
    '1c': 'Tumor >2 cm but ≤3 cm in greatest dimension',
    '2': 'Tumor >3 cm but ≤5 cm or having any of the following features: Involves the main bronchus regardless of distance to the carina, but without involvement of the carina; Invades visceral pleura (PL1 or PL2); Associated with atelectasis or obstructive pneumonitis that extends to the hilar region, involving part or all of the lung; T2 tumors with these features are classified as T2a if ≤4 cm or if the size cannot be determined and T2b if >4 cm but ≤5 cm.',
    '2a': 'Tumor >3 cm but ≤4 cm in greatest dimension',
    '2b': 'Tumor >4 cm but ≤5 cm in greatest dimension',
    '3': 'Tumor >5 cm but ≤7 cm in greatest dimension or directly invading any of the following: parietal pleura (PL3), chest wall (including superior sulcus tumors), phrenic nerve, parietal pericardium; or separate tumor nodule(s) in the same lobe as the primary',
    '4': 'Tumor >7 cm or tumor of any size invading one or more of the following: diaphragm, mediastinum, heart, great vessels, trachea, recurrent laryngeal nerve, esophagus, vertebral body, or carina; separate tumor nodule(s) in an ipsilateral lobe different from that of the primary',
};
const AJCC8_LUNG_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in ipsilateral peribronchial and/or ipsilateral hilar lymph nodes and intrapulmonary nodes, including involvement by direct extension',
    '2': 'Metastasis in ipsilateral mediastinal and/or subcarinal lymph node(s)',
    '3': 'Metastasis in contralateral mediastinal, contralateral hilar, ipsilateral or contralateral scalene, or supraclavicular lymph node(s)',
};
const AJCC8_LUNG_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis',
    '1a': 'Separate tumor nodule(s) in a contralateral lobe; tumor with pleural or pericardial nodules or malignant pleural or pericardial effusion. Most pleural (pericardial) effusions with lung cancer are a result of the tumor. In a few patients, however, multiple microscopic examinations of pleural (pericardial) fluid are negative for tumor, and the fluid is nonbloody and not an exudate. If these elements and clinical judgment dictate that the effusion is not related to the tumor, the effusion should be excluded as a staging descriptor.',
    '1b': 'Single extrathoracic metastasis in a single organ (including involvement of a single nonregional node)',
    '1c': 'Multiple extrathoracic metastases in a single organ or in multiple organs',
};

function get_t_stage_by_size(t_size) {
    var t_stage;
    if (isNaN(t_size)) {
        t_stage = "x";
    } else if (t_size === 0) {
        t_stage = "0";
    } else if (t_size <= 1) {
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
    var t_stage = [];
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

    // Tumor location
    report += `2. Tumor location / size
  - Location:
    `;
    $('.cb_tp_tl:not("#cb_tp_tl_others")').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `[${check_or_not}] ` + $(this).val() + "  ";
    });
    report += "\n";
    if ($('#cb_tp_tl_others').is(':checked')) {
        report += "    [+] Other: " + $('#txt_tp_tl_others').val();
    } else {
        report += "    [ ] Other: ___";
    }
    report += "\n";

    // Tumor size
    let t_size = parseFloat($('#txt_tp_ts_diameter').val());
    report += "  - Size: ";
    if ($('#cb_tp_ts_nm').is(':checked') || !t_size) {
        report += `
    [ ] Measurable: ___ cm (greatest dimension)
    [+] Non-measurable`;
    } else {
        report += `
    [+] Measurable: ${t_size} cm (greatest dimension)
    [ ] Non-measurable`;
    }
    report += "\n\n";

    // Tumor invasion
    if ($('#cb_tp_ts_nm').is(':checked')) {
        t_stage.push("x");
    } else {
        t_stage.push(get_t_stage_by_size(t_size));
        if ($('.cb_ti_t4:checked').length) {
            t_stage.push("4");
        } else if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        } else if ($('.cb_ti_t2:checked').length) {
            t_stage.push("2");
        }
    }
    report += "3. Tumor invasion\n";
    report += "  T1:";
    let tmp_t = parseInt(t_stage.sort()[t_stage.length-1]);
    let check_t1_inv = (tmp_t == 1 ? "+" : " ");
    let check_t1  = (t_size <= 3 ? "+" : " ");
    let check_t1a = (t_size <= 1 ? "+" : " ");
    let check_t1b = (t_size <= 2 && t_size > 1 ? "+" : " ");
    let check_t1c = (t_size <= 3 && t_size > 2 ? "+" : " ");
    report += `
    [${check_t1}] Tumor <= 3 cm
      [${check_t1a}] Tumor <= 1 cm
      [${check_t1b}] 1 cm < Tumor <= 2 cm
      [${check_t1c}] 2 cm < Tumor <= 3 cm
    [${check_t1_inv}] Surrounded by lung or visceral pleura
    [${check_t1_inv}] Not more proximal than lobar bronchus`;
    report += "\n";
    report += "  T2:";
    let check_t2  = (t_size > 3 && t_size <= 5 ? "+" : " ");
    let check_t2a = (t_size > 3 && t_size <= 4 ? "+" : " ");
    let check_t2b = (t_size > 4 && t_size <= 5 ? "+" : " ");
    report += `
    [${check_t2}] 3 cm < Tumor <= 5 cm
      [${check_t2a}] 3 cm < Tumor <= 4 cm
      [${check_t2b}] 4 cm < Tumor <= 5 cm`;
    report += "\n";
    $('.cb_ti_t2').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "  T3:";
    let check_t3  = (t_size > 5 && t_size <= 7 ? "+" : " ");
    report += `
    [${check_t3}] 5 cm < Tumor <= 7 cm`;
    report += "\n";
    $('.cb_ti_t3').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "  T4:";
    let check_t4  = (t_size > 7 ? "+" : " ");
    report += `
    [${check_t4}] Tumor > 7 cm`;
    report += "\n";
    $('.cb_ti_t4').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, location: \n";
    report += "    N1:\n";
    $('.cb_rn_n1').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `      [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "    N2:\n";
    $('.cb_rn_n2').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `      [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "    N3:\n";
    $('.cb_rn_n3').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `      [${check_or_not}] ` + $(this).val() + '\n';
    });
    if ($('.cb_rn:checked').length) {
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
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location:\n";
    report += "    Thoracic: (M1a)\n";
    $('.cb_dm_m1a').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `      [${check_or_not}] ` + $(this).val() + '\n';
    });
    report += "    Extrathoracic: ";
    if ($('.cb_dm_m1bc:checked').length) {
        if ($('.cb_dm_m1bc:not("#cb_dm_others"):checked').length) {
            report += join_checkbox_values($('.cb_dm_m1bc:not("#cb_dm_others"):checked'));
        }
        if ($('#cb_dm_others').is(':checked')) {
            if ($('.cb_dm_m1bc:not("#cb_dm_others"):checked').length) {
                report += ', '
            }
            report += $('#txt_dm_others').val();
        }
    } else {
        report += "___";
    }
    report += "\n";
    if (has_dm) {
        if ($('.cb_dm_m1a:checked').length) {
            m_stage.push("1a");
        }
        if ($('.cb_dm_m1bc:checked').length == 1 && $('#cb_dm_m1b').is(':checked')) {
            m_stage.push("1b");
        }
        if ($('.cb_dm_m1bc:checked').length > 1 || $('.cb_dm_m1bc:checked').length && !$('#cb_dm_m1b').is(':checked')) {
            m_stage.push("1c");
        }
        //console.log(m_stage);
    }
    let check_m1b = ($('.cb_dm_m1bc:checked').length == 1 && $('#cb_dm_m1b').is(':checked') ? "+" : " ");
    let check_m1c = ($('.cb_dm_m1bc:checked').length > 1 || $('.cb_dm_m1bc:checked').length && !$('#cb_dm_m1b').is(':checked') ? "+" : " ");
    report += `      M1b: [${check_m1b}] Single extrathoracic metastasis (Single metastasis in single organ)\n`;
    report += `      M1c: [${check_m1c}] Multiple extrathoracic metastases (multiple metastases in single organ or metastases in multiple organs)\n`;
    report += "\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

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
