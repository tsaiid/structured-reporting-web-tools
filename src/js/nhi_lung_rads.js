import '@picocss/pico/css/pico.min.css';
import '../css/nhi_lung_rads.css';
import {
  calculateLungRadsCategory,
  generateReportText as formatReportText,
  generateNoduleText,
} from './nhi_lung_rads_logic.js';
import {
  initTheme,
  toggleTheme as coreToggleTheme,
} from './theme.js';

// 解除 Anti-FOUC 遮罩，顯示已注入樣式之頁面
if (typeof document !== 'undefined') {
  if (document.body) {
    document.body.classList.add('ready');
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('ready');
    });
  }
}

const $ = (id) => document.getElementById(id);
const getValue = (id) => $(id)?.value.trim() || "";
const isChecked = (id) => Boolean($(id)?.checked);
const getRadio = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value || "";

document.addEventListener("input", function (e) {
  if (e.target.classList.contains("num-only")) {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }
    e.target.value = val;
  }
});

// Theme 記憶功能與切換邏輯
function syncThemeToggle(theme) {
  const toggle = document.getElementById("theme_toggle");
  if (toggle) {
    toggle.checked = theme === "dark";
  }
}

function toggleTheme() {
  const newTheme = coreToggleTheme();
  syncThemeToggle(newTheme);
  return newTheme;
}

initTheme((theme) => {
  syncThemeToggle(theme);
});

function toggleSection(elementId, show) {
  const el = $(elementId);
  if (show) el.classList.remove("hidden");
  else el.classList.add("hidden");
}
function handleNoduleGte6Change(isChecked) {
  toggleSection("nodule_details", isChecked);
  if (isChecked) {
    const radio = document.querySelector(
      'input[name="total_nodules"]:checked',
    );
    if (!radio) {
      const r1 = document.querySelector(
        'input[name="total_nodules"][value="1"]',
      );
      if (r1) {
        r1.checked = true;
        updateNoduleCount();
      }
    }
  }
}
/* --- [新增] No Nodule 與 Positive Findings 互斥與視覺控制邏輯 --- */

function toggleNoNodule(isChecked) {
  const groupIds = [
    "benign_features",
    "nodule_lt6",
    "juxtapleural",
    "nodule_gte6",
  ];
  const groupDiv = document.getElementById("positive_nodule_group");

  // 1. 視覺控制：切換容器的禁用樣式
  if (isChecked) {
    groupDiv.classList.add("disabled-group");
  } else {
    groupDiv.classList.remove("disabled-group");
  }

  // 2. 邏輯控制：取消勾選並禁用/啟用內部選項
  groupIds.forEach((id) => {
    const el = $(id);
    if (isChecked) {
      el.checked = false;
      // 特殊處理：連動隱藏細節區塊
      if (id === "nodule_gte6") handleNoduleGte6Change(false);
    }
    el.disabled = isChecked;
  });

  // 連動禁用/啟用 <6mm 選項內的文字輸入框
  $("lt6_se").disabled = isChecked;
  $("lt6_im").disabled = isChecked;

  // 觸發重新計算 (確保 Category 1 能正確自動判定)
  autoCalculateCategory();
}

