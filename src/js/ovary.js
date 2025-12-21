import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/ovary.html');
}

import {join_checkbox_values, ajcc_template_with_parent, generate_ajcc_table, setupReportPage} from './ajcc_common.js';
import { calculateOvaryStage } from './ovary_logic.js';

const AJCC_T = new Map([
    ['x', 'Primary tumor cannot be assessed'],
    ['0', 'No evidence of primary tumor'],
    ['1', 'Tumor limited to ovaries (one or both) or fallopian tube(s)'],
    ['1a', 'Tumor limited to one ovary (capsule intact) or fallopian tube, no tumor on ovarian or fallopian tube surface; no malignant cells in ascites or peritoneal washings'],
    ['1b', 'Tumor limited to both ovaries (capsules intact) or fallopian tubes; no tumor on ovarian or fallopian tube surface; no malignant cells in ascites or peritoneal washings'],
    ['1c', 'Tumor limited to one or both ovaries or fallopian tubes, with any of the following:'],
    ['1c1', 'Surgical spill'],
    ['1c2', 'Capsule ruptured before surgery, or tumor on ovarian surface or fallopian tube surface'],
    ['1c3', 'Malignant cells in ascites or peritoneal washings'],
    ['2', 'Tumor involves 1 or both ovaries or fallopian tubes with pelvic extension below pelvic brim or primary peritoneal cancer'],
    ['2a', 'Extension &/or implants on the uterus &/or fallopian tube(s)&/or ovaries'],
    ['2b', 'Extension to &/or implants on other pelvic tissues'],
    ['3', 'Tumor involves 1 or both ovaries or fallopian tubes, or primary peritoneal cancer, with microscopically confirmed peritoneal metastasis outside the pelvis&/or metastasis to the retroperitoneal (pelvic &/or para-aortic) lymph nodes'],
    ['3a', 'Microscopic extrapelvic (above the pelvic brim) peritoneal involvement with or without positive retroperitoneal lymph nodes'],
    ['3b', 'Macroscopic peritoneal metastasis beyond pelvis 2 cm or less in greatest dimension with or without metastasis to the retroperitoneal lymph nodes'],
    ['3c', 'Macroscopic peritoneal metastasis beyond the pelvis more than 2 cm in greatest dimension with or without metastasis to the retroperitoneal lymph nodes (includes extension of tumor to capsule of liver and spleen without parenchymal involvement of either organ)'],
]);
const AJCC_N = new Map([
    ['x', 'Regional lymph node cannot be assessed'],
    ['0', 'No regional lymph node metastasis'],
    ['0(i+)', 'Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm'],
    ['1', 'Positive retroperitoneal lymph nodes only (histologically confirmed)'],
    ['1a', 'Metastasis up to 10 mm in greatest dimension'],
    ['1b', 'Metastasis more than 10 mm in greatest dimension'],
]);
const AJCC_M = new Map([
    ['0', 'No distant metastasis (in this study)'],
    ['1', 'Distant metastasis, including pleural effusion with positive cytology; liver or splenic parenchymal metastasis; metastasis to extra-abdominal organs (including inguinal lymph nodes and lymph nodes outside the abdominal cavity); and transmural involvement of intestine'],
    ['1a', 'Pleural effusion with positive cytology'],
    ['1b', 'Liver or splenic parenchymal metastasis; metastasis to extra-abdominal organs (including inguinal lymph nodes and lymph nodes outside the abdominal cavity); transmural involvement of intestine'],
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

    // Tumor size
    report += "2. Tumor size\n";
    report += "  - Location: at ";
    $('input[name=radio_tl]').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `(${check_or_not}) ` + $(this).val() + '  ';
    });
    report += "\n";

    let has_ts_nm = $('#cb_ts_nm').is(':checked');
    let t_length = parseFloat($('#txt_ts_len').val());
    report += "  - Size: ";
    if (has_ts_nm || !t_length) {
        report += `
    [+] Non-measurable
    [ ] Measurable: ___ cm (greatest dimension)`;
    } else {
        report += `
    [ ] Non-measurable
    [+] Measurable: ${t_length} cm (greatest dimension)`;
    }
    report += "\n";
    report += "  - Content: ";
    $('input[name=radio_tc]').each(function(){
        let check_or_not = $(this).is(':checked') ? "+" : " ";
        report += `(${check_or_not}) ` + $(this).val() + '  ';
    });
    report += "\n\n";

    // Tumor invasion
    let has_ti = $('.cb_ti:checked').length > 0;
    let ti_lo_check = !has_ti && !has_ts_nm && t_length ? "+" : " ";
    let ti_t2_check = $('.cb_ti_t2:checked').length > 0 ? "+" : " ";
    let ti_t2_u_check = $('#cb_ti_t2_u').is(':checked') ? "+" : " ";
    let ti_t2_ft_check = $('#cb_ti_t2_ft').is(':checked') ? "+" : " ";
    let ti_t2_lb_check = $('#cb_ti_t2_lb').is(':checked') ? "+" : " ";
    let ti_t2_ub_check = $('#cb_ti_t2_ub').is(':checked') ? "+" : " ";
    let ti_t2_sb_check = $('#cb_ti_t2_sb').is(':checked') ? "+" : " ";
    let ti_t2_o_check = $('#cb_ti_t2_o').is(':checked') ? "+" : " ";
    let ti_t3_check = $('.cb_ti_t3:checked').length > 0 ? "+" : " ";
    let ti_t3_lb_check = $('#cb_ti_t3_lb').is(':checked') ? "+" : " ";
    let ti_t3_sb_check = $('#cb_ti_t3_sb').is(':checked') ? "+" : " ";
    let ti_t3_s_check = $('#cb_ti_t3_s').is(':checked') ? "+" : " ";
    let ti_t3_lvs_check = $('#cb_ti_t3_lvs').is(':checked') ? "+" : " ";
    let ti_t3_sps_check = $('#cb_ti_t3_sps').is(':checked') ? "+" : " ";
    let ti_t3_o_check = $('#cb_ti_t3_o').is(':checked') ? "+" : " ";
    let ti_t3_ph_check = $('#cb_ti_t3_ph').is(':checked') ? "+" : " ";
    let ti_t3_ls_check = $('#cb_ti_t3_ls').is(':checked') ? "+" : " ";
    let ti_t3_ghl_check = $('#cb_ti_t3_ghl').is(':checked') ? "+" : " ";
    let ti_t3_fl_check = $('#cb_ti_t3_fl').is(':checked') ? "+" : " ";
    let ti_others_check = $('#cb_ti_others').is(':checked') ? "+" : " ";
    let txt_ti_others = $('#txt_ti_others').val() ? $('#txt_ti_others').val() : "___";
    let ti_t3_less_2cm_check = $('.cb_ti_t3:checked').length > 0 && $('#cb_ti_t3_2cm').is(':checked') ? " " : "+";
    let ti_t3_more_2cm_check = $('.cb_ti_t3:checked').length > 0 && $('#cb_ti_t3_2cm').is(':checked') ? "+" : " ";
    let ti_a_check = $('#cb_ti_a').is(':checked') ? "+" : " ";
    report += `3. Tumor invasion
    [${ti_lo_check}] Limited to ovary
    [${ti_t2_check}] Visible tumor implant or peritoneal thickening below pelvic brim
        If yes, involving
            [${ti_t2_u_check}] Uterus             [${ti_t2_ft_check}] Fallopian tube   [${ti_t2_lb_check}] Large bowel
            [${ti_t2_ub_check}] Urinary bladder    [${ti_t2_sb_check}] Small bowel      [${ti_t2_o_check}] Omentum
    [${ti_t3_check}] Visible tumor implant or peritoneal thickening outside pelvis
        If yes, [${ti_t3_less_2cm_check}] <2cm  [${ti_t3_more_2cm_check}] >2cm; involving
            [${ti_t3_lb_check}] Large bowel        [${ti_t3_sb_check}] Small bowel      [${ti_t3_s_check}] Spleen              [${ti_t3_lvs_check}] Liver surface
            [${ti_t3_sps_check}] Subphrenic space   [${ti_t3_o_check}] Omentum          [${ti_t3_ph_check}] Porta hepatic       [${ti_t3_ls_check}] Lesser sac
            [${ti_t3_ghl_check}] Gastrohepatic ligament                  [${ti_t3_fl_check}] Falciform ligament
            [${ti_others_check}] Others ${txt_ti_others}
    [${ti_a_check}] Ascites
    `;

    // Calculate staging via Logic
    const data = {
        tumorSize: t_length,
        hasInvasion: has_ti,
        isBilateral: $('input[name=radio_tl]:checked').val() == 'bilateral',
        invasion: {
            t3: $('.cb_ti_t3:checked').length > 0,
            t3_gt_2cm: $('#cb_ti_t3_2cm').is(':checked'),
            t2: $('.cb_ti_t2:checked').length > 0,
            t2a: $('.cb_ti_t2a:checked').length > 0,
            t2b: $('.cb_ti_t2b:checked').length > 0
        },
        hasNodes: $('.cb_rn:checked').length > 0,
        hasMetastasis: $('.cb_dm:checked').length > 0
    };

    const stageResult = calculateOvaryStage(data);
    const t_stage = stageResult.t;
    const n_stage = stageResult.n;
    const m_stage = stageResult.m;

    report += "\n";

    // Regional nodal metastasis
    let has_rln = $('.cb_rn:checked').length > 0;
    let rn_no_check = !has_rln ? "+" : " ";
    let rn_yes_check = has_rln ? "+" : " ";
    let rn_rei_check = $('#cb_rn_rei').is(':checked') ? "+" : " ";
    let rn_lei_check = $('#cb_rn_lei').is(':checked') ? "+" : " ";
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
    let rn_rci_check = $('#cb_rn_rci').is(':checked') ? "+" : " ";
    let rn_lci_check = $('#cb_rn_lci').is(':checked') ? "+" : " ";
    let rn_paim_check = $('#cb_rn_paim').is(':checked') ? "+" : " ";
    let rn_pair_check = $('#cb_rn_pair').is(':checked') ? "+" : " ";
    let rn_pasr_check = $('#cb_rn_pasr').is(':checked') ? "+" : " ";
    report += `4. Regional nodal metastasis
    [${rn_no_check}] No or Equivocal
    [${rn_yes_check}] Yes, if yes:
        External iliac: [${rn_rei_check}] Right            [${rn_lei_check}] Left
        Internal iliac: [${rn_rii_check}] Right            [${rn_lii_check}] Left
        Obturator:      [${rn_ro_check}] Right            [${rn_lo_check}] Left
        Common iliac:   [${rn_rci_check}] Right            [${rn_lci_check}] Left
        Inguinal:       [${rn_ri_check}] Right            [${rn_li_check}] Left
        Paraaortic:     [${rn_paim_check}] Inframesenteric  [${rn_pair_check}] Infrarenal  [${rn_pasr_check}] Suprarenal

`;

    // calculate N stage (Calculated via Logic)

    // Distant metastasis
    let has_dm = $('.cb_dm:checked').length > 0;
    let dm_no_check = !has_dm ? "+" : " ";
    let dm_yes_check = has_dm ? "+" : " ";
    let dm_nrl_check = $('#cb_dm_nrl').is(':checked') ? "+" : " ";
    let dm_li_check = $('#cb_dm_li').is(':checked') ? "+" : " ";
    let dm_lu_check = $('#cb_dm_lu').is(':checked') ? "+" : " ";
    let dm_pl_check = $('#cb_dm_pl').is(':checked') ? "+" : " ";
    let dm_ad_check = $('#cb_dm_ad').is(':checked') ? "+" : " ";
    let dm_b_check = $('#cb_dm_b').is(':checked') ? "+" : " ";
    let dm_others_check = $('#cb_dm_others').is(':checked') ? "+" : " ";
    let txt_dm_others = $('#txt_dm_others').val() ? $('#txt_dm_others').val() : "___";
    report += `5. Distant metastasis (In this study)
    [${dm_no_check}] No or Equivocal
    [${dm_yes_check}] Yes, if yes:
        [${dm_nrl_check}] Non-regional lymph nodes    [${dm_li_check}] Liver            [${dm_lu_check}] Lung
        [${dm_pl_check}] Pleura                      [${dm_ad_check}] Adrenal          [${dm_b_check}] Bone
        [${dm_others_check}] Others: ${txt_dm_others}

`;

    // M stage calculated via logic


    // Other Findings
    report += "6. Other findings\n\n\n";

    // AJCC staging reference text
    let t = t_stage.sort()[t_stage.length-1];
    let n = n_stage.sort()[n_stage.length-1];
    let m = m_stage.sort()[m_stage.length-1];
    report += ajcc_template_with_parent("Ovarian Carcinoma", t, AJCC_T, n, AJCC_N, m, AJCC_M, 8);

    $('#reportModalLongTitle').html("Ovarian Cancer Staging Form");
    $('#reportModalBody pre code').html(report);
    $('#reportModalLong').modal('show');
}

$('#cb_tp_ts_nm').change(function() {
    if($("form.was-validated").length) {

    }
});

setupReportPage({
    generateReportFn: generate_report,
    ajccData: {
        T: AJCC_T,
        N: AJCC_N,
        M: AJCC_M
    },
    ajccTitleHtml: "AJCC Definitions for Ovarian Carcinoma <span class='badge badge-secondary ml-2' style='font-size: 60%; vertical-align: super;'>8th</span>"
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
