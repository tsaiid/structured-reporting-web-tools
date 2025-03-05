import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/pancreas.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['is', 'Carcinoma in situ. This includes high-grade pancreatic intraepithelial neoplasia (PanIn-3), intraductal papillary mucinous neoplasm with high-grade dysplasia, intraductal tubulopapillary neoplasm with high-grade dysplasia, and mucinous cystic neoplasm with high-grade dysplasia.'],
    ['1', 'Tumor ≤2 cm in greatest dimension'],
    ['1a', 'Tumor ≤0.5 cm in greatest dimension'],
    ['1b', 'Tumor >0.5 cm and <1 cm in greatest dimension'],
    ['1c', 'Tumor 1–2 cm in greatest dimension'],
    ['2', 'Tumor >2 cm and ≤4 cm in greatest dimension'],
    ['3', 'Tumor >4 cm in greatest dimension'],
    ['4', 'Tumor involves celiac axis, superior mesenteric artery, and/or common hepatic artery, regardless of size'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in one to three regional lymph nodes'],
    ['2', 'Metastasis in four or more regional lymph nodes'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

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
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + "\n";
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
    [+] Measurable: ${t_length} cm (largest diameter)`;
        //console.log(t_stage);

        if (t_length > 4) {
            t_stage.push("3");
        } else if (t_length > 2) {
            t_stage.push("2");
        } else if (t_length >= 1) {
            t_stage.push("1c");
        } else if (t_length > 0.5) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    }
    report += "\n\n";

    // Tumor invasion or encasement
    report += "3. Tumor invasion or encasement";
    let has_inv = $('.cb_ti:checked').length;
    if (!has_inv) {
        report += `
  [+] Tumor limited to the pancreas
  [ ] Yes, if yes:
`;
    } else {
        report += `
  [ ] Tumor limited to the pancreas
  [+] Yes, if yes:
`;
    }
    $('.cb_ti:not(#cb_ti_others)').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `    [${check_or_not}] ` + $(this).val() + "\n";
    });
    if ($('#cb_ti_others').is(':checked')) {
        report += "    [+] Others: " + $('#txt_ti_others').val() + "\n";
    } else {
        report += "    [ ] Others: ___\n";
    }

    if ($('.cb_ti_t4:checked').length) {
        t_stage.push("4");
    }
    //console.log(t_stage);
    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length && $('#txt_rln_num').val() > 0;
    let rln_num = (has_rln ? parseInt($('#txt_rln_num').val()) : "___");
    report += "4. Regional nodal metastasis\n";
    report += "  [" + (has_rln ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_rln ? "+" : " ") + "] Yes, if yes, number: " + rln_num + ", and locations: ";

    var pos_rn = new Set();
    if ($('.cb_tl_hn:checked').length) {
        $('.cb_rn_hn:checked').each(function(){
            pos_rn.add($(this).val());
        });
    }
    if ($('.cb_tl_bt:checked').length) {
        $('.cb_rn_bt:checked').each(function(){
            pos_rn.add($(this).val());
        });
    }
    var str_rn = has_rln && pos_rn.size ? Array.from(pos_rn).join(", ") : "___";
    report += str_rn + "\n";
    report += "\n";

    if (rln_num >= 4) {
        n_stage.push("2");
    } else if (rln_num >= 1) {
        n_stage.push("1");
    } else {
        n_stage.push("0");
    }
    //console.log(n_stage);

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
        report += "\n";

        m_stage.push("1");
        //console.log(m_stage);
    } else {
        report += "___";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Pancreatic Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Pancreatic Cancer Staging Form");
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
    $('#ajccModalLongTitle').html("AJCC Definitions for Pancreatic Carcinoma");
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
