import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/pancreas.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculatePancreasStage } from './pancreas_logic.js';

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
    let t_length = parseFloat($('#txt_ts_len').val());
    if ($('#cb_ts_nm').is(':checked') || !$('#txt_ts_len').val()) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (largest diameter)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (largest diameter)`;
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

    report += "\n";

    // Collect data for staging
    const data = {
        tumorSize: t_length,
        isNonMeasurable: $('#cb_ts_nm').is(':checked'),
        isT4: $('.cb_ti_t4:checked').length > 0,
        nodesCount: ($('.cb_rn:checked').length && $('#txt_rln_num').val() > 0) ? parseInt($('#txt_rln_num').val()) : 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculatePancreasStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

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

        // M stage calculated via logic
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
    report += ajcc_template_with_parent("Pancreatic Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Pancreatic Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
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

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Pancreatic Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
