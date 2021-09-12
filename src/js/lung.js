import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/lung.html');
}

import {join_checkbox_values, ajcc_template_with_parent} from './ajcc_common.js';

const AJCC8_T = {
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
const AJCC8_N = {
    'x': 'Regional lymph nodes cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '1': 'Metastasis in ipsilateral peribronchial and/or ipsilateral hilar lymph nodes and intrapulmonary nodes, including involvement by direct extension',
    '2': 'Metastasis in ipsilateral mediastinal and/or subcarinal lymph node(s)',
    '3': 'Metastasis in contralateral mediastinal, contralateral hilar, ipsilateral or contralateral scalene, or supraclavicular lymph node(s)',
};
const AJCC8_M = {
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
    report += `2. Tumor location / Size
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
    let tmp_t = parseInt(t_stage.sort()[t_stage.length-1]);
    let t1_inv_check = (tmp_t == 1 ? "+" : " ");
    let t1_check  = (t_size <= 3 ? "+" : " ");
    let t1a_check = (t_size <= 1 ? "+" : " ");
    let t1b_check = (t_size <= 2 && t_size > 1 ? "+" : " ");
    let t1c_check = (t_size <= 3 && t_size > 2 ? "+" : " ");
    let t2_check  = (t_size > 3 && t_size <= 5 ? "+" : " ");
    let t2a_check = (t_size > 3 && t_size <= 4 ? "+" : " ");
    let t2b_check = (t_size > 4 && t_size <= 5 ? "+" : " ");
    let t2_mb_check = ($('#cb_tp_ti_mb').is(':checked') ? "+" : " ");
    let t2_vp_check = ($('#cb_tp_ti_vp').is(':checked') ? "+" : " ");
    let t2_fa_check = ($('#cb_tp_ti_fa').is(':checked') ? "+" : " ");
    let t3_check  = (t_size > 5 && t_size <= 7 ? "+" : " ");
    let t3_pp_check = ($('#cb_tp_ti_pp').is(':checked') ? "+" : " ");
    let t3_cw_check = ($('#cb_tp_ti_cw').is(':checked') ? "+" : " ");
    let t3_pn_check = ($('#cb_tp_ti_pn').is(':checked') ? "+" : " ");
    let t3_pc_check = ($('#cb_tp_ti_pc').is(':checked') ? "+" : " ");
    let t3_sln_check = ($('#cb_tp_ti_sln').is(':checked') ? "+" : " ");
    let t4_check  = (t_size > 7 ? "+" : " ");
    let t4_men_check = ($('#cb_tp_ti_men').is(':checked') ? "+" : " ");
    let t4_h_check = ($('#cb_tp_ti_h').is(':checked') ? "+" : " ");
    let t4_gv_check = ($('#cb_tp_ti_gv').is(':checked') ? "+" : " ");
    let t4_tr_check = ($('#cb_tp_ti_tr').is(':checked') ? "+" : " ");
    let t4_rln_check = ($('#cb_tp_ti_rln').is(':checked') ? "+" : " ");
    let t4_eso_check = ($('#cb_tp_ti_eso').is(':checked') ? "+" : " ");
    let t4_vb_check = ($('#cb_tp_ti_vb').is(':checked') ? "+" : " ");
    let t4_car_check = ($('#cb_tp_ti_car').is(':checked') ? "+" : " ");
    let t4_sdn_check = ($('#cb_tp_ti_sdn').is(':checked') ? "+" : " ");
    report += `3. Tumor invasion
    T1: [${t1_check}] Tumor <= 3 cm
            [${t1a_check}] T1a: Tumor <= 1 cm
            [${t1b_check}] T1b: 1 cm < Tumor <= 2 cm
            [${t1c_check}] T1c: 2 cm < Tumor <= 3 cm
        [${t1_inv_check}] Surrounded by lung or visceral pleura
        [${t1_inv_check}] Not more proximal than lobar bronchus
    T2: [${t2_check}] 3 cm < Tumor <= 5 cm
            [${t2a_check}] T2a: 3 cm < Tumor <= 4 cm
            [${t2b_check}] T2b: 4 cm < Tumor <= 5 cm
        [${t2_mb_check}] Main bronchus        [${t2_vp_check}] Visceral pleura
        [${t2_fa_check}] Atelectasis to hilum (focal or total)
    T3: [${t3_check}] 5 cm < Tumor <= 7 cm
        [${t3_pp_check}] Parietal pleura      [${t3_cw_check}] Chest wall
        [${t3_pn_check}] Phrenic nerve        [${t3_pc_check}] Parietal pericardium
        [${t3_sln_check}] Separate tumor nodule(s) in same lobe
    T4: [${t4_check}] Tumor > 7 cm
        [${t4_men_check}] Mediastinum          [${t4_h_check}] Heart                        [${t4_gv_check}] Great vessels
        [${t4_tr_check}] Trachea              [${t4_rln_check}] Recurrent laryngeal nerve    [${t4_eso_check}] Esophagus
        [${t4_vb_check}] Vertebral body       [${t4_car_check}] Carina
        [${t4_sdn_check}] Separate tumor nodule(s) in a different ipsilateral lobe

`;

    // calculate T stage
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

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let rn_no_check = !has_rln ? "+" : " ";
    let rn_yes_check = has_rln ? "+" : " ";
    let rn_ip_check = $('#cb_rn_ip').is(':checked') ? "+" : " ";
    let rn_ih_check = $('#cb_rn_ih').is(':checked') ? "+" : " ";
    let rn_ii_check = $('#cb_rn_ii').is(':checked') ? "+" : " ";
    let rn_im_check = $('#cb_rn_im').is(':checked') ? "+" : " ";
    let rn_sbc_check = $('#cb_rn_sbc').is(':checked') ? "+" : " ";
    let rn_cm_check = $('#cb_rn_cm').is(':checked') ? "+" : " ";
    let rn_ch_check = $('#cb_rn_ch').is(':checked') ? "+" : " ";
    let rn_ics_check = $('#cb_rn_ics').is(':checked') ? "+" : " ";
    let rn_spc_check = $('#cb_rn_spc').is(':checked') ? "+" : " ";
    report += `4. Regional nodal metastasis
    [${rn_no_check}] No or Equivocal
    [${rn_yes_check}] Yes, location:
        N1: [${rn_ip_check}] Ipsilateral peribronchial                [${rn_ih_check}] Ipsilateral hilar
            [${rn_ii_check}] Ipsilateral intrapulmonary
        N2: [${rn_im_check}] Ipsilateral mediastinal                  [${rn_sbc_check}] Subcarinal
        N3: [${rn_cm_check}] Contralateral mediastinal                [${rn_ch_check}] Contralateral hilar
            [${rn_ics_check}] Ipsilateral or contralateral scalene
            [${rn_spc_check}] Ipsilateral or contralateral supraclavicular

`;

    // calculate N stage
    if (has_rln) {
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

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    let has_dm_m1bc = $('.cb_dm_m1bc:checked').length > 0;
    let dm_no_check = !has_dm ? "+" : " ";
    let dm_yes_check = has_dm ? "+" : " ";
    let dm_scn_check = $('#cb_dm_scn').is(':checked') ? "+" : " ";
    let dm_pn_check = $('#cb_dm_pn').is(':checked') ? "+" : " ";
    let dm_pcn_check = $('#cb_dm_pcn').is(':checked') ? "+" : " ";
    let dm_pe_check = $('#cb_dm_pe').is(':checked') ? "+" : " ";
    let dm_pce_check = $('#cb_dm_pce').is(':checked') ? "+" : " ";
    let txt_dm_et = "";
    if (has_dm_m1bc) {
        if ($('.cb_dm_m1bc:not("#cb_dm_others"):checked').length) {
            txt_dm_et += join_checkbox_values($('.cb_dm_m1bc:not("#cb_dm_others"):checked'));
        }
        if ($('#cb_dm_others').is(':checked')) {
            if ($('.cb_dm_m1bc:not("#cb_dm_others"):checked').length) {
                txt_dm_et += ', '
            }
            txt_dm_et += $('#txt_dm_others').val();
        }
    } else {
        txt_dm_et += "___";
    }
    let dm_m1b_check = ($('.cb_dm_m1bc:checked').length == 1 && $('#cb_dm_m1b').is(':checked') ? "+" : " ");
    let dm_m1c_check = ($('.cb_dm_m1bc:checked').length > 1 || $('.cb_dm_m1bc:checked').length && !$('#cb_dm_m1b').is(':checked') ? "+" : " ");

    report += `5. Distant metastasis (In this study)
    [${dm_no_check}] No or Equivocal
    [${dm_yes_check}] Yes, location:
        Thoracic: (M1a)
            [${dm_scn_check}] Separate tumor nodule(s) in a contralateral lobe
            [${dm_pn_check}] Pleural nodules                  [${dm_pcn_check}] Pericardial nodules
            [${dm_pe_check}] Malignant pleural effusion       [${dm_pce_check}] Malignant pericardial effusion
        Extrathoracic: ${txt_dm_et}
        [${dm_m1b_check}] M1b: Single extrathoracic metastasis (Single metastasis in single organ)
        [${dm_m1c_check}] M1c: Multiple extrathoracic metastases (multiple metastases in single organ or metastases in multiple organs)

`;

    // calculate M stage
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

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    var t = t_stage.sort()[t_stage.length-1];
    var n = n_stage.sort()[n_stage.length-1];
    var m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Lung Carcinoma", t, AJCC8_T, n, AJCC8_N, m, AJCC8_M);

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
