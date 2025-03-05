import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/ccc_ibd.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ (intraductal tumor)'],
    ['1', 'Solitary tumor without vascular invasion, ≤5 cm or >5 cm'],
    ['1a', 'Solitary tumor ≤5 cm without vascular invasion'],
    ['1b', 'Solitary tumor >5 cm without vascular invasion'],
    ['2', 'Solitary tumor with intrahepatic vascular invasion or multiple tumors, with or without vascular invasion'],
    ['3', 'Tumor perforating the visceral peritoneum'],
    ['4', 'Tumor involving local extrahepatic structures by direct invasion'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Regional lymph node metastasis'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

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

    // Tumor size
    let t_length = parseFloat($('#txt_ts_len').val());
    report += `2. Tumor size\n`;
    report += "  - Size: ";
    if ($('#cb_ts_nm').is(':checked') || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (greatest dimension)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest dimension)`;
    }
    report += "\n";

    report += `  - Location: `;
    $('.cb_tl').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `[${check_or_not}] ` + $(this).val() + '  ';
    });
    report += "\n";
    report += "  - Number: ";
    $('input[name="radio_tn"]').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `(${check_or_not}) ` + $(this).val() + '  ';
    });
    report += "\n\n";

    // Tumor characteristics and associated liver features
    let ti_t0_check = $('#cb_ti_t0').is(':checked') ? "+" : " ";
    let ti_t2_check = $('#cb_ti_t2').is(':checked') ? "+" : " ";
    let ti_t3_check = $('#cb_ti_t3').is(':checked') ? "+" : " ";
    let ti_t4_check = $('#cb_ti_t4').is(':checked') ? "+" : " ";
    let txt_ti_t4 = $('#txt_ti_t4').val() ? $('#txt_ti_t4').val() : "___";

    report += `3. Tumor invasion
    T0: [${ti_t0_check}] No evidence of primary tumor
    T2: [${ti_t2_check}] Intrahepatic vascular invasion
    T3: [${ti_t3_check}] Tumor perforating the visceral peritoneum
    T4: [${ti_t4_check}] Tumor involving local extrahepatic structures by direct invasion, location: ${txt_ti_t4}

`;

    // calculate T stage
    if ($('.cb_ti_t0:checked').length) {
        t_stage.push('0');
    } else if ($('#cb_ts_nm').is(':checked') || !t_length) {
        t_stage.push('x');
    } else if ($('.cb_ti_t4:checked').length) {
        t_stage.push('4');
    } else if ($('.cb_ti_t3:checked').length) {
        t_stage.push('3');
    } else if ($('.cb_ti_t2:checked').length || $('input[name="radio_tn"]').val() == 'multiple') {
        t_stage.push('2');
    } else {
        t_stage.push('1');
        if (t_length > 5) {
            t_stage.push('1b');
        } else {
            t_stage.push('1a');
        }
    }

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length;
    let rn_r_ip_check = $('#cb_rn_r_ip').is(':checked') ? "+" : " ";
    let rn_r_h_check = $('#cb_rn_r_h').is(':checked') ? "+" : " ";
    let rn_r_gh_check = $('#cb_rn_r_gh').is(':checked') ? "+" : " ";
    let rn_l_pd_check = $('#cb_rn_l_pd').is(':checked') ? "+" : " ";
    let rn_l_pp_check = $('#cb_rn_l_pp').is(':checked') ? "+" : " ";
    report += `4. Regional nodal metastasis
    [` + (has_rln? " " : "+") + `] No regional lymph node metastasis
    [` + (has_rln? "+" : " ") + `] Yes, locations:
        [${rn_r_ip_check}] Inferior phrenic     [${rn_r_h_check}] Hilar            [${rn_r_gh_check}] Gastrohepatic
        [${rn_l_pd_check}] Periduodenal         [${rn_l_pp_check}] Peripancreatic

`;

    if (has_rln) {
        n_stage.push('1');
    }

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
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
    report += ajcc_template_with_parent("Cholangiocarcinoma: Intrahepatic Bile Duct", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Cholangiocarcinoma: Intrahepatic Bile Duct Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

/*
$('.cb_rn, input[name="radio_rn"]').change(function() {
    if ($(this).parent().parent().find('.cb_rn:checked').length) {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", true);
    } else {
        $(this).parent().parent().find('input[name="radio_rn"]').prop("checked", false);
    }
    $(this).parent().parent().siblings().find('.cb_rn').prop('checked', false);
});
*/

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
    $('#ajccModalLongTitle').html("AJCC Definitions for Cholangiocarcinoma: Intrahepatic Bile Duct");
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
