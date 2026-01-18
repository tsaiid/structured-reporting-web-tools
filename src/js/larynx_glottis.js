import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
import '../css/nasopharynx_helper.css';
import '../image/neck_lymph_node_stations.webp';
import './larynx_logic_helper.js';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/larynx_glottis.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculate_staging } from './larynx_glottis_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['is', 'Carcinoma in situ'],
    ['1', 'Tumor limited to the vocal cord(s) (may involve anterior or posterior commissure) with normal mobility'],
    ['1a', 'Tumor limited to one vocal cord'],
    ['1b', 'Tumor involves both vocal cords'],
    ['2', 'Tumor extends to supraglottis and/or subglottis, and/or with impaired vocal cord mobility'],
    ['3', 'Tumor limited to the larynx with vocal cord fixation and/or invasion of paraglottic space and/or inner cortex of the thyroid cartilage'],
    ['4a', 'Moderately advanced local disease: Tumor invades through the thyroid cartilage and /or invades tissues beyond the larynx (e.g., trachea, soft tissues of neck including deep extrinsic muscle of the tongue, strap muscles, thyroid, or esophagus'],
    ['4b', 'Very advanced local disease: Tumor invades prevertebral space, encases carotid artery, or invades mediastinal structures'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Metastasis in a single ipsilateral lymph node, 3 cm or smaller in greatest dimension and ENE(-)'],
    ['2', 'Metastasis in a single ipsilateral node, larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(-); or metastases in multiple ipsilateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-); or metastasis in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-)'],
    ['2a', 'Metastasis in a single ipsilateral node, larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(-)'],
    ['2b', 'Metastases in multiple ipsilateral nodes, none larger than 6 cm in greatest dimension and ENE(-)'],
    ['2c', 'Metastases in bilateral or contralateral lymph nodes, none larger than 6 cm in greatest dimension and ENE(-)'],
    ['3', 'Metastasis in a lymph node, larger than 6 cm in greatest dimension and ENE(-); or metastasis in any lymph node(s) with clinically overt ENE(+)'],
    ['3a', 'Metastasis in a lymph node, larger than 6 cm in greatest dimension and ENE(-)'],
    ['3b', 'Metastasis in any lymph node(s) with clinically overt ENE(+)'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
]);

function generate_report(){
    // Gather data for logic
    const data = {
        hasTumor: $('.cb_tl:checked').length > 0,
        lateralityCount: $('.cb_tl_lat:checked').length,
        isNonMeasurable: $('#cb_ts_nm').is(':checked'),
        invasion: {
            t2: $('.cb_ti_t2:checked').length > 0,
            t3: $('.cb_ti_t3:checked').length > 0,
            t4a: $('.cb_ti_t4a:checked').length > 0,
            t4b: $('.cb_ti_t4b:checked').length > 0
        },
        nodes: {
            hasNodes: $('.cb_rn:checked').length > 0,
            hasRightNodes: $('.cb_rn_r:checked').length > 0,
            hasLeftNodes: $('.cb_rn_l:checked').length > 0,
            isEne: $('#cb_rn_ene').is(':checked'),
            size: parseFloat($('#txt_rn_len').val()) || 0,
            isSingle: $('#cb_rn_sin').is(':checked')
        },
        tumorSide: {
            isRight: $('#cb_tl_r').is(':checked'),
            isLeft: $('#cb_tl_l').is(':checked')
        },
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const staging = calculate_staging(data);
    const t_stage = staging.t;
    const n_stage = staging.n;
    const m_stage = staging.m;

    // 1. Imaging Modality
    var report = `1. Imaging modality
  - Imaging by `;
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `(+) CT scan  ( ) MRI`;
    } else {
        report += `( ) CT scan  (+) MRI`;
    }
    report += "\n\n";

    // Tumor location
    report += "2. Tumor location\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Not assessable";
    } else if ($('#cb_ts_no').is(':checked')) {
        report += "--- No evidence of primary tumor";
    } else if ($('.cb_tl:checked').length) {
        report += "* " + join_checkbox_values($('.cb_tl:checked'), "\n* ") + "\n";
        if ($('.cb_tl_lat:checked').length) {
            report += "Laterality: " + join_checkbox_values($('.cb_tl_lat:checked'));
        }
    }
    report += "\n\n";

    // Tumor size
    report += "3. Tumor size\n";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "--- Non-measurable";
    } else if ($('#cb_ts_no').is(':checked')) {
        report += "--- No evidence of primary tumor";
    } else {
        let t_length = parseFloat($('#txt_ts_dia').val());
        report += "--- Size: " + t_length + " cm (largest diameter)\n";
    }
    report += "\n";

    // Tumor invasion
    report += "4. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
        report += "\n";
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var ti_array = [];
        if ($('.cb_ti_t2:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t2:not(:checked)')));
        }
        if ($('.cb_ti_t3:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t3:not(:checked)')));
        }
        if ($('.cb_ti_t4a:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4a:not(:checked)')));
        }
        if ($('.cb_ti_t4b:not(:checked)').length) {
            ti_array.push("* " + join_checkbox_values($('.cb_ti_t4b:not(:checked)')));
        }
        report += ti_array.join("\n") + "\n"
    }
    report += "\n";

    // Regional nodal metastasis
    let n_length = parseFloat($('#txt_rn_len').val());
    report += "5. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_rn_r:checked').length) {
            report += "* Right neck level: " + join_checkbox_values($('.cb_rn_r:checked')) + "\n";
        }
        if ($('.cb_rn_l:checked').length) {
            report += "* Left neck level: " + join_checkbox_values($('.cb_rn_l:checked')) + "\n";
        }
        report += "* Maximum size of the largest positive node: " + n_length + " cm.\n";
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_rn_r:not(:checked)').length) {
            report += "* Right neck level: " + join_checkbox_values($('.cb_rn_r:not(:checked)')) + "\n";
        }
        if ($('.cb_rn_l:not(:checked)').length) {
            report += "* Left neck level: " + join_checkbox_values($('.cb_rn_l:not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Distant metastasis
    report += "6. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not("#cb_dm_others"):not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "7. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Laryngeal Carcinoma (Glottis)", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Laryngeal Cancer (Glottis) Staging Form");
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
    ajccTitleHtml: "AJCC Definitions for Laryngeal Carcinoma (Glottis) <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
