import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/cervix.html');
}

import {join_checkbox_values, ajcc_template, ajcc_template_with_parent} from './ajcc_common.js';

const AJCC_T = {
    'x': 'Primary tumor cannot be assessed',
    '0': 'No evidence of primary tumor',
    '1': 'Carcinoma is strictly confined to the cervix (extension to the corpus should be disregarded)',
    '1a': 'Invasive carcinoma that can be diagnosed only by microscopy with maximum depth of invasion ≤5 mm',
    '1a1': 'Measured stromal invasion ≤3 mm in depth',
    '1a2': 'Measured stromal invasion >3 mm and ≤5 mm in depth',
    '1b': 'Invasive carcinoma with measured deepest invasion >5 mm (greater than stage IA); lesion limited to the cervix uteri with size measured by maximum tumor diameter; note: the involvement of vascular/lymphatic spaces should not change the staging, and the lateral extent of the lesion is no longer considered',
    '1b1': 'Invasive carcinoma >5 mm depth of stromal invasion and ≤2 cm in greatest dimension',
    '1b2': 'Invasive carcinoma >2 cm and ≤4 cm in greatest dimension',
    '1b3': 'Invasive carcinoma >4 cm in greatest dimension',
    '2': 'Carcinoma invades beyond the uterus but has not extended onto the lower one-third of the vagina or to the pelvic wall',
    '2a': 'Involvement limited to the upper two-thirds of the vagina without parametrial invasion',
    '2a1': 'Invasive carcinoma ≤4 cm in greatest dimension',
    '2a2': 'Invasive carcinoma >4 cm in greatest dimension',
    '2b': 'With parametrial invasion but not up to the pelvic wall',
    '3': 'Carcinoma involves the lower one- third of the vagina and/or extends to the pelvic wall and/or causes hydronephrosis or nonfunc-tioning kidney; note: the pelvic wall is defined as the muscle, fascia, neurovascular structures, and skeletal portions of the bony pelvis; cases with no cancer-free space between the tumor and pelvic wall by rectal examination are FIGO stage III',
    '3a': 'Carcinoma involves the lower one-third of the vagina, with no extension to the pelvic wall',
    '3b': 'Extension to the pelvic wall and/or hydronephrosis or nonfunctioning kidney (unless known to be due to another cause)',
    '4': 'Carcinoma has involved (biopsy-proven) the mucosa of the bladder or rectum or has spread to adjacent organs (bullous edema, as such, does not permit a case to be assigned to stage IVA)',
};
const AJCC_N = {
    'x': 'Regional lymph node cannot be assessed',
    '0': 'No regional lymph node metastasis',
    '0(i+)': 'Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm',
    '1': 'Regional lymph node metastasis to pelvic lymph nodes only',
    '1mi': 'Regional lymph node metastasis (>0.2 mm but ≤2.0 mm in greatest dimension) to pelvic lymph nodes',
    '1a': 'Regional lymph node metastasis (>2.0 mm in greatest dimension) to pelvic lymph nodes',
    '2': 'Regional lymph node metastasis to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
    '2mi': 'Regional lymph node metastasis (>0.2 mm but ≤2.0 mm in greatest dimension) to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
    '2a': 'Regional lymph node metastasis (>2.0 mm in greatest dimension) to para-aortic lymph nodes, with or without positive pelvic lymph nodes',
};
const AJCC_M = {
    '0': 'No distant metastasis (in this study)',
    '1': 'Distant metastasis (including peritoneal spread or involvement of the supraclavicular, mediastinal, or distant lymph nodes; lung; liver; or bone)',
};

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
    report += "2. Tumor size\n";
    report += "  - Size: ";
    if ($('#cb_ts_nm').is(':checked') || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (in maximum diameter)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (in maximal diameter)`;
    }
    report += "\n\n";

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0 ? true : false;
    let ti_no_check = !has_ti ? "+" : " ";
    let ti_yes_check = has_ti ? "+" : " ";
    let ti_cx_check = $('#cb_ti_cx').is(':checked') ? "+" : " ";
    let ti_ub_check = $('#cb_ti_ub').is(':checked') ? "+" : " ";
    let ti_rpm_check = $('#cb_ti_rpm').is(':checked') ? "+" : " ";
    let ti_lpm_check = $('#cb_ti_lpm').is(':checked') ? "+" : " ";
    let ti_uv_check = $('#cb_ti_uv').is(':checked') ? "+" : " ";
    let ti_lv_check = $('#cb_ti_lv').is(':checked') ? "+" : " ";
    let ti_rpw_check = $('#cb_ti_rpw').is(':checked') ? "+" : " ";
    let ti_lpw_check = $('#cb_ti_lpw').is(':checked') ? "+" : " ";
    let ti_rh_check = $('#cb_ti_rh').is(':checked') ? "+" : " ";
    let ti_lh_check = $('#cb_ti_lh').is(':checked') ? "+" : " ";
    let ti_a_check = $('#cb_ti_a').is(':checked') ? "+" : " ";
    let ti_b_check = $('#cb_ti_b').is(':checked') ? "+" : " ";
    let ti_r_check = $('#cb_ti_r').is(':checked') ? "+" : " ";
    let ti_sc_check = $('#cb_ti_sc').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    report += `3. Tumor invasion
    [${ti_no_check}] No or Equivocal
    [${ti_yes_check}] Yes, if yes:
        [${ti_cx_check}] Cervix
        [${ti_ub_check}] Uterine body
        Parametrial invasion    [${ti_rpm_check}] Right            [${ti_lpm_check}] Left
        Vaginal invasion        [${ti_uv_check}] Upper 2/3        [${ti_lv_check}] Lower 1/3
        Pelvic sidewall         [${ti_rpw_check}] Right            [${ti_lpw_check}] Left
        Hydronephrosis          [${ti_rh_check}] Right            [${ti_lh_check}] Left
        Pelvic organs invasion:
            [${ti_a_check}] Adnexa          [${ti_b_check}] Bladder          [${ti_r_check}] Rectum
            [${ti_sc_check}] Sigmoid colon   [${ti_others_check}] Others: ${txt_ti_others}

`;

    // calculate T stage
    if ($('.cb_ti_t4:checked').length) {
        t_stage.push("4");
    } else if ($('.cb_ti_t3b:checked').length) {
        t_stage.push("3b");
    } else if ($('.cb_ti_t3a:checked').length) {
        t_stage.push("3a");
    } else if ($('.cb_ti_t2b:checked').length) {
        t_stage.push("2b");
    } else if ($('.cb_ti_t2a:checked').length) {
        t_stage.push("2a");
    } else if ($('.cb_ti_t1:checked').length) {
        if (!$('#cb_ts_nm').is(':checked') && t_length > 0) {
            t_stage.push("1b");
        } else {
            t_stage.push("1a");
        }
    } else if (t_length === 0) {
        t_stage.push("0");
    } else {
        t_stage.push("x");
    }

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let rn_no_check = !has_rln ? "+" : " ";
    let rn_yes_check = has_rln ? "+" : " ";
    let rn_rpc_check = $('#cb_rn_rpc').is(':checked') ? "+" : " ";
    let rn_lpc_check = $('#cb_rn_lpc').is(':checked') ? "+" : " ";
    let rn_rpm_check = $('#cb_rn_rpm').is(':checked') ? "+" : " ";
    let rn_lpm_check = $('#cb_rn_lpm').is(':checked') ? "+" : " ";
    let rn_ro_check = $('#cb_rn_ro').is(':checked') ? "+" : " ";
    let rn_lo_check = $('#cb_rn_lo').is(':checked') ? "+" : " ";
    let rn_ri_check = $('#cb_rn_ri').is(':checked') ? "+" : " ";
    let rn_li_check = $('#cb_rn_li').is(':checked') ? "+" : " ";
    let rn_rii_check = $('#cb_rn_rii').is(':checked') ? "+" : " ";
    let rn_lii_check = $('#cb_rn_lii').is(':checked') ? "+" : " ";
    let rn_rei_check = $('#cb_rn_rei').is(':checked') ? "+" : " ";
    let rn_lei_check = $('#cb_rn_lei').is(':checked') ? "+" : " ";
    let rn_rci_check = $('#cb_rn_rci').is(':checked') ? "+" : " ";
    let rn_lci_check = $('#cb_rn_lci').is(':checked') ? "+" : " ";
    let rn_s_check = $('#cb_rn_s').is(':checked') ? "+" : " ";
    let rn_pa_check = $('#cb_rn_pa').is(':checked') ? "+" : " ";
    report += `4. Regional nodal metastasis
    [${rn_no_check}] No or Equivocal
    [${rn_yes_check}] Yes, if yes:
        Paracervical:   [${rn_rpc_check}] Right    [${rn_lpc_check}] Left
        Parametrial:    [${rn_rpm_check}] Right    [${rn_lpm_check}] Left
        Obturator:      [${rn_ro_check}] Right    [${rn_lo_check}] Left
        Inguinal:       [${rn_ri_check}] Right    [${rn_li_check}] Left
        Internal iliac: [${rn_rii_check}] Right    [${rn_lii_check}] Left
        External iliac: [${rn_rei_check}] Right    [${rn_lei_check}] Left
        Common iliac:   [${rn_rci_check}] Right    [${rn_lci_check}] Left
        [${rn_s_check}] Sacral
        [${rn_pa_check}] Paraaortic

`;

    // calculate N stage
    if (has_rln) {
        if ($('#cb_rn_pa').is(':checked')) {
            n_stage.push("2");
        } else {
            n_stage.push("1");
        }
    }
    report += "\n";

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    report += "5. Distant metastasis (In this study)\n";
    report += "  [" + (has_dm ? " " : "+") + "] No or Equivocal\n";
    report += "  [" + (has_dm ? "+" : " ") + "] Yes, location: ";
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
    report += ajcc_template_with_parent("Cervical Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 9);

    $('#reportModalLongTitle').html("Cervical Cancer Staging Form");
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
