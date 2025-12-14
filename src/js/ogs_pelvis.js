import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/ogs_pelvis.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table} from './ajcc_common.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor confined to one pelvic segment with no extraosseous extension'],
    ['1a', 'Tumor ≤8 cm in greatest dimension'],
    ['1b', 'Tumor >8 cm in greatest dimension'],
    ['2', 'Tumor confined to one pelvic segment with extraosseous extension or two segments without extraosseous extension'],
    ['2a', 'Tumor ≤8 cm in greatest dimension'],
    ['2b', 'Tumor >8 cm in greatest dimension'],
    ['3', 'Tumor spanning two pelvic segments with extraosseous extension'],
    ['3a', 'Tumor ≤8 cm in greatest dimension'],
    ['3b', 'Tumor >8 cm in greatest dimension'],
    ['4', 'Tumor spanning three pelvic segments or crossing the sacroiliac joint'],
    ['4a', 'Tumor involves sacroiliac joint and extends medial to the sacral neuroforamen'],
    ['4b', 'Tumor encasement of external iliac vessels or presence of gross tumor thrombus in major pelvic vessels'],
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

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
Slice thickness: 4mm or less
    Range: 3-5 cm above and below the lesion
    請依據病灶部位挑選適當的掃描平面(coronal or sagittal)
    Pre-contrast imaging:
    coronal or sagittal  T1WI
coronal or sagittal  T2WI with/without fat-suppression*
axial               T2WIwith/without fat-suppression*
*三個plane中，至少一個有脂肪抑制的脈衝序列
Post-contrast imaging:
coronal or sagittal  T1WI with/without fat-suppression
axial             T1WI with/without fat-suppression
  Screen for skip metastasis***
若是下肢病灶 coronal STIR cover pelvis to feet
若是上肢病灶 coronal STIR cover trunk and upper limbs
     ***option`;
    } else {
        report += `CT protocol
Slice thickness: 3mm for <3cm lesion, 5mm for >3cm lesion
Range: 2-3cm above and below the lesion
Pre-contrast imaging: axial imaging, bilateral (if bilateral can be scanned simultaneously)
Post-contrast imaging: axial imaging, unilateral (lesion side only);
                       coronal and sagittal reformation in bone window`;
    }
    report += "\n\n";

    // Tumor location / size
    report += "2. Tumor location / size\n";
    report += "--- Laterality: " + $('input[name="radio_tl"]:checked').val() + "\n";
    report += "--- Location & Extension: " + join_checkbox_values($('.cb_tl_ps:checked')) + "\n";
    report += "--- Size: ";
    let t_length = parseFloat($('#txt_ts_len').val());
    if ($('#cb_ts_nm').is(':checked')) {
        report += "Non-measurable";
        t_stage.push("x");
    } else {
        report += "Measurable: " + t_length + " cm (greatest dimension of the largest tumor)\n";
    }
    report += "\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_ti:checked').length) {
            report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ") + "\n";
        }
    }
    if ($('.cb_ti:not(:checked)').length) {
        report += "--- No or Equivocal\n";
        if ($('.cb_ti:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_ti:not(:checked)'), "\n* ") + "\n";
        }
    }
    report += "\n";

    if ($('.cb_ti_t4b:checked').length) {
        t_stage.push("4b");
    } else if ($('.cb_ti_t4a:checked').length) {
        t_stage.push("4a");
    } else if ($('.cb_tl_ps:checked').length >= 3 || ($('#cb_tl_s').is(':checked') && $('#cb_tl_iw').is(':checked'))) {
        t_stage.push("4");
    } else if ($('.cb_tl_ps:checked').length == 2 && $('#cb_ti_ee').is(':checked')) {
        t_stage.push("3");
        if (t_length > 8) {
            t_stage.push("3b");
        } else if (t_length > 0) {
            t_stage.push("3a");
        }
    } else if (($('.cb_tl_ps:checked').length == 1 && $('#cb_ti_ee').is(':checked')) || $('.cb_tl_ps:checked').length == 2 && !$('#cb_ti_ee').is(':checked')) {
        t_stage.push("2");
        if (t_length > 8) {
            t_stage.push("2b");
        } else if (t_length > 0) {
            t_stage.push("2a");
        }
    } else if ($('.cb_tl_ps:checked').length) {
        t_stage.push("1");
        if (t_length > 8) {
            t_stage.push("1b");
        } else if (t_length > 0) {
            t_stage.push("1a");
        }
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
    report += ajcc_template_with_parent("OGS of Pelvis", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("OGS for Pelvis");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
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
    $('#ajccModalLongTitle').html("AJCC Definitions for OGS of Pelvis <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>");
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
