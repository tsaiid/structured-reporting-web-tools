import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/ovary.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';

const AJCC8_OVARY_T = {
    'x': 'Primary tumor cannot be assessed.',
    '0': 'No evidence of primary tumor.',
    '1': 'Tumor limited to ovaries (1 or both).',
    '1a': 'Tumor limited to 1 ovary (capsule intact) or fallopian tube surface; no malignant cells in ascites or peritoneal washings.',
    '1b': 'Tumor limited to 1 or both ovaries (capsule intact) or fallopian tubes; no tumor on ovarian or fallopian tube surface; no malignant cells in ascites or peritoneal washings.',
    '1c': 'Tumor limited to 1 or both ovaries or fallopian tubes, with any of the following.',
    '1c1': 'Surgical spill.',
    '1c2': 'Capsule ruptured before surgery, or tumor on ovarian surface or fallopian tube surface.',
    '1c3': 'Malignant cells in ascites or peritoneal washings.',
    '2': 'Tumor involves 1 or both ovaries or fallopian tubes with pelvic extension below pelvic brim or primary peritoneal cancer.',
    '2a': 'Extension &/or implants on the uterus &/or fallopian tube(s)&/or ovaries.',
    '2b': 'Extension to &/or implants on other pelvic tissues.',
    '3': 'Tumor involves 1 or both ovaries or fallopian tubes, or primary peritoneal cancer, with microscopically confirmed peritoneal metastasis outside the pelvis&/or metastasis to the retroperitoneal (pelvic &/or para-aortic) lymph nodes.',
    '3a': 'Microscopic extrapelvic (above the pelvic brim) peritoneal involvement with or without positive retroperitoneal lymph nodes.',
    '3b': 'Macroscopic peritoneal metastasis beyond pelvis 2 cm or less in greatest dimension with or without metastasis to the retroperitoneal lymph nodes.',
    '3c': 'Macroscopic peritoneal metastasis beyond the pelvis more than 2 cm in greatest dimension with or without metastasis to the retroperitoneal lymph nodes (includes extension of tumor to capsule of liver and spleen without parenchymal involvement of either organ).',
};
const AJCC8_OVARY_N = {
    'x': 'Regional lymph node cannot be assessed.',
    '0': 'No regional lymph node metastasis.',
    '1': 'Positive retroperitoneal lymph nodes only (histologically confirmed).',
    '1a': 'Metastasis up to 10 mm in greatest dimension.',
    '1b': 'Metastasis more than 10 mm in greatest dimension.',
};
const AJCC8_OVARY_M = {
    '0': 'No distant metastasis (in this study).',
    '1': 'Distant metastasis, including pleural effusion with positive cytology; liver or splenic parenchymal metastasis; metastasis to extra-abdominal organs (including inguinal lymph nodes and lymph nodes outside the abdominal cavity); and transmural involvement of intestine.',
    '1a': 'Pleural effusion with positive cytology.',
    '1b': 'Liver or splenic parenchymal metastasis; metastasis to extra-abdominal organs (including inguinal lymph nodes and lymph nodes outside the abdominal cavity); transmural involvement of intestine.',
};