function updateNoNoduleState() {
  const groupIds = [
    "benign_features",
    "nodule_lt6",
    "juxtapleural",
    "nodule_gte6",
  ];
  const anyChecked = groupIds.some((id) => isChecked(id));
  const noNoduleCheckbox = $("no_nodule");

  // 1. 邏輯控制
  if (anyChecked) {
    // 如果勾選了任何結節選項，No Nodule 自動取消並禁用
    noNoduleCheckbox.checked = false;
    noNoduleCheckbox.disabled = true;

    // 確保容器是啟用狀態 (移除 disabled-group)
    document
      .getElementById("positive_nodule_group")
      .classList.remove("disabled-group");
  } else {
    // 如果全部都沒勾，No Nodule 恢復可選
    noNoduleCheckbox.disabled = false;
  }

  // 觸發重新計算
  autoCalculateCategory();
}
function toggleSolidPart(containerId, densityValue) {
  const container = $(containerId);
  if (densityValue === "part-solid") container.classList.remove("hidden");
  else container.classList.add("hidden");
}
function updateAirwayParent() {
  $("airway_proximal").checked =
    isChecked("airway_secretions") ||
    isChecked("airway_baseline") ||
    isChecked("airway_stable");
}
function clearAirwayChildren(parentIsChecked) {
  if (!parentIsChecked) {
    $("airway_secretions").checked = false;
    $("airway_baseline").checked = false;
    $("airway_stable").checked = false;
  }
}
function handleCategoryChange() {
  if (getRadio("category") !== "0") {
    $("cat_0_prior").checked = false;
    $("cat_0_unevaluated").checked = false;
    $("cat_0_inflammatory").checked = false;
  }
}
function updateCat0Radio() {
  if (
    isChecked("cat_0_prior") ||
    isChecked("cat_0_unevaluated") ||
    isChecked("cat_0_inflammatory")
  ) {
    document.querySelector('input[name="category"][value="0"]').checked =
      true;
  }
}
function updateNoduleCount() {
  const val = getRadio("total_nodules");
  const show = (id, enable) => {
    const el = $(id);
    const checkId = id.replace("block_", "") + "_enable";
    const checkEl = $(checkId);
    if (enable) {
      el.classList.remove("hidden");
      if (checkEl) checkEl.checked = true;
    } else {
      el.classList.add("hidden");
      if (checkEl) checkEl.checked = false;
    }
  };
  let count = 0;
  if (val === "1") count = 1;
  if (val === "2") count = 2;
  if (val === "3") count = 3;
  if (val === ">=4") count = 4;
  show("block_n1", count >= 1);
  show("block_n2", count >= 2);
  show("block_n3", count >= 3);
  show("block_else", count >= 4);
}

let noduleToDelete = null;
function promptDelete(index) {
  noduleToDelete = index;
  openModal("delete_modal");
}
function confirmDelete() {
  if (noduleToDelete === null) return;
  const index = noduleToDelete;
  closeModal("delete_modal");
  const radio = document.querySelector(
    'input[name="total_nodules"]:checked',
  );
  if (!radio) return;
  let currentCountStr = radio.value;
  let currentCount = 0;
  if (currentCountStr === "1") currentCount = 1;
  else if (currentCountStr === "2") currentCount = 2;
  else if (currentCountStr === "3") currentCount = 3;
  else if (currentCountStr === ">=4") currentCount = 4;
  for (let i = index; i < 3; i++) {
    let next = i + 1;
    $(`n${i}_size`).value = $(`n${next}_size`).value;
    $(`n${i}_solid_part`).value = $(`n${next}_solid_part`).value;
    $(`n${i}_se`).value = $(`n${next}_se`).value;
    $(`n${i}_im`).value = $(`n${next}_im`).value;
    let nextDensity = getRadio(`n${next}_density`);
    if (nextDensity) {
      let r = document.querySelector(
        `input[name="n${i}_density"][value="${nextDensity}"]`,
      );
      if (r) r.checked = true;
      toggleSolidPart(`n${i}_solid_container`, nextDensity);
    } else {
      document
        .querySelectorAll(`input[name="n${i}_density"]`)
        .forEach((el) => (el.checked = false));
      toggleSolidPart(`n${i}_solid_container`, "");
    }
    let nextLobe = getRadio(`n${next}_lobe`);
    if (nextLobe) {
      let r = document.querySelector(
        `input[name="n${i}_lobe"][value="${nextLobe}"]`,
      );
      if (r) r.checked = true;
    } else {
      document
        .querySelectorAll(`input[name="n${i}_lobe"]`)
        .forEach((el) => (el.checked = false));
    }
    let nextStatus = getRadio(`n${next}_status`);
    if (nextStatus) {
      let r = document.querySelector(
        `input[name="n${i}_status"][value="${nextStatus}"]`,
      );
      if (r) r.checked = true;
    } else {
      document
        .querySelectorAll(`input[name="n${i}_status"]`)
        .forEach((el) => (el.checked = false));
    }
  }
  let clearIndex = currentCount;
  if (currentCount >= 4) clearIndex = 3;
  if (clearIndex <= 3) {
    $(`n${clearIndex}_size`).value = "";
    $(`n${clearIndex}_solid_part`).value = "";
    $(`n${clearIndex}_se`).value = "";
    $(`n${clearIndex}_im`).value = "";
    document
      .querySelectorAll(`input[name="n${clearIndex}_density"]`)
      .forEach((el) => (el.checked = false));
    toggleSolidPart(`n${clearIndex}_solid_container`, "");
    document
      .querySelectorAll(`input[name="n${clearIndex}_lobe"]`)
      .forEach((el) => (el.checked = false));
    document
      .querySelectorAll(`input[name="n${clearIndex}_status"]`)
      .forEach((el) => (el.checked = false));
  }
  if (currentCount === 1) {
    document
      .querySelectorAll('input[name="total_nodules"]')
      .forEach((el) => (el.checked = false));
    const mainCheck = $("nodule_gte6");
    if (mainCheck) {
      mainCheck.checked = false;
      handleNoduleGte6Change(false);
    }
    $("block_n1").classList.add("hidden");
    $("n1_enable").checked = false;
  } else {
    let newCount = currentCount - 1;
    let radioVal = String(newCount);
    if (newCount >= 4) radioVal = ">=4";
    const r = document.querySelector(
      `input[name="total_nodules"][value="${radioVal}"]`,
    );
    if (r) {
      r.checked = true;
      updateNoduleCount();
    }
  }
  autoCalculateCategory();
  noduleToDelete = null;
}

