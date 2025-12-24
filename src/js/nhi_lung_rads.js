import '../css/nhi_lung_rads.css';

const $ = (id) => document.getElementById(id);
const getValue = (id) => $(id).value.trim();
const isChecked = (id) => $(id).checked;
const getRadio = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value || "";
const cb = (id, text) => `${isChecked(id) ? "[+]" : "[ ]"} ${text}\n`;
const rb = (name, value, text) =>
  `${getRadio(name) === value ? "[+]" : "[ ]"} ${text}\n`;
const rb_inline = (name, value, text) =>
  `${getRadio(name) === value ? "[+]" : "[ ]"} ${text}`;
const cb_inline = (id, text) =>
  `${isChecked(id) ? "[+]" : "[ ]"} ${text}`;
const txt = (id, prefix = "", suffix = "") => {
  const val = getValue(id);
  return `${prefix}${val || "_"}${suffix}`;
};
const cb_se_im = (id_check, text, id_se, id_im, isSimple) => {
  if (isSimple && !isChecked(id_check)) return "";
  if (isChecked(id_check)) {
    const se = getValue(id_se) ? ` SE: ${getValue(id_se)}` : " SE: _";
    const im = getValue(id_im) ? `, IM: ${getValue(id_im)}` : ", IM: _";
    return `[+] ${text} (${se}${im})\n`;
  }
  return `[ ] ${text} (選填 SE: , IM:  )\n`;
};

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
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const toggle = document.getElementById("theme_toggle");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (toggle) toggle.checked = savedTheme === "dark";
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (toggle) toggle.checked = prefersDark;
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  const toggle = document.getElementById("theme_toggle");
  if (toggle) toggle.checked = newTheme === "dark";
}

initTheme();

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

