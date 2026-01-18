import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/ogs_spine.html?raw');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor confined to one vertebral segment or two adjacent vertebral segments'],
    ['2', 'Tumor confined to three adjacent vertebral segments'],
    ['3', 'Tumor confined to four or more adjacent vertebral segments, or any nonadjacent vertebral segments'],
    ['4', 'Extension into the spinal canal or great vessels'],
    ['4a', 'Extension into the spinal canal'],
    ['4b', 'Evidence of gross vascular invasion or tumor thrombus in the great vessels'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph nodes cannot be assessed. Because of the rarity of lymph node involvement in bone sarcomas, the designation NX may not be appropriate, and cases should be considered N0 unless clinical node involvement clearly is evident.'],
    ['0', 'No regional lymph node metastasis'],
    ['1', 'Regional lymph node metastasis'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis'],
    ['1a', 'Lung'],
    ['1b', 'Bone or other distant sites'],
]);

function any_nonadjacent_vertebral_segments() {
    /*
    const NON_ADJ_VB_SEG = {
        'Body R': ['Posterior element', 'Pedicle L'],
        'Body L': ['Posterior element', 'Pedicle R'],
        'Pedicle R': ['Body L', 'Pedicle L'],
        'Pedicle L': ['Body R', 'Pedicle R'],
        'Posterior element': ['Body R', 'Body L'],
    };
    $('.cb_ti_ss:checked').each(function(){
        let v = $(this).val();
        if (j)
    });
    */
    var has_nonadj_vb_seg = false;
    let len = $('.cb_ti_ss:checked').length;
    if (len > 1 && len < 4) {
        const vb_seg_order = ['Body R', 'Body L', 'Pedicle L', 'Posterior element', 'Pedicle R'];
        var list_vb_seg = $('.cb_ti_ss').get().sort(function(a, b){
            var indexA = $.inArray($(a).val(), vb_seg_order);
            var indexB = $.inArray($(b).val(), vb_seg_order);
            return ( indexA < indexB) ? -1 : ( indexA > indexB) ? 1 : 0;
        }).map(function(seg){
            return seg.checked;
        });
        //console.log(list_vb_seg);
        $.each(list_vb_seg, function(i, v){
            let total = $('.cb_ti_ss').length;
            let next_i = (i + 1) % total;
            let prev_i = (i === 0 ? total - 1 : i - 1);

            if (!v && list_vb_seg[prev_i] && list_vb_seg[next_i]) {
                has_nonadj_vb_seg = true;
                //console.log('nonadj_ver_seg');
                //console.log(total + ' ' + i + ' ' + prev_i + ' ' + next_i);
                return false;
            }
        });
    }
    return has_nonadj_vb_seg;
}

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = `1. Imaging modality
  - Imaging by `;

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'ct') {
        report += `(+) CT scan  ( ) MRI`;
    } else {
        report += `( ) CT scan  (+) MRI`;
    }
    report += "\n\n";

    // Tumor location / size
    report += `2. Tumor location / size
--- Location: ` + $('#txt_tl').val() + "\n";

    report += "--- Size: ";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "Non-measurable";
        t_stage.push("x");
    } else {
        let t_length = parseFloat($('#txt_ts_len').val());
        report += "Measurable: " + t_length + " cm (greatest dimension of the largest tumor)\n";

        if (t_length > 8) {
            t_stage.push("2");
        } else if (t_length > 0) {
            t_stage.push("1");
        }
    }
    report += "\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_ti_ss:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_ss:checked')) + "\n";
        }
        if ($('.cb_ti_t4:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4:checked'), "\n* ") + "\n";
        }
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal\n";
        if ($('.cb_ti_ss:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_ss:not(:checked)')) + "\n";
        }
        if ($('.cb_ti_t4:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti_t4:not(:checked)'), "\n* ") + "\n";
        }
    }
    report += "\n";
    if ($('.cb_ti_t4b:checked').length) {
        t_stage.push("4b");
    } else if ($('.cb_ti_t4a:checked').length) {
        t_stage.push("4a");
    } else if ($('.cb_ti_ss:checked').length >= 4 || any_nonadjacent_vertebral_segments()) {
        t_stage.push("3");
    } else if ($('.cb_ti_ss:checked').length == 3) {
        t_stage.push("2");
    } else if ($('.cb_ti_ss:checked').length <= 2) {
        t_stage.push("1");
    }
    //console.log(t_stage);

    // Regional nodal metastasis
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes: " + $('#txt_rn_others').val() + "\n";

        n_stage.push("1");
    }
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal\n";
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm:not("#cb_dm_others"):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):checked'), "\n* ") + "\n";
        }
        if ($('#cb_dm_others').is(':checked')) {
            report += "* " + $('#txt_dm_others').val() + "\n";
        }
        if ($('.cb_dm_m1b:checked').length) {
            m_stage.push("1b");
        } else {
            m_stage.push("1a");
        }
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not("#cb_dm_others"):not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not("#cb_dm_others"):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("OGS for Spine", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("OGS for Spine");
    $('#reportModalBody pre code').html(report);
    document.getElementById('reportModalLong').showModal();
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

// check if any nonadj vb seg
$('.cb_ti_ss').change(function() {
    $('#cb_ti_navs').prop('checked', any_nonadjacent_vertebral_segments());
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
    ajccTitleHtml: "AJCC Definitions for OGS for Spine <span class='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ml-2' style='vertical-align: super;'>8th</span>"
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
