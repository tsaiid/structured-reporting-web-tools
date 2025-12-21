import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/gastric.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';
import { calculateGastricStage } from './gastric_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ: intraepithelial tumor without invasion of the lamina propria, high-grade dysplasia'],
    ['1', 'Tumor invades the lamina propria, muscularis mucosae, or submucosa'],
    ['1a', 'Tumor invades the lamina propria or muscularis mucosae'],
    ['1b', 'Tumor invades the submucosa'],
    ['2', 'Tumor invades the muscularis propria'],
    ['3', 'Tumor penetrates the subserosal connective tissue without invasion of the visceral peritoneum or adjacent structures'],
    ['4', 'Tumor invades the serosa (visceral peritoneum) or adjacent structures'],
    ['4a', 'Tumor invades the serosa (visceral peritoneum)'],
    ['4b', 'Tumor invades adjacent structures/organs'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph node(s) cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in one or two regional lymph nodes'],
    ['2', 'Metastasis in three to six regional lymph nodes'],
    ['3', 'Metastasis in seven or more regional lymph nodes'],
    ['3a', 'Metastasis in seven to 15 regional lymph nodes'],
    ['3b', 'Metastasis in 16 or more regional lymph nodes'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
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

    // Tumor location / size
    let tl_c_check = $('#cb_tl_c').is(':checked') ? "+" : " ";
    let tl_f_check = $('#cb_tl_f').is(':checked') ? "+" : " ";
    let tl_lc_check = $('#cb_tl_lc').is(':checked') ? "+" : " ";
    let tl_gc_check = $('#cb_tl_gc').is(':checked') ? "+" : " ";
    let tl_a_check = $('#cb_tl_a').is(':checked') ? "+" : " ";
    let tl_p_check = $('#cb_tl_p').is(':checked') ? "+" : " ";
    let tl_others_check = $('#cb_tl_others').is(':checked') ? "+" : " ";
    let txt_tl_others = $('#txt_tl_others').val() ? $('#txt_tl_others').val() : "___";
    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let t_length = parseFloat($('#txt_ts_len').val());
    let ts_nm_check = has_ts_nm ? "+" : " ";
    let ts_m_check = !has_ts_nm ? "+" : " ";
    let txt_ts_len = t_length ? t_length : "___";
    report += `2. Tumor location / size
  - Location:
    [${tl_c_check}] Cardia               [${tl_f_check}] Fundus       [${tl_lc_check}] Lesser curvature
    [${tl_gc_check}] Greater curvature    [${tl_a_check}] Antrum       [${tl_p_check}] Pylorus
    [${tl_others_check}] Others: ${txt_tl_others}
  - Size:
    [${ts_nm_check}] Non-measurable
    [${ts_m_check}] Measurable: ${txt_ts_len} cm (greatest diameter)

`;

    // Tumor invasion depth
    report += "3. Tumor invasion depth\n";
    $('input[name="radios_tid"]').each(function(){
        var item_str = ($(this).is(':checked') ? '[+] ' : '[-] ');
        report += "    " + item_str + $(this).next().text();
        if ($(this).val() == "4b") {
            report += ', location: ' + $('#txt_tid_loc').val();
        }
        report += "\n";
    });
    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rn_no_check = !has_rln ? "+" : " ";
    let rn_yes_check = has_rln ? "+" : " ";
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    let rn_rpc_check = $('#cb_rn_rpc').is(':checked') ? "+" : " ";
    let rn_lpc_check = $('#cb_rn_lpc').is(':checked') ? "+" : " ";
    let rn_lc_check = $('#cb_rn_lc').is(':checked') ? "+" : " ";
    let rn_gc_check = $('#cb_rn_gc').is(':checked') ? "+" : " ";
    let rn_sp_check = $('#cb_rn_sp').is(':checked') ? "+" : " ";
    let rn_ip_check = $('#cb_rn_ip').is(':checked') ? "+" : " ";
    let rn_lga_check = $('#cb_rn_lga').is(':checked') ? "+" : " ";
    let rn_cha_check = $('#cb_rn_cha').is(':checked') ? "+" : " ";
    let rn_ca_check = $('#cb_rn_ca').is(':checked') ? "+" : " ";
    let rn_sh_check = $('#cb_rn_sh').is(':checked') ? "+" : " ";
    let rn_sa_check = $('#cb_rn_sa').is(':checked') ? "+" : " ";
    let rn_hp_check = $('#cb_rn_hp').is(':checked') ? "+" : " ";
    let rn_mca_check = $('#cb_rn_mca').is(':checked') ? "+" : " ";
    let rn_others_check = $('#cb_rn_others').is(':checked') ? "+" : " ";
    let txt_rn_others = $('#txt_rn_others').val() ? $('#txt_rn_others').val() : "___";
    report += `4. Regional nodal metastasis
    [${rn_no_check}] No or Equivocal
    [${rn_yes_check}] Yes, if yes, number of suspicious lymph node: ${rln_num}, and locations (specified as below):
        [${rn_rpc_check}] Right paracardial (1)    [${rn_lpc_check}] Left paracardial (2)       [${rn_lc_check}] Lesser curvature (3)
        [${rn_gc_check}] Greater curvature (4)    [${rn_sp_check}] Suprapyloric (5)           [${rn_ip_check}] Infrapyloric (6)
        [${rn_lga_check}] Left gastric artery (7)  [${rn_cha_check}] Common hepatic artery (8)  [${rn_ca_check}] Celiac artery (9)
        [${rn_sh_check}] Splenic hilum (10)       [${rn_sa_check}] Splenic artery (11)        [${rn_hp_check}] Hepatic pedicle (12)
        [${rn_mca_check}] Middle colic artery(15)  [${rn_others_check}] Others: ${txt_rn_others}

`;

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "    [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_dm ? "+" : " ") + "] Yes:\n";
    let has_nrn = $('.cb_dm_nrn:checked').length > 0;
    report += "        [" + (has_nrn ? "+" : " ") + "] Non-regional lymph nodes:\n            ";
    $('.cb_dm_nrn').each(function(){
        report += "[" + ($(this).is(':checked') ? "+" : " ") + "] " + $(this).val() + "  ";
    });
    report += "\n";
    let has_non_nrn_dm = $('.cb_dm:not(.cb_dm_nrn):checked').length > 0;
    report += "        [" + (has_non_nrn_dm ? "+" : " ") + "] Distant organ: ";
    report += (has_non_nrn_dm ? join_checkbox_values($('.cb_dm:not(.cb_dm_nrn):checked')) : "___");
    if ($('#cb_dm_others').is(':checked')) {
        if ($('.cb_dm:not("#cb_dm_others, .cb_dm_nrn"):checked').length) {
            report += ', '
        }
        report += $('#txt_dm_others').val();
    }
    report += "\n\n";

    // Calculate staging via Logic
    const data = {
        tStageValue: $('input[name="radios_tid"]:checked').val(),
        nodesCount: ($('.cb_rn:checked').length && $('#txt_rln_num').val() > 0) ? parseInt($('#txt_rln_num').val()) : 0,
        hasMetastasis: has_dm
    };

    const stageResult = calculateGastricStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Gastric Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

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

$('#btn_ajcc').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#ajccModalLong').modal('show');
});

$( document ).ready(function() {
    console.log( "document loaded" );
    let ajcc_table = generate_ajcc_table(AJCC_T, AJCC_N, AJCC_M);
    $('#ajccModalLongTitle').html("AJCC Definitions for Gastric Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>");
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
