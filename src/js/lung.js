import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/lung.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor surrounded by lung or visceral pleura, or in a lobar or more peripheral bronchus'],
    ['1mi', 'Minimally invasive adenocarcinoma'],
    ['1a', 'Tumor ≤1 cm in greatest dimension'],
    ['1b', 'Tumor >1 cm but ≤2 cm in greatest dimension'],
    ['1c', 'Tumor >2 cm but ≤3 cm in greatest dimension'],
    ['2', 'Tumor with any of the following features:'],
    ['2a', 'tumor >3 cm but ≤4 cm in greatest dimension; invades visceral pleura; invades an adjacent lobe; involves main bronchus (up to but not including the carina) or is associated with atelectasis or obstructive pneumonitis extending to the hilar region, involving either part of or the entire lung'],
    ['2b', 'Tumor >4 cm but ≤5 cm in greatest dimension'],
    ['3', 'Tumor with any of the following features: tumor >5 cm but ≤7 cm in greatest dimension; invades parietal pleura or chest wall; invades pericardium, phrenic nerve, or azygos vein; invades thoracic nerve roots (i.e. T1, T2) or stellate ganglion; separate tumor nodule(s) in the same lobe as the primary'],
    ['4', 'Tumor with any of the following features: tumor >7 cm in greatest dimension; invades mediastinum, thymus, trachea, carina, recurrent laryngeal nerve, vagus nerve, esophagus or diaphragm; invades heart, great vessels (aorta, superior/inferior vena cava, intrapericardial pulmonary arteries/veins), supra-aortic arteries, or brachiocephalic veins; invades subclavian vessels, vertebral body, lamina, spinal canal, cervical nerve roots, or brachial plexus (i.e. trunks, divisions, cords, or terminal nerves); separate tumor nodule(s) in a diffeerent ipsilateral lobe than that of the primary'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in ipsilateral peribronchial and/or ipsilateral hilar lymph nodes and intrapulmonary nodes, including involvement by direct extension'],
    ['2', 'Metastasis in ipsilateral mediastinal and/or subcarinal lymph node(s)'],
    ['2a', 'Single N2 station involvement'],
    ['2b', 'Multiple N2 station involvement'],
    ['3', 'Metastasis in contralateral mediastinal, contralateral hilar, ipsilateral or contralateral scalene, or supraclavicular lymph node(s)'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis'],
    ['1', 'Distant metastasis'],
    ['1a', 'Tumor with pleural or pericardial nodules or malignant pleural or pericardial effusions, separate tumor nodule(s) in a contralateral lobe'],
    ['1b', 'Single extrathoracic metastasis in a single organ system'],
    ['1c', 'Multiple extrathoracic metastases'],
    ['1c1', 'Multiple extrathoracic metastases in a single organ system'],
    ['1c2', 'Multiple extrathoracic metastases in multiple organ systems'],
]);

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
    let t2_check  = (t_size > 3 && t_size) || ($('.cb_ti_t2a:checked').length > 0) ? "+" : " ";
    let t2a_check = (t_size > 3 && t_size <= 4) || ($('.cb_ti_t2a:checked').length > 0) ? "+" : " ";
    let t2b_check = (t_size > 4 && t_size <= 5 ? "+" : " ");
    let t2a_mb_check = ($('#cb_tp_ti_mb').is(':checked') ? "+" : " ");
    let t2a_vp_check = ($('#cb_tp_ti_vp').is(':checked') ? "+" : " ");
    let t2a_al_check = ($('#cb_tp_ti_al').is(':checked') ? "+" : " ");
    let t2a_fa_check = ($('#cb_tp_ti_fa').is(':checked') ? "+" : " ");
    let t3_check  = (t_size > 5 && t_size <= 7 ? "+" : " ");
    let t3_pp_check = ($('#cb_tp_ti_pp').is(':checked') ? "+" : " ");
    let t3_cw_check = ($('#cb_tp_ti_cw').is(':checked') ? "+" : " ");
    let t3_pc_check = ($('#cb_tp_ti_pc').is(':checked') ? "+" : " ");
    let t3_pn_check = ($('#cb_tp_ti_pn').is(':checked') ? "+" : " ");
    let t3_av_check = ($('#cb_tp_ti_av').is(':checked') ? "+" : " ");
    let t3_tnr_check = ($('#cb_tp_ti_tnr').is(':checked') ? "+" : " ");
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
    let t4_thy_check = ($('#cb_tp_ti_thy').is(':checked') ? "+" : " ");
    let t4_vn_check = ($('#cb_tp_ti_vn').is(':checked') ? "+" : " ");
    let t4_dia_check = ($('#cb_tp_ti_dia').is(':checked') ? "+" : " ");
    let t4_saa_check = ($('#cb_tp_ti_saa').is(':checked') ? "+" : " ");
    let t4_bcv_check = ($('#cb_tp_ti_bcv').is(':checked') ? "+" : " ");
    let t4_scv_check = ($('#cb_tp_ti_scv').is(':checked') ? "+" : " ");
    let t4_l_check = ($('#cb_tp_ti_l').is(':checked') ? "+" : " ");
    let t4_sc_check = ($('#cb_tp_ti_sc').is(':checked') ? "+" : " ");
    let t4_cnr_check = ($('#cb_tp_ti_cnr').is(':checked') ? "+" : " ");
    let t4_bp_check = ($('#cb_tp_ti_bp').is(':checked') ? "+" : " ");
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
                [${t2a_mb_check}] Main bronchus        [${t2a_vp_check}] Visceral pleura
                [${t2a_al_check}] Adjacent lobe        [${t2a_fa_check}] Atelectasis to hilum (focal or total)
            [${t2b_check}] T2b: 4 cm < Tumor <= 5 cm
    T3: [${t3_check}] 5 cm < Tumor <= 7 cm
        [${t3_pp_check}] Parietal pleura      [${t3_cw_check}] Chest wall     [${t3_pc_check}] Pericardium
        [${t3_pn_check}] Phrenic nerve        [${t3_av_check}] Pericardium
        [${t3_tnr_check}] Thoracic nerve roots or stellate ganglion
        [${t3_sln_check}] Separate tumor nodule(s) in same lobe
    T4: [${t4_check}] Tumor > 7 cm
        [${t4_men_check}] Mediastinum          [${t4_thy_check}] Thymus                       [${t4_tr_check}] Trachea
        [${t4_car_check}] Carina               [${t4_rln_check}] Recurrent laryngeal nerve    [${t4_vn_check}] Vagus nerve
        [${t4_eso_check}] Esophagus            [${t4_dia_check}] Diaphragm                    [${t4_h_check}] Heart
        [${t4_gv_check}] Great vessels        [${t4_saa_check}] Supra-aortic arteries        [${t4_bcv_check}] Brachiocephalic vein
        [${t4_scv_check}] Subclavian vessels   [${t4_vb_check}] Vertebral body               [${t4_l_check}] Lamina
        [${t4_sc_check}] Spinal canal         [${t4_cnr_check}] Cervical nerve roots         [${t4_bp_check}] Brachial plexus
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
    let rn_n2a_check = $('.cb_rn_n2:checked').length && $('#radio_n2a').is(':checked') ? "+" : " ";
    let rn_n2b_check = $('.cb_rn_n2:checked').length && $('#radio_n2b').is(':checked') ? "+" : " ";
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
            (${rn_n2a_check}) N2a: Single N2 station involvement
            (${rn_n2b_check}) N2b: Multiple N2 station involvement
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
            let rn_n2a_val = $('input[name="radio_n2"]:checked').val();
            n_stage.push(rn_n2a_val);
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
    let is_dm_m1c = $('.cb_dm_m1bc:checked').length > 1 || $('.cb_dm_m1bc:checked').length && !$('#cb_dm_m1b').is(':checked');
    let dm_m1c_check = (is_dm_m1c ? "+" : " ");
    let dm_m1c12_val = $('input[name="radio_m1c"]:checked').val();
    let dm_m1c1_check = is_dm_m1c && (dm_m1c12_val === '1c1' || $('.cb_dm_m1bc:checked').length == 1) ? "+" : " ";
    let dm_m1c2_check = is_dm_m1c && $('.cb_dm_m1bc:checked').length > 1 && dm_m1c12_val === '1c2' ? "+" : " ";

    report += `5. Distant metastasis (In this study)
    [${dm_no_check}] No or Equivocal
    [${dm_yes_check}] Yes, location:
        Thoracic: (M1a)
            [${dm_scn_check}] Separate tumor nodule(s) in a contralateral lobe
            [${dm_pn_check}] Pleural nodules                  [${dm_pcn_check}] Pericardial nodules
            [${dm_pe_check}] Malignant pleural effusion       [${dm_pce_check}] Malignant pericardial effusion
        Extrathoracic: ${txt_dm_et}
        [${dm_m1b_check}] M1b: Single extrathoracic metastasis (Single metastasis in single organ)
        [${dm_m1c_check}] M1c: Multiple extrathoracic metastases
           (${dm_m1c1_check}) M1c1: Multiple extrathoracic metastases in a single organ system
           (${dm_m1c2_check}) M1c2: Multiple extrathoracic metastases in multiple organ systems

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
            if (dm_m1c12_val) {
                m_stage.push(dm_m1c12_val);
            }
        }
        //console.log(m_stage);
    }

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    var t = t_stage.sort()[t_stage.length-1];
    var n = n_stage.sort()[n_stage.length-1];
    var m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Lung Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 9);

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

$('#btn_ajcc').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#ajccModalLong').modal('show');
});

$( document ).ready(function() {
    console.log( "document loaded" );
    let ajcc_table = generate_ajcc_table(AJCC_T, AJCC_N, AJCC_M);
    $('#ajccModalLongTitle').html("AJCC Definitions for Lung Cancer");
    $('#ajccModalBody').html(ajcc_table);
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