function handlePriorDateInput() {
  const hasText = getValue("prior_date").length > 0;
  const noPriorCheckbox = $("no_prior");
  if (hasText) {
    noPriorCheckbox.checked = false;
    noPriorCheckbox.disabled = true;
  } else {
    noPriorCheckbox.disabled = false;
  }
  updateNoduleStatusBasedOnPrior(hasText);
}
function togglePriorDate(isNoPriorChecked) {
  const priorDateInput = $("prior_date");
  if (isNoPriorChecked) {
    priorDateInput.value = "";
    priorDateInput.disabled = true;
    updateNoduleStatusBasedOnPrior(false, true);
  } else {
    priorDateInput.disabled = false;
    updateNoduleStatusBasedOnPrior(false, false);
  }
}
function updateNoduleStatusBasedOnPrior(
  hasDate,
  isNoPriorChecked = false,
) {
  for (let i = 1; i <= 3; i++) {
    const noPriorRadio = document.querySelector(
      `input[name="n${i}_status"][value="no prior"]`,
    );
    if (!noPriorRadio) continue;
    if (hasDate) {
      noPriorRadio.disabled = true;
      if (noPriorRadio.checked) noPriorRadio.checked = false;
    } else {
      if (isNoPriorChecked || !getValue("prior_date")) {
        noPriorRadio.disabled = false;
        const anyChecked = document.querySelector(
          `input[name="n${i}_status"]:checked`,
        );
        if (!anyChecked) noPriorRadio.checked = true;
      } else {
        noPriorRadio.disabled = false;
      }
    }
  }
}

const openModal = (target) => $(target)?.showModal();
const closeModal = (target) => $(target)?.close();
const toggleModal = (event) => {
  event.preventDefault();
  const modalId = event.currentTarget.dataset.target;
  const modal = $(modalId);
  modal.open ? closeModal(modalId) : openModal(modalId);
};
function closeModalOnBackdrop(event) {
  if (event.target.tagName === "DIALOG") {
    event.target.close();
  }
}
window.onscroll = function () {
  const footer = $("sticky-footer");
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 50
  ) {
    footer.classList.add("visible");
  } else {
    footer.classList.remove("visible");
  }
};

function validateForm() {
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
  let errors = [];
  if (!getValue("ctdi")) errors.push({ id: "ctdi" });
  if (!getValue("dlp")) errors.push({ id: "dlp" });
  const priorDate = getValue("prior_date");
  const noPrior = isChecked("no_prior");
  if (!priorDate && !noPrior) {
    errors.push({ id: "prior_date" });
  }
  if (isChecked("nodule_gte6")) {
    const totalNodules = getRadio("total_nodules");
    let count = 0;
    if (totalNodules === "1") count = 1;
    else if (totalNodules === "2") count = 2;
    else if (totalNodules === "3") count = 3;
    else if (totalNodules === ">=4") count = 3;
    for (let i = 1; i <= count; i++) {
      if (!getValue(`n${i}_size`)) errors.push({ id: `n${i}_size` });
      const density = getRadio(`n${i}_density`);
      if (!density) {
        errors.push({ id: `n${i}_density_group` });
      } else if (density === "part-solid") {
        if (!getValue(`n${i}_solid_part`))
          errors.push({ id: `n${i}_solid_part` });
      }
      if (!getRadio(`n${i}_lobe`))
        errors.push({ id: `n${i}_lobe_group` });
      if (!getRadio(`n${i}_status`))
        errors.push({ id: `n${i}_status_group` });
    }
  }
  if (errors.length > 0) {
    const firstId = errors[0].id;
    const el = $(firstId);
    errors.forEach((e) => {
      const elem = $(e.id);
      if (elem) elem.classList.add("input-error");
    });
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el.tagName === "INPUT") el.focus();
    }
    return false;
  }
  return true;
}
function validateAndCopy(type) {
  if (!validateForm()) return;
  if (type === "full") generateAndCopyFull();
  else generateAndCopySimple();
}