function generate_report(){
    var t_stage = ["0"];
    var n_stage = ["0"];
    var m_stage = ["0"];
    var report = "1. ";
    //var report = "1. CT protocol\n";

    // Protocol
    if ($('input[name="protocol_radios"]:checked').val() == 'mr') {
        report += `MR protocol
- Distended rectum with jelly
- Abdomen and pelvis:
  * T2: coronal  * DWI (b=400): coronal
- Uterus:
  * TSE T2: axial, coronal, sagittal  * DWI (b=1000), ADC: axial
  * T1+FS: axial, sagittal  * T1+C+FS: axial, sagittal`;
    } else {
        report += `CT protocol
Without contrast, range: pelvis, slice thickness <= 5mm
With contrast, range: whole abdomen, slice thickness <= 5mm
Oral contrast may improve detection of small peritoneal seeding`;
    }
    report += "\n\n";

    // Tumor size
    report += "2. Tumor size\n";
    report += "Size: ";
    if ($('#cb_ts_nm').is(':checked')) {
        report += "Non-measurable";
    } else {
        let t_dia = parseFloat($('#txt_ts_dia').val());
        report += "Measurable: " + t_dia + " cm (greatest dimension)";
        t_stage.push("1");
    }
    report += "\n";
    report += "Location: " + $('input[name=radio_tl]:checked').val() + "\n";
    if ($('input[name=radio_tl]:checked').val() == 'bilateral') {
        t_stage.push("1b");
    } else {
        t_stage.push("1a");
    }
    report += "Content: " + $('input[name=radio_tc]:checked').val() + "\n";
    report += "\n";

    // Tumor invasion
    report += "3. Tumor invasion\n";
    if ($('#cb_ti_na').is(':checked')) {
        report += "--- Not assessable\n";
    } else {
        if ($('.cb_ti:checked').length) {
            report += "--- Yes:\n";
            if ($('.cb_ti_t2:checked').length) {
                report += "* Below pelvic brim: " + join_checkbox_values($('.cb_ti_t2:checked')) + "\n";

                if ($('.cb_ti_t2a:checked').length) {
                    t_stage.push("2a");
                }
                if ($('.cb_ti_t2b:checked').length) {
                    t_stage.push("2b");
                }
            }
            if ($('.cb_ti_t3:checked').length) {
                report += "* Outside the pelvis: " + join_checkbox_values($('.cb_ti_t3:checked')) + "\n";

                if ($('#cb_ti_t3_2cm').is(':checked')) {
                    t_stage.push("3c");
                } else {
                    t_stage.push("3b");
                }
            }
            if ($('.cb_ti_o:checked').length) {
                report += "* " + join_checkbox_values($('.cb_ti_o:checked'), "\n* ");
                report += "\n";
            }

            //console.log(t_stage);
        }
        if ($('.cb_ti:not(:checked)').length) {
            report += "--- No or Equivocal:\n";
            if ($('.cb_ti_t2:not(:checked)').length) {
                report += "* Below pelvic brim: " + join_checkbox_values($('.cb_ti_t2:not(:checked)')) + "\n";
            }
            if ($('.cb_ti_t3:not(:checked)').length) {
                report += "* Outside the pelvis: " + join_checkbox_values($('.cb_ti_t3:not(:checked)')) + "\n";
            }
            if ($('.cb_ti_o:not(:checked)').length) {
                report += "* " + join_checkbox_values($('.cb_ti_o:not(:checked)')) + "\n";
            }
        }
    }
    report += "\n";

    // Regional nodal metastasis
    let n_length = parseFloat($('#txt_rn_len').val());
    report += "4. Regional nodal metastasis\n";
    if ($('.cb_rn:checked').length) {
        report += "--- Yes:\n";
        report += "* " + join_checkbox_values($('.cb_rn:checked'), "\n* ") + "\n";
        report += "* Maximum size of the largest positive node: " + n_length + " cm.\n";

        t_stage.push("3");
        n_stage.push("1a");
        if (n_length > 10) {
            n_stage.push("1b");
        }
    } /* else {
        report += "* No regional lymph node metastasis.\n";
    } */
    if ($('.cb_rn:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if ($('.cb_rn:not(:checked)').length) {
            report += "* " + join_checkbox_values($('.cb_rn:not(:checked)')) + "\n";
        }
    }
    report += "\n";

    // Distant metastasis
    report += "5. Distant metastasis (In this study)\n";
    if ($('.cb_dm:checked').length) {
        report += "--- Yes:\n";
        if ($('.cb_dm_nrl:checked').length) {
            report += "* non-regional lymph node: " + join_checkbox_values($('.cb_dm_nrl:checked'));
            if ($('#cb_dm_nrl_others').is(':checked')) {
                report += $('#txt_dm_nrl_others').val();
            }
            report += "\n";
        }
        if ($('.cb_dm:not(.cb_dm_nrl):checked').length) {
            report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrl):checked'), "\n* ");
            if ($('#cb_dm_others:checked').length) {
                report += $('#txt_dm_others').val();
            }
            report += "\n";
        }
        m_stage.push("1");
        //console.log(m_stage);
    } /* else {
        report += "* No distant metastasis in the scanned range.\n";
    } */
    if ($('.cb_dm:not(:checked)').length) {
        report += "--- No or Equivocal:\n";
        if (!$('.cb_dm_nrl:checked').length) {
            report += "* non-regional lymph node\n";
        }
        report += "* " + join_checkbox_values($('.cb_dm:not(.cb_dm_nrl):not(:checked)')) + "\n";
    }
    report += "\n";

    // Other Findings
    report += "6. Other findings:\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    let t_str = AJCC8_OVARY_T[t];
    let n_str = AJCC8_OVARY_N[n];
    let m_str = AJCC8_OVARY_M[m];
    report += ajcc_template("Ovarian Carcinoma", t, t_str, n, n_str, m, m_str);

    $('#reportModalLongTitle').html("Ovarian Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

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