function generateNoduleText(n, isSimple) {
  const enabled = isChecked(`n${n}_enable`);
  if (isSimple && !enabled) return "";
  const isPopulated = enabled;
  let text = `  ${isPopulated ? "[+]" : "[ ]"} Lung nodule ${n} (size, character and location)\n`;
  text += `    Entire Nodule: ${isPopulated ? txt(`n${n}_size`, "", " mm") : "_ mm"}\n`;
  const density = isPopulated ? getRadio(`n${n}_density`) : "";
  text += `    Density: ${density === "non-solid" ? "[+]" : "[ ]"} non-solid  `;
  text += `${density === "part-solid" ? "[+]" : "[ ]"} part-solid (solid part: ${density === "part-solid" ? txt(`n${n}_solid_part`, "", " mm") : "___ mm"}) `;
  text += `${density === "solid" ? "[+]" : "[ ]"} solid\n`;
  text += `    Lobe: (SE:${isPopulated ? txt(`n${n}_se`) : "_"}, IM:${isPopulated ? txt(`n${n}_im`) : "_"}) `;
  text += `${isPopulated ? rb_inline(`n${n}_lobe`, "RUL", "RUL") : "[ ] RUL"} `;
  text += `${isPopulated ? rb_inline(`n${n}_lobe`, "RML", "RML") : "[ ] RML"} `;
  text += `${isPopulated ? rb_inline(`n${n}_lobe`, "RLL", "RLL") : "[ ] RLL"} `;
  text += `${isPopulated ? rb_inline(`n${n}_lobe`, "LUL", "LUL") : "[ ] LUL"} `;
  text += `${isPopulated ? rb_inline(`n${n}_lobe`, "LLL", "LLL") : "[ ] LLL"}\n`;
  text += `    The nodule is ${isPopulated ? rb_inline(`n${n}_status`, "unchanged", "unchanged") : "[ ] unchanged"} `;
  text += `${isPopulated ? rb_inline(`n${n}_status`, "enlarging", "enlarging (>1.5 mm)") : "[ ] enlarging (>1.5 mm)"} `;
  text += `${isPopulated ? rb_inline(`n${n}_status`, "newly found", "newly found (≧4 mm)") : "[ ] newly found (≧4 mm)"} `;
  text += `${isPopulated ? rb_inline(`n${n}_status`, "no prior", "No prior chest CT comparison") : "[ ] No prior chest CT comparison"}`;
  return text;
}
function generateReportText(isSimple = false) {
  let report = "";
  const add = (text) => {
    report += text;
  };
  const addLine = (condition, lineGenerator) => {
    if (!isSimple || condition) add(lineGenerator());
  };
  const addLineCb = (id, text) =>
    addLine(isChecked(id), () => cb(id, text));
  report += `LDCT Quality: ${rb_inline("quality", "Good", "Good")} ${rb_inline("quality", "Acceptable", "Acceptable")} ${rb_inline("quality", "Not Acceptable", "Not Acceptable")}\n`;
  report += `CTDIvol: ${txt("ctdi")} mGy Total DLP: ${txt("dlp")} mGy*cm\n`;
  report += `In comparison with the prior CT, Date (Y/M/D) ${txt("prior_date")} ${cb("no_prior", "No prior chest CT available")}`;
  report += "\nLung nodule findings related to cancer screening\n";
  report += "詳細規範請參閱 Lung-RADS v2022\n\n";
  addLineCb("no_nodule", "No lung nodule");
  addLineCb("benign_features", "Nodule with benign features.");
  addLine(isChecked("nodule_lt6"), () =>
    cb_se_im("nodule_lt6", "Lung nodule(s) (<6mm)", "lt6_se", "lt6_im"),
  );
  addLineCb("juxtapleural", "Juxtapleural nodule.");
  const isGte6Checked = isChecked("nodule_gte6");
  if (isSimple) {
    if (isGte6Checked) {
      report +=
        "[+] Lung nodule(s) (≧6mm or enlarging>1.5mm or new≧4mm): total number ";
      report += `${rb_inline("total_nodules", "1", "1")} ${rb_inline("total_nodules", "2", "2")} ${rb_inline("total_nodules", "3", "3")} ${rb_inline("total_nodules", ">=4", "≥4")}`;
      report += ", and described as followings:\n";
      report +=
        generateNoduleText(1, true) +
        (isChecked("n1_enable") ? "\n\n" : "");
      report +=
        generateNoduleText(2, true) +
        (isChecked("n2_enable") ? "\n\n" : "");
      report +=
        generateNoduleText(3, true) +
        (isChecked("n3_enable") ? "\n\n" : "");
    }
  } else {
    report += `${isGte6Checked ? "[+]" : "[ ]"} Lung nodule(s) (≧6mm or enlarging>1.5mm or new≧4mm): total number `;
    report += `${rb_inline("total_nodules", "1", "1")} ${rb_inline("total_nodules", "2", "2")} ${rb_inline("total_nodules", "3", "3")} ${rb_inline("total_nodules", ">=4", "≥4")}`;
    report += ", and described as followings:\n";
    report += generateNoduleText(1, false) + "\n\n";
    report += generateNoduleText(2, false) + "\n\n";
    report += generateNoduleText(3, false) + "\n\n";
  }
  const showElse = getRadio("total_nodules") === ">=4";
  const elseLobesChecked =
    isChecked("else_rul") ||
    isChecked("else_rml") ||
    isChecked("else_rll") ||
    isChecked("else_lul") ||
    isChecked("else_lll");
  if (isSimple) {
    if (isGte6Checked && showElse) {
      report += `  [+] Lung nodules else `;
      report += `${cb_inline("else_rul", "RUL")} `;
      report += `${cb_inline("else_rml", "RML")} `;
      report += `${cb_inline("else_rll", "RLL")} `;
      report += `${cb_inline("else_lul", "LUL")} `;
      report += `${cb_inline("else_lll", "LLL")} `;
      report += `(SE:${txt("else_se")}, IM:${txt("else_im")})\n\n`;
    }
  } else {
    report += `  ${elseLobesChecked && showElse ? "[+]" : "[ ]"} Lung nodules else `;
    report += `${showElse ? cb_inline("else_rul", "RUL") : "[ ] RUL"} `;
    report += `${showElse ? cb_inline("else_rml", "RML") : "[ ] RML"} `;
    report += `${showElse ? cb_inline("else_rll", "RLL") : "[ ] RLL"} `;
    report += `${showElse ? cb_inline("else_lul", "LUL") : "[ ] LLL"} `;
    report += `${showElse ? cb_inline("else_lll", "LLL") : "[ ] LLL"} `;
    report += `(SE:${showElse ? txt("else_se") : "_"}, IM:${showElse ? txt("else_im") : "_"})\n\n`;
  }
  let airwayChecked =
    isChecked("airway_subsegmental") || isChecked("airway_proximal");
  if (!isSimple || airwayChecked) {
    report += `${airwayChecked ? "[+]" : "[ ]"} Airway nodule\n`;
    addLine(
      true,
      () => `  ${cb("airway_subsegmental", "Subsegmental (Category 2)")}`,
    );
    addLine(
      true,
      () => `  ${cb("airway_proximal", "Segmental or more proximal")}`,
    );
    addLine(
      true,
      () =>
        `    ${cb("airway_secretions", "Favors secretions (Category 2)")}`,
    );
    addLine(
      true,
      () => `    ${cb("airway_baseline", "At baseline (Category 4A)")}`,
    );
    addLine(
      true,
      () =>
        `    ${cb("airway_stable", "Stable or growing (Category 4B)")}`,
    );
    report += "\n";
  }
  let cystChecked =
    isChecked("cyst_3") || isChecked("cyst_4a") || isChecked("cyst_4b");
  if (!isSimple || cystChecked) {
    const getCystString = (cat_id, cat_name, se_id, im_id, isSimple) => {
      if (isSimple && !isChecked(cat_id)) return "";
      let line = `  ${cb(cat_id, `Category ${cat_name}. Lobe: (SE: ${txt(se_id)}, IM: ${txt(im_id)}) `)}`;
      line = line.trimEnd();
      line += ` ${cb_inline(cat_id + "_rul", "RUL")}`;
      line += ` ${cb_inline(cat_id + "_rml", "RML")}`;
      line += ` ${cb_inline(cat_id + "_rll", "RLL")}`;
      line += ` ${cb_inline(cat_id + "_lul", "LUL")}`;
      line += ` ${cb_inline(cat_id + "_lll", "LLL")}\n`;
      return line;
    };
    report += `${cystChecked ? "[+]" : "[ ]"} Atypical pulmonary cyst\n`;
    add(getCystString("cyst_3", "3", "cyst_3_se", "cyst_3_im", isSimple));
    add(
      getCystString(
        "cyst_4a",
        "4A",
        "cyst_4a_se",
        "cyst_4a_im",
        isSimple,
      ),
    );
    add(
      getCystString(
        "cyst_4b",
        "4B",
        "cyst_4b_se",
        "cyst_4b_im",
        isSimple,
      ),
    );
    report += "\n";
  }
  addLineCb(
    "metastases",
    "The pattern of lung nodules has a higher probability of metastases",
  );
  let otherLungChecked =
    isChecked("other_emphysema") ||
    isChecked("other_bronchiectasis") ||
    isChecked("other_bronchitis") ||
    isChecked("other_treeinbud") ||
    isChecked("other_centrilobular") ||
    isChecked("other_tb") ||
    isChecked("other_ild") ||
    isChecked("other_other_lung_check");
  if (!isSimple || otherLungChecked) {
    report += "\n----\nOther Lung Findings (選填)\n";
    let line1 = "",
      line2 = "";
    if (!isSimple || isChecked("other_emphysema"))
      line1 += `${cb_inline("other_emphysema", "Emphysema")} `;
    if (!isSimple || isChecked("other_bronchiectasis"))
      line1 += `${cb_inline("other_bronchiectasis", "Bronchiectasis")} `;
    if (!isSimple || isChecked("other_bronchitis"))
      line1 += `${cb_inline("other_bronchitis", "Bronchitis/bronchiolitis")} `;
    if (!isSimple || isChecked("other_treeinbud"))
      line1 += `${cb_inline("other_treeinbud", "Tree-in-bud pattern")}`;
    if (!isSimple || isChecked("other_centrilobular"))
      line2 += `${cb_inline("other_centrilobular", "Centrilobular nodules")} `;
    if (!isSimple || isChecked("other_tb"))
      line2 += `${cb_inline("other_tb", "Old pulmonary TB")} `;
    if (!isSimple || isChecked("other_ild"))
      line2 += `${cb_inline("other_ild", "Interstitial lung disease (ILD)")} `;
    if (!isSimple || isChecked("other_other_lung_check"))
      line2 += `${cb_inline("other_other_lung_check", `Other ${txt("other_other_lung_text")}`)}`;
    if (line1.trim() !== "") report += line1.trimEnd() + "\n";
    if (line2.trim() !== "") report += line2.trimEnd() + "\n";
  }
  let otherFindingsChecked =
    getValue("other_lymph") ||
    isChecked("coronary_lad") ||
    isChecked("coronary_lcx") ||
    isChecked("coronary_rca") ||
    getValue("other_chest") ||
    getValue("other_abnormal");
  if (!isSimple || otherFindingsChecked) {
    report += "\nOther Findings (選填)\n";
    const addOtherFinding = (id, text) => {
      const val = getValue(id);
      if (isSimple && !val) return;
      const mark = val ? "[+]" : "[ ]";
      const content = val ? `: ${val}` : "";
      report += `${mark} ${text}${content}\n`;
    };
    addOtherFinding("other_lymph", "Enlarged lymph nodes, location");
    const coronaryList = [];
    if (isChecked("coronary_lad")) coronaryList.push("LAD");
    if (isChecked("coronary_lcx")) coronaryList.push("LCX");
    if (isChecked("coronary_rca")) coronaryList.push("RCA");
    const coronaryVal = coronaryList.join(", ");
    const hasCoronary = coronaryList.length > 0;
    if (!isSimple || hasCoronary) {
      report += `${hasCoronary ? "[+]" : "[ ]"} Coronary artery calcification${hasCoronary ? ": " + coronaryVal : ""}\n`;
    }
    addOtherFinding(
      "other_chest",
      "Other significant abnormal chest findings",
    );
    addOtherFinding(
      "other_abnormal",
      "Other significant abnormal abdominal or neck findings in this chest CT scan",
    );
  }
  report += "\n----\nOverall recommendation\n";
  report += "Lung-RADS v2022 Category Descriptor\n";
  report += `  ${rb_inline("category", "0", "Category 0: Incomplete.")}\n`;
  report += `    ${cb("cat_0_prior", "Prior chest CT examination being located for comparison.")}`;
  report += `    ${cb("cat_0_unevaluated", "Part or all of lungs cannot be evaluated.")}`;
  report += `    ${cb("cat_0_inflammatory", "Findings suggestive of an inflammatory or infectious process.")}`;
  report += `  ${rb_inline("category", "1", "Category 1: Negative.")}\n`;
  report += `  ${rb_inline("category", "2", "Category 2: Benign - Based on imaging features or indolent behavior.")}\n`;
  report += `  ${rb_inline("category", "3", "Category 3: Probably Benign - Based on imaging features or behavior.")}\n`;
  report += `  ${rb_inline("category", "4A", "Category 4A: Suspicious.")}\n`;
  report += `  ${rb_inline("category", "4B", "Category 4B: Very suspicious.")}\n`;
  report += `  ${rb_inline("category", "4X", "Category 4X: Category 3 or 4 nodules with additional features or imaging findings that increase suspicion for lung cancer.")}\n`;
  if (!isSimple || isChecked("modifier_s") || isChecked("refer_opd")) {
    report += "\n----\n(選填)\n";
    addLineCb(
      "modifier_s",
      "Modifier S: May add to category 0-4 for clinically significant or potentially clinically significant findings unrelated to lung cancer.",
    );
    addLineCb("refer_opd", "請至門診就診");
  }
  return report.replace(/\n\n\n/g, "\n\n");
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
function autoCalculateCategory() {
  const CAT_4B = 6;
  const CAT_4A = 5;
  const CAT_3 = 4;
  const CAT_2 = 3;
  const CAT_1 = 2;
  const CAT_0 = 10;
  let currentScore = 0;
  const setScore = (score) => {
    if (score > currentScore) currentScore = score;
  };

  if (
    isChecked("cat_0_prior") ||
    isChecked("cat_0_unevaluated") ||
    isChecked("cat_0_inflammatory")
  ) {
    setScore(CAT_0);
  }
  if (currentScore === CAT_0) {
    checkCategoryRadio("0");
    return;
  }

  if (isChecked("airway_stable")) setScore(CAT_4B);
  if (isChecked("cyst_4b")) setScore(CAT_4B);

  for (let i = 1; i <= 3; i++) {
    if (!isChecked("nodule_gte6") || !isChecked(`n${i}_enable`)) continue;
    let size = parseFloat(getValue(`n${i}_size`)) || 0;
    let density = getRadio(`n${i}_density`);
    let solidPart = parseFloat(getValue(`n${i}_solid_part`)) || 0;
    let status = getRadio(`n${i}_status`);

    if (density === "solid") {
      if (size >= 15) setScore(CAT_4B);
      if (
        (status === "newly found" || status === "enlarging") &&
        size >= 8
      )
        setScore(CAT_4B);
    } else if (density === "part-solid") {
      if (solidPart >= 8) setScore(CAT_4B);
      if (
        (status === "newly found" || status === "enlarging") &&
        solidPart >= 4
      )
        setScore(CAT_4B);
    }
  }

  if (currentScore < CAT_4B) {
    if (isChecked("airway_baseline")) setScore(CAT_4A);
    if (isChecked("cyst_4a")) setScore(CAT_4A);
    for (let i = 1; i <= 3; i++) {
      if (!isChecked("nodule_gte6") || !isChecked(`n${i}_enable`))
        continue;
      let size = parseFloat(getValue(`n${i}_size`)) || 0;
      let density = getRadio(`n${i}_density`);
      let solidPart = parseFloat(getValue(`n${i}_solid_part`)) || 0;
      let status = getRadio(`n${i}_status`);
      if (density === "solid") {
        if (size >= 8 && size < 15) setScore(CAT_4A);
        if (status === "enlarging" && size < 8) setScore(CAT_4A);
        if (status === "newly found" && size >= 6 && size < 8)
          setScore(CAT_4A);
      } else if (density === "part-solid") {
        if (size >= 6 && solidPart >= 6 && solidPart < 8)
          setScore(CAT_4A);
        if (
          (status === "newly found" || status === "enlarging") &&
          solidPart < 4
        )
          setScore(CAT_4A);
      }
    }
  }

  if (currentScore < CAT_4A) {
    if (isChecked("cyst_3")) setScore(CAT_3);
    for (let i = 1; i <= 3; i++) {
      if (!isChecked("nodule_gte6") || !isChecked(`n${i}_enable`))
        continue;
      let size = parseFloat(getValue(`n${i}_size`)) || 0;
      let density = getRadio(`n${i}_density`);
      let solidPart = parseFloat(getValue(`n${i}_solid_part`)) || 0;
      let status = getRadio(`n${i}_status`);
      if (density === "solid") {
        if (size >= 6 && size < 8) setScore(CAT_3);
        if (status === "newly found" && size >= 4 && size < 6)
          setScore(CAT_3);
      } else if (density === "part-solid") {
        if (size >= 6 && solidPart < 6) setScore(CAT_3);
        if (status === "newly found" && size < 6) setScore(CAT_3);
      } else if (density === "non-solid") {
        if (
          size >= 30 &&
          (status === "no prior" || status === "newly found")
        ) {
          setScore(CAT_3);
        }
      }
    }
  }

  if (currentScore < CAT_3) {
    if (isChecked("nodule_lt6")) setScore(CAT_2);
    if (isChecked("juxtapleural")) setScore(CAT_2);
    if (
      isChecked("airway_subsegmental") ||
      isChecked("airway_secretions")
    )
      setScore(CAT_2);
    for (let i = 1; i <= 3; i++) {
      if (!isChecked("nodule_gte6") || !isChecked(`n${i}_enable`))
        continue;
      let size = parseFloat(getValue(`n${i}_size`)) || 0;
      let density = getRadio(`n${i}_density`);
      let status = getRadio(`n${i}_status`);
      if (density === "solid") {
        if (size < 6) setScore(CAT_2);
        if (status === "newly found" && size < 4) setScore(CAT_2);
      } else if (density === "part-solid") {
        if (size < 6) setScore(CAT_2);
      } else if (density === "non-solid") {
        setScore(CAT_2);
      }
    }
  }

  if (currentScore < CAT_2) {
    if (isChecked("no_nodule") || isChecked("benign_features"))
      setScore(CAT_1);
  }

  if (currentScore === CAT_4B) checkCategoryRadio("4B");
  else if (currentScore === CAT_4A) checkCategoryRadio("4A");
  else if (currentScore === CAT_3) checkCategoryRadio("3");
  else if (currentScore === CAT_2) checkCategoryRadio("2");
  else if (currentScore === CAT_1) checkCategoryRadio("1");
}

function checkCategoryRadio(val) {
  const radio = document.querySelector(
    `input[name="category"][value="${val}"]`,
  );
  if (radio && !radio.checked) radio.checked = true;
}

document
  .querySelector("main")
  .addEventListener("change", autoCalculateCategory);
document
  .querySelector("main")
  .addEventListener("input", autoCalculateCategory);

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
window.promptDelete = promptDelete;
window.confirmDelete = confirmDelete;
window.handlePriorDateInput = handlePriorDateInput;
window.togglePriorDate = togglePriorDate;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleModal = toggleModal;
window.closeModalOnBackdrop = closeModalOnBackdrop;
window.validateAndCopy = validateAndCopy;
