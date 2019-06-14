import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/prostate.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_PROSTATE_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1a': 'Tumor incidental histologic finding in 5% or less of tissue resected.',
    '1b': 'Tumor incidental histologic finding in more than 5% of tissue resected.',
    '1c': 'Tumor identified by needle biopsy found in one or both sides, but not palpable.',
    '2a': 'Tumor involves one-half of one lobe or less.',
    '2b': 'Tumor involves more than one-half of one lobe but not both lobes.',
    '2c': 'Tumor involves both lobes.',
    '3a': 'Extracapsular extension (unilateral or bilateral).',
    '3b': 'Tumor invades seminal vesicle(s).',
    '4': 'Tumor is fixed or invades adjacent structures other than seminal vesicles such as external sphincter, rectum, bladder, levator muscles, and/or pelvic wall.',
};
const AJCC8_PROSTATE_N = {
    'x': 'Regional lymph nodes cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Metastasis in regional node(s).',
};
const AJCC8_PROSTATE_M = {
    '0': 'No distant metastasis (in this study).',
    '1a': 'Distant metastasis, with non-regional lymph node(s).',
    '1b': 'Distant metastasis of Bone(s).',
    '1c': 'Distant metastasis: Other site(s) with or without bone disease.',
};
const map_prostate_invasion = {
    'One-half of one lobe or less': '2a',
    'More than one-half of one lobe but not both lobes': '2b',
    'Involves both lobes': '2c',
};

function generate_report(){
    var t_stage = ["1"];    // at least T1?
    var n_stage = ["0"];
    var m_stage = ["0"];

    // Protocol
    var report = `1. MR protocol
- Distended rectum with jelly
- Abdomen and pelvis:
  * HASTE T2: axial, coronal
  * DWI: coronal`;
    if ($('#cb_sp_cemr').is(':checked')) { report += '\n  * T1+C: axial'; }
    report += `
- Prostate:
  * TSE T2, DWI, ADC: axial
  * T1+FS: axial, sagittal`;
    if ($('#cb_sp_cemr').is(':checked')) { report += '\n  * T1+C+FS: axial, coronal, sagittal'; }
    report += '\n\n';

    // Tumor location / size
    report += "2. Tumor location / size\n";
    if ($('#cb_ts_na').is(':checked')) {
        report += "--- Not assessable";
    } else {
        report += "Location: ";
        if ($('.cb_tl:checked').length) {
            report += join_checkbox_values($('.cb_tl:checked')) + "\n";
        }
        let t_dia = parseFloat($('#txt_ts_dia').val());
        report += `Size: ${t_dia} cm (largest diameter of the biggest tumor)`;
        //t_stage.push(get_t_stage_by_size(t_size));
        //console.log(t_stage);
    }
    report += "\n\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    //// Prostate
    if ($("input[name='rb_ti_p']:checked").length) {
        report += `Prostate (${ $("input[name='rb_ti_p']:checked").val() })\n`;
        t_stage.push(map_prostate_invasion[$("input[name='rb_ti_p']:checked").val()]);
        //console.log(t_stage);
    }
    var ti_pos = "", ti_neg = "--- No or Equivocal:\n";
    $('.ti_item').each(function(){
        if ($(this).find('.cb_ti:checked').length) {
            ti_pos += $(this).find('.cb_ti_title').text() + ": " + join_checkbox_values($(this).find('.cb_ti:checked')) + "\n";
        } else {
            ti_neg += $(this).find('.cb_ti_title').text() + "\n";
        }
    });
    if (ti_pos.length) {
        ti_pos = "--- Yes:\n" + ti_pos;
    }
    report += ti_pos + ti_neg;

        if ($('.cb_ti:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_ti:checked'), "\n* ");
        report += "\n";

        if ($('.cb_ti_t2:checked').length) {
            t_stage.push("2");
        }
        if ($('.cb_ti_t3:checked').length) {
            t_stage.push("3");
        }
        if ($('.cb_ti_t4a:checked').length) {
            t_stage.push("4a");
        }
        if ($('.cb_ti_t4b:checked').length) {
            t_stage.push("4b");
        }
        //console.log(t_stage);
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
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        let rln_num = parseInt($('#txt_rln_num').val());
        report += "--- Yes:\n";
        report += "--- Number of suspicious lymph node: " + rln_num + "\n";

        if (rln_num >= 7) {
            n_stage.push("3");
        } else if (rln_num >= 3) {
            n_stage.push("2");
        } else if (rln_num >= 1) {
            n_stage.push("1");
        } else {
            n_stage.push("0");
        }
        //console.log(n_stage);

        report += "--- Location:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ");
        report += "\n";
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        var rn_array = [];
        if ($('.cb_rn:not(:checked)').length) {
            rn_array.push("* " + join_checkbox_values($('.cb_rn:not(:checked)')));
        }
        report += rn_array.join("\n") + "\n"
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_dm:checked'), "\n* ");
        if ($('#cb_dm_others:checked').length) {
            report += $('#txt_dm_others').val();
        }
        report += "\n";
        m_stage.push("1");
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        report += "* " + join_checkbox_values($('.cb_dm:not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_PROSTATE_T[t];
    let n_str = AJCC8_PROSTATE_N[n];
    let m_str = AJCC8_PROSTATE_M[m];
    report += ajcc_template("Prostate Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Prostate Cancer Staging Form");
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