function collectFormData() {
  return {
    quality: getRadio("quality") || "Good",
    ctdi: getValue("ctdi"),
    dlp: getValue("dlp"),
    priorDate: getValue("prior_date"),
    noPrior: isChecked("no_prior"),
    noNodule: isChecked("no_nodule"),
    benignFeatures: isChecked("benign_features"),
    noduleLt6: isChecked("nodule_lt6"),
    lt6Se: getValue("lt6_se"),
    lt6Im: getValue("lt6_im"),
    juxtapleural: isChecked("juxtapleural"),
    noduleGte6: isChecked("nodule_gte6"),
    totalNodules: getRadio("total_nodules"),
    nodules: [1, 2, 3].map((i) => ({
      enabled: isChecked(`n${i}_enable`),
      size: getValue(`n${i}_size`),
      density: getRadio(`n${i}_density`),
      solidPart: getValue(`n${i}_solid_part`),
      se: getValue(`n${i}_se`),
      im: getValue(`n${i}_im`),
      lobe: getRadio(`n${i}_lobe`),
      status: getRadio(`n${i}_status`),
    })),
    elseNodules: {
      rul: isChecked("else_rul"),
      rml: isChecked("else_rml"),
      rll: isChecked("else_rll"),
      lul: isChecked("else_lul"),
      lll: isChecked("else_lll"),
      se: getValue("else_se"),
      im: getValue("else_im"),
    },
    airway: {
      subsegmental: isChecked("airway_subsegmental"),
      proximal: isChecked("airway_proximal"),
      secretions: isChecked("airway_secretions"),
      baseline: isChecked("airway_baseline"),
      stable: isChecked("airway_stable"),
    },
    cysts: {
      cyst_3: isChecked("cyst_3"),
      cyst_3_se: getValue("cyst_3_se"),
      cyst_3_im: getValue("cyst_3_im"),
      cyst_3_rul: isChecked("cyst_3_rul"),
      cyst_3_rml: isChecked("cyst_3_rml"),
      cyst_3_rll: isChecked("cyst_3_rll"),
      cyst_3_lul: isChecked("cyst_3_lul"),
      cyst_3_lll: isChecked("cyst_3_lll"),

      cyst_4a: isChecked("cyst_4a"),
      cyst_4a_se: getValue("cyst_4a_se"),
      cyst_4a_im: getValue("cyst_4a_im"),
      cyst_4a_rul: isChecked("cyst_4a_rul"),
      cyst_4a_rml: isChecked("cyst_4a_rml"),
      cyst_4a_rll: isChecked("cyst_4a_rll"),
      cyst_4a_lul: isChecked("cyst_4a_lul"),
      cyst_4a_lll: isChecked("cyst_4a_lll"),

      cyst_4b: isChecked("cyst_4b"),
      cyst_4b_se: getValue("cyst_4b_se"),
      cyst_4b_im: getValue("cyst_4b_im"),
      cyst_4b_rul: isChecked("cyst_4b_rul"),
      cyst_4b_rml: isChecked("cyst_4b_rml"),
      cyst_4b_rll: isChecked("cyst_4b_rll"),
      cyst_4b_lul: isChecked("cyst_4b_lul"),
      cyst_4b_lll: isChecked("cyst_4b_lll"),
    },
    metastases: isChecked("metastases"),
    otherLung: {
      emphysema: isChecked("other_emphysema"),
      bronchiectasis: isChecked("other_bronchiectasis"),
      bronchitis: isChecked("other_bronchitis"),
      treeinbud: isChecked("other_treeinbud"),
      centrilobular: isChecked("other_centrilobular"),
      tb: isChecked("other_tb"),
      ild: isChecked("other_ild"),
      otherCheck: isChecked("other_other_lung_check"),
      otherText: getValue("other_other_lung_text"),
    },
    otherFindings: {
      lymph: getValue("other_lymph"),
      coronaryLad: isChecked("coronary_lad"),
      coronaryLcx: isChecked("coronary_lcx"),
      coronaryRca: isChecked("coronary_rca"),
      chest: getValue("other_chest"),
      abnormal: getValue("other_abnormal"),
    },
    category: getRadio("category"),
    cat0: {
      prior: isChecked("cat_0_prior"),
      unevaluated: isChecked("cat_0_unevaluated"),
      inflammatory: isChecked("cat_0_inflammatory"),
    },
    modifierS: isChecked("modifier_s"),
    referOpd: isChecked("refer_opd"),
  };
}

