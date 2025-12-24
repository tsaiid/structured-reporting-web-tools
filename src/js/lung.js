import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/lung.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateLungStage, getMaxStageNumber } from './lung_logic.js';

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

function generate_report(){
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

    // Collect data for calculation
    const data = {
        tumorSize: t_size,
        isNonMeasurable: $('#cb_tp_ts_nm').is(':checked'),
        invasion: {
            t4: $('.cb_ti_t4:checked').length > 0,
            t3: $('.cb_ti_t3:checked').length > 0,
            t2a: $('.cb_ti_t2a:checked').length > 0
        },
        nodes: {
            n1: $('.cb_rn_n1:checked').length > 0,
            n2: $('.cb_rn_n2:checked').length > 0,
            n2Type: $('input[name="radio_n2"]:checked').val(),
            n3: $('.cb_rn_n3:checked').length > 0
        },
        metastasis: {
            m1a: $('.cb_dm_m1a:checked').length > 0,
            m1bc: $('.cb_dm_m1bc:checked').length > 0,
            m1Type: $("input[name='radio_m1bc']:checked").val()
        }
    };

    const stageResult = calculateLungStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Tumor invasion
    let t1_check  = getMaxStageNumber(t_stage) == 1 ? "+" : " ";
    let t1a_check = (t_size <= 1 ? "+" : " ");
    let t1b_check = (t_size <= 2 && t_size > 1 ? "+" : " ");
    let t1c_check = (t_size <= 3 && t_size > 2 ? "+" : " ");
    let t2_check  = getMaxStageNumber(t_stage) == 2 ? "+" : " ";
    let t2a_sz_check = (t_size > 3 && t_size <= 4 ? "+" : " ");
    let t2b_sz_check = (t_size > 4 && t_size <= 5 ? "+" : " ");
    let t2a_mb_check = ($('#cb_tp_ti_mb').is(':checked') ? "+" : " ");
    let t2a_vp_check = ($('#cb_tp_ti_vp').is(':checked') ? "+" : " ");
    let t2a_al_check = ($('#cb_tp_ti_al').is(':checked') ? "+" : " ");
    let t2a_fa_check = ($('#cb_tp_ti_fa').is(':checked') ? "+" : " ");
    let t3_check  = getMaxStageNumber(t_stage) == 3 ? "+" : " ";
    let t3_sz_check = (t_size > 5 && t_size <= 7 ? "+" : " ");
    let t3_pp_check = ($('#cb_tp_ti_pp').is(':checked') ? "+" : " ");
    let t3_cw_check = ($('#cb_tp_ti_cw').is(':checked') ? "+" : " ");
    let t3_pc_check = ($('#cb_tp_ti_pc').is(':checked') ? "+" : " ");
    let t3_pn_check = ($('#cb_tp_ti_pn').is(':checked') ? "+" : " ");
    let t3_av_check = ($('#cb_tp_ti_av').is(':checked') ? "+" : " ");
    let t3_tnr_check = ($('#cb_tp_ti_tnr').is(':checked') ? "+" : " ");
    let t3_sln_check = ($('#cb_tp_ti_sln').is(':checked') ? "+" : " ");
    let t4_check  = getMaxStageNumber(t_stage) == 4 ? "+" : " ";
    let t4_sz_check = (t_size > 7 ? "+" : " ");
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
    (${t1_check}) T1: Tumor surrounded by lung or visceral pleura, or in a lobar or more peripheral bronchus
        [${t1a_check}] T1a: Tumor <= 1 cm
        [${t1b_check}] T1b: 1 cm < Tumor <= 2 cm
        [${t1c_check}] T1c: 2 cm < Tumor <= 3 cm
    (${t2_check}) T2:
        [${t2a_mb_check}] T2a: Main bronchus        [${t2a_vp_check}] T2a: Visceral pleura
        [${t2a_al_check}] T2a: Adjacent lobe        [${t2a_fa_check}] T2a: Atelectasis to hilum (focal or total)
        [${t2a_sz_check}] T2a: 3 cm < Tumor <= 4 cm
        [${t2b_sz_check}] T2b: 4 cm < Tumor <= 5 cm
    (${t3_check}) T3:
        [${t3_sz_check}] 5 cm < Tumor <= 7 cm
        [${t3_pp_check}] Parietal pleura      [${t3_cw_check}] Chest wall     [${t3_pc_check}] Pericardium
        [${t3_pn_check}] Phrenic nerve        [${t3_av_check}] Pericardium
        [${t3_tnr_check}] Thoracic nerve roots or stellate ganglion
        [${t3_sln_check}] Separate tumor nodule(s) in same lobe
    (${t4_check}) T4:
        [${t4_sz_check}] Tumor > 7 cm
        [${t4_men_check}] Mediastinum          [${t4_thy_check}] Thymus                       [${t4_tr_check}] Trachea
        [${t4_car_check}] Carina               [${t4_rln_check}] Recurrent laryngeal nerve    [${t4_vn_check}] Vagus nerve
        [${t4_eso_check}] Esophagus            [${t4_dia_check}] Diaphragm                    [${t4_h_check}] Heart
        [${t4_gv_check}] Great vessels        [${t4_saa_check}] Supra-aortic arteries        [${t4_bcv_check}] Brachiocephalic vein
        [${t4_scv_check}] Subclavian vessels   [${t4_vb_check}] Vertebral body               [${t4_l_check}] Lamina
        [${t4_sc_check}] Spinal canal         [${t4_cnr_check}] Cervical nerve roots         [${t4_bp_check}] Brachial plexus
        [${t4_sdn_check}] Separate tumor nodule(s) in a different ipsilateral lobe

`;

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

    // calculate N stage (calculated via calculateLungStage)

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
    const radio_dm_val = $("input[name='radio_m1bc']:checked").val();
    let dm_m1b_check = ($('.cb_dm_m1bc:checked').length == 1 && radio_dm_val == "1b" ? "+" : " ");
    let is_dm_m1c = $('.cb_dm_m1bc:checked').length && radio_dm_val != "1b";
    let dm_m1c_check = (is_dm_m1c ? "+" : " ");
    let dm_m1c1_check = is_dm_m1c && radio_dm_val === '1c1' ? "+" : " ";
    let dm_m1c2_check = is_dm_m1c && radio_dm_val === '1c2' ? "+" : " ";

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

    // calculate M stage (calculated via calculateLungStage)

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    var t = t_stage.sort()[t_stage.length-1];
    var n = n_stage.sort()[n_stage.length-1];
    var m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Lung Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 9);

    $('#reportModalLongTitle').html("Lung Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

// auto check N2a/N2b radio button
$('.cb_rn_n2').change(function(){
    let cb_n2_num = $('.cb_rn_n2:checked').length;
    if (cb_n2_num) {
        if ($("input[name='radio_n2']:checked").length == 0) {
            $("#radio_n2a").prop("checked", true);
        }
    } else {
        $("input[name='radio_n2']").prop("checked", false);
    }
});

// auto check M1c1/M1c2 radio button
$('.cb_dm_m1bc').change(function(){
    let cb_dm_num = $('.cb_dm_m1bc:checked').length;
    if (cb_dm_num) {
        const radio_dm_val = $("input[name='radio_m1bc']:checked").val();
        if ($("input[name='radio_m1bc']:checked").length == 0) {
            $("#radio_m1c1").prop("checked", true);
        }
        if (cb_dm_num == 1) {
            if ($("#radio_m1b").prop("disabled")) {
                $("#radio_m1b").prop("disabled", false)
            }
            if (radio_dm_val != "1c1") {
                $("#radio_m1c1").prop("checked", true);
            }
        }
        if (cb_dm_num > 1) {
            if (!$("#radio_m1b").prop("disabled")) {
                $("#radio_m1b").prop("disabled", true)
            }
            if (radio_dm_val != "1c2") {
                $("#radio_m1c2").prop("checked", true);
            }
        }
    } else {
        $("input[name='radio_m1bc']").prop("checked", false);
    }
});

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Lung Cancer <span class='badge badge-primary ml-2' style='font-size: 60%; vertical-align: super;'>9th</span>"
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
