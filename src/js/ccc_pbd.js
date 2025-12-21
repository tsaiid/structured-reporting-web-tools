import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/ccc_pbd.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';
import { calculate_staging } from './ccc_pbd_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ/high-grade dysplasia'],
    ['1', 'Tumor confined to the bile duct, with extension up to the muscle layer or fibrous tissue'],
    ['2', 'Tumor invades beyond the wall of the bile duct to surrounding adipose tissue, or tumor invades adjacent hepatic parenchyma'],
    ['2a', 'Tumor invades beyond the wall of the bile duct to surrounding adipose tissue'],
    ['2b', 'Tumor invades adjacent hepatic parenchyma'],
    ['3', 'Tumor invades unilateral branches of the portal vein or hepatic artery'],
    ['4', 'Tumor invades the main portal vein or its branches bilaterally, or the common hepatic artery; or unilateral second-order biliary radicals with contralateral portal vein or hepatic artery involvement'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'One to three positive lymph nodes typically involving the hilar, cystic duct, common bile duct, hepatic artery, posterior pancreatoduodenal, and portal vein lymph nodes'],
    ['2', 'Four or more positive lymph nodes from the sites described for N1'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

function generate_report(){
    // Gather data for logic
    const data = {
        tumorSize: parseFloat($('#txt_ts_len').val()),
        isNonMeasurable: $('#cb_ts_nm').is(':checked'),
        isT0: $('.cb_ti_t0:checked').length > 0,
        isT1: $('#cb_ti_t1').is(':checked'),
        isT2a: $('#cb_ti_t2a').is(':checked'),
        isT2b: $('#cb_ti_t2b').is(':checked'),
        isT3: $('#cb_ti_t3').is(':checked'),
        isT4: $('.cb_ti_t4:checked').length > 0,
        nodesCount: parseInt($('#txt_rln_num').val()) || 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const staging = calculate_staging(data);
    const t_stage = staging.t;
    const n_stage = staging.n;
    const m_stage = staging.m;

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
    let t_length = data.tumorSize;
    report += `2. Tumor size\n`;
    report += "  - Size: ";
    if (data.isNonMeasurable || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (greatest dimension)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest dimension)`;
    }
    report += "\n";

    report += "  - Location: ";
    $('input[name="radio_tl"]').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `(${check_or_not}) ` + $(this).val() + '  ';
    });
    report += "\n\n";

    // Tumor characteristics and associated liver features
    let ti_t0_check = $('#cb_ti_t0').is(':checked') ? "+" : " ";
    let ti_t1_check = $('#cb_ti_t1').is(':checked') ? "+" : " ";
    let ti_t2a_check = $('#cb_ti_t2a').is(':checked') ? "+" : " ";
    let ti_t2b_check = $('#cb_ti_t2b').is(':checked') ? "+" : " ";
    let ti_t3_check = $('#cb_ti_t3').is(':checked') ? "+" : " ";
    let ti_t4_mpv_check = $('#cb_ti_t4_mpv').is(':checked') ? "+" : " ";
    let ti_t4_cha_check = $('#cb_ti_t4_cha').is(':checked') ? "+" : " ";
    let ti_t4_u2bd_check = $('#cb_ti_t4_u2bd').is(':checked') ? "+" : " ";

    report += `3. Tumor invasion
    T0:  [${ti_t0_check}] No evidence of primary tumor
    T1:  [${ti_t1_check}] Tumor confines in the bile duct
    T2a: [${ti_t2a_check}] Tumor invades beyond the wall of the bile duct to surrounding adipose tissue
    T2b: [${ti_t2b_check}] Tumor invades adjacent hepatic parenchyma
    T3:  [${ti_t3_check}] Unilateral branches of the portal vein or hepatic artery
    T4:  [${ti_t4_mpv_check}] Main portal vein or portal branches bilaterally
         [${ti_t4_cha_check}] Common hepatic artery
         [${ti_t4_u2bd_check}] Unilateral 2nd-order branch bile duct and contralateral portal vein or hepatic artery

`;

    // Regional nodal metastasis
    let rln_num = data.nodesCount;
    let has_rln = rln_num > 0;
    report += `4. Regional nodal metastasis
    [` + (has_rln? " " : "+") + `] No regional lymph node metastasis
    [` + (has_rln && rln_num <= 3 ? "+" : " ") + `] 1-3 positive lymph nodes (N1)
    [` + (has_rln && rln_num > 3 ? "+" : " ") + `] 4 or more positive lymph nodes (N2)
    Number: ` + (Number.isInteger(rln_num)? rln_num : "___");

    report += "\n\n";

    // Distant metastasis
    let has_dm = data.hasMetastasis;
    report += "5. Distant metastasis (In this study)\n";
    report += "    [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "    [" + (has_dm ? "+" : " ") + "] Yes, location: ";
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
    report += ajcc_template_with_parent("Cholangiocarcinoma: Perihilar Bile Duct", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

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

$('#btn_ajcc').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#ajccModalLong').modal('show');
});

$( document ).ready(function() {
    console.log( "document loaded" );
    let ajcc_table = generate_ajcc_table(AJCC_T, AJCC_N, AJCC_M);
    $('#ajccModalLongTitle').html("AJCC Definitions for Cholangiocarcinoma: Perihilar Bile Duct <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>");
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