function generateReportText(dataOrIsSimple = false, maybeSimple) {
  if (typeof dataOrIsSimple === "boolean") {
    return formatReportText(collectFormData(), dataOrIsSimple);
  }
  if (!dataOrIsSimple || typeof dataOrIsSimple !== "object") {
    return formatReportText(collectFormData(), Boolean(maybeSimple));
  }
  return formatReportText(dataOrIsSimple, Boolean(maybeSimple));
}

function copyToClipboardAndShowModal(report, buttonId, title) {
  navigator.clipboard
    .writeText(report)
    .then(() => {
      $("modal_output").textContent = report;
      $("modal_title").textContent = title + " (已複製到剪貼簿)";
      openModal("report_modal");
      const btn = $(buttonId);
      const originalText =
        buttonId === "copy_button" ? "複製完整報告" : "複製簡易報告";
      btn.innerHTML = "✓ 已複製！";
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 2000);
    })
    .catch((err) => {
      console.error("複製失敗: ", err);
      alert("複製失敗。請檢查您的瀏覽器權限設定。");
    });
}
function generateAndCopyFull() {
  const report = generateReportText(false);
  copyToClipboardAndShowModal(report, "copy_button", "完整報告內容");
}
function generateAndCopySimple() {
  const report = generateReportText(true);
  copyToClipboardAndShowModal(
    report,
    "copy_simple_button",
    "簡易報告內容",
  );
}

function autoCalculateCategory(data) {
  const formData = data && typeof data === "object" ? data : collectFormData();
  const category = calculateLungRadsCategory(formData);
  if (category && typeof document !== "undefined") {
    checkCategoryRadio(category);
  }
  return category;
}

function checkCategoryRadio(val) {
  const radio = document.querySelector(
    `input[name="category"][value="${val}"]`,
  );
  if (radio && !radio.checked) radio.checked = true;
}

document
  .querySelector("main")
  ?.addEventListener("change", autoCalculateCategory);
document
  .querySelector("main")
  ?.addEventListener("input", autoCalculateCategory);

// Expose functions to global window object
window.toggleTheme = toggleTheme;
window.toggleSection = toggleSection;
window.handleNoduleGte6Change = handleNoduleGte6Change;
window.toggleNoNodule = toggleNoNodule;
window.updateNoNoduleState = updateNoNoduleState;
window.toggleSolidPart = toggleSolidPart;
window.updateAirwayParent = updateAirwayParent;
window.clearAirwayChildren = clearAirwayChildren;
window.handleCategoryChange = handleCategoryChange;
window.updateCat0Radio = updateCat0Radio;
window.updateNoduleCount = updateNoduleCount;
window.promptDelete = promptDelete;
window.confirmDelete = confirmDelete;
window.handlePriorDateInput = handlePriorDateInput;
window.togglePriorDate = togglePriorDate;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleModal = toggleModal;
window.closeModalOnBackdrop = closeModalOnBackdrop;
window.validateAndCopy = validateAndCopy;
window.autoCalculateCategory = autoCalculateCategory;
window.generateReportText = generateReportText;

export {
  autoCalculateCategory,
  calculateLungRadsCategory,
  generateReportText,
  generateNoduleText,
  collectFormData,
};
