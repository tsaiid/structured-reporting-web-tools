/**
 * NHI Lung-RADS v2022 純邏輯計算與報告文字生成模組
 *
 * 抽離所有 DOM 依賴，提供純函式進行分類判斷與報告輸出。
 */

export const LUNG_RADS_SCORES = {
  CAT_0: 10,
  CAT_4B: 6,
  CAT_4A: 5,
  CAT_3: 4,
  CAT_2: 3,
  CAT_1: 2,
};

/**
 * 根據表單資料或臨床影像特徵計算 Lung-RADS v2022 分類期別
 *
 * @param {Object} data - 輸入特徵資料
 * @returns {string} - 分類結果 ("0" | "1" | "2" | "3" | "4A" | "4B" | "")
 */
export function calculateLungRadsCategory(data = {}) {
  const {
    CAT_4B,
    CAT_4A,
    CAT_3,
    CAT_2,
    CAT_1,
    CAT_0,
  } = LUNG_RADS_SCORES;

  let currentScore = 0;
  const setScore = (score) => {
    if (score > currentScore) currentScore = score;
  };

  // 1. Category 0: 不完整或疑似發炎/感染 (Incomplete)
  const isCat0 = Boolean(
    data.cat0?.prior ||
    data.cat_0_prior ||
    data.cat0?.unevaluated ||
    data.cat_0_unevaluated ||
    data.cat0?.inflammatory ||
    data.cat_0_inflammatory
  );
  if (isCat0) {
    setScore(CAT_0);
    return "0";
  }

  // 結節 >=6mm 區塊是否勾選啟用
  const isNoduleGte6 = Boolean(
    data.noduleGte6 !== undefined
      ? data.noduleGte6
      : (data.nodule_gte6 !== undefined
          ? data.nodule_gte6
          : (Array.isArray(data.nodules) && data.nodules.length > 0))
  );

  // 解析各結節特徵
  let nodules = [];
  if (Array.isArray(data.nodules)) {
    nodules = data.nodules.map((n) => ({
      enabled: n.enabled !== undefined ? Boolean(n.enabled) : true,
      size: typeof n.size === "number" ? n.size : (parseFloat(n.size) || 0),
      density: n.density || "",
      solidPart: typeof n.solidPart === "number" ? n.solidPart : (parseFloat(n.solidPart) || 0),
      status: n.status || "",
    }));
  } else {
    for (let i = 1; i <= 3; i++) {
      nodules.push({
        enabled: Boolean(data[`n${i}_enable`]),
        size: parseFloat(data[`n${i}_size`]) || 0,
        density: data[`n${i}_density`] || "",
        solidPart: parseFloat(data[`n${i}_solid_part`]) || 0,
        status: data[`n${i}_status`] || "",
      });
    }
  }

  // 氣道與囊腫特徵
  const airwayStable = Boolean(data.airway?.stable ?? data.airway_stable);
  const cyst4b = Boolean(data.cysts?.cyst_4b ?? data.cyst_4b);
  const airwayBaseline = Boolean(data.airway?.baseline ?? data.airway_baseline);
  const cyst4a = Boolean(data.cysts?.cyst_4a ?? data.cyst_4a);
  const cyst3 = Boolean(data.cysts?.cyst_3 ?? data.cyst_3);
  const noduleLt6 = Boolean(data.noduleLt6 ?? data.nodule_lt6);
  const juxtapleural = Boolean(data.juxtapleural);
  const airwaySubsegmental = Boolean(data.airway?.subsegmental ?? data.airway_subsegmental);
  const airwaySecretions = Boolean(data.airway?.secretions ?? data.airway_secretions);
  const noNodule = Boolean(data.noNodule ?? data.no_nodule);
  const benignFeatures = Boolean(data.benignFeatures ?? data.benign_features);

  // 2. Category 4B: 極度懷疑 (Very suspicious)
  if (airwayStable) setScore(CAT_4B);
  if (cyst4b) setScore(CAT_4B);

  for (const n of nodules) {
    if (!isNoduleGte6 || !n.enabled) continue;
    const { size, density, solidPart, status } = n;
    if (density === "solid") {
      if (size >= 15) setScore(CAT_4B);
      if ((status === "newly found" || status === "enlarging") && size >= 8) {
        setScore(CAT_4B);
      }
    } else if (density === "part-solid") {
      // 實質成分 >= 8 mm 或新發現/增大結節之實質成分 >= 4 mm (總直徑 >= 6 mm) 為 4B
      if (solidPart >= 8) setScore(CAT_4B);
      if (
        size >= 6 &&
        (status === "newly found" || status === "enlarging") &&
        solidPart >= 4
      ) {
        setScore(CAT_4B);
      }
    }
  }

  // 3. Category 4A: 懷疑惡性 (Suspicious)
  if (currentScore < CAT_4B) {
    if (airwayBaseline) setScore(CAT_4A);
    if (cyst4a) setScore(CAT_4A);
    for (const n of nodules) {
      if (!isNoduleGte6 || !n.enabled) continue;
      const { size, density, solidPart, status } = n;
      if (density === "solid") {
        if (size >= 8 && size < 15) setScore(CAT_4A);
        if (status === "enlarging" && size < 8) setScore(CAT_4A);
        if (status === "newly found" && size >= 6 && size < 8) {
          setScore(CAT_4A);
        }
      } else if (density === "part-solid") {
        // baseline/unchanged 實質成分 6 至 < 8 mm，或新發現/增大結節 (總直徑 >= 6 mm) 之實質成分 < 4 mm 為 4A
        if (size >= 6 && solidPart >= 6 && solidPart < 8) {
          setScore(CAT_4A);
        }
        if (
          size >= 6 &&
          (status === "newly found" || status === "enlarging") &&
          solidPart < 4
        ) {
          setScore(CAT_4A);
        }
      }
    }
  }

  // 4. Category 3: 疑似良性 (Probably Benign)
  if (currentScore < CAT_4A) {
    if (cyst3) setScore(CAT_3);
    for (const n of nodules) {
      if (!isNoduleGte6 || !n.enabled) continue;
      const { size, density, solidPart, status } = n;
      if (density === "solid") {
        if (size >= 6 && size < 8) setScore(CAT_3);
        if (status === "newly found" && size >= 4 && size < 6) {
          setScore(CAT_3);
        }
      } else if (density === "part-solid") {
        // baseline/unchanged 總直徑 >= 6 mm 且實質成分 < 6 mm 判定為 3
        if (size >= 6 && solidPart < 6) setScore(CAT_3);
        // 新發現部分實質結節若總直徑 < 6 mm 判定為 3 (Lung-RADS v2022)
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

  // 5. Category 2: 良性特徵或穩定 (Benign appearance or behavior)
  if (currentScore < CAT_3) {
    if (noduleLt6) setScore(CAT_2);
    if (juxtapleural) setScore(CAT_2);
    if (airwaySubsegmental || airwaySecretions) setScore(CAT_2);
    for (const n of nodules) {
      if (!isNoduleGte6 || !n.enabled) continue;
      const { size, density, status } = n;
      if (density === "solid") {
        if (size < 6) setScore(CAT_2);
        if (status === "newly found" && size < 4) setScore(CAT_2);
      } else if (density === "part-solid") {
        // baseline/unchanged 總直徑 < 6 mm 判定為 2
        if (size < 6) setScore(CAT_2);
      } else if (density === "non-solid") {
        setScore(CAT_2);
      }
    }
  }

  // 6. Category 1: 無結節或明確良性鈣化 (Negative)
  if (currentScore < CAT_2) {
    if (noNodule || benignFeatures) {
      setScore(CAT_1);
    }
  }

  // 輸出對應期別
  if (currentScore === CAT_4B) return "4B";
  if (currentScore === CAT_4A) return "4A";
  if (currentScore === CAT_3) return "3";
  if (currentScore === CAT_2) return "2";
  if (currentScore === CAT_1) return "1";
  return "";
}

/**
 * 產生單一結節的描述文字
 *
 * @param {Object} nodule - 結節資料
 * @param {number} n - 結節編號 (1, 2, 3)
 * @param {boolean} [isSimple=false] - 是否為簡易報告模式
 * @returns {string}
 */
export function generateNoduleText(nodule = {}, n = 1, isSimple = false) {
  const isPopulated = Boolean(nodule && nodule.enabled);
  if (isSimple && !isPopulated) return "";

  const txtVal = (val, prefix = "", suffix = "") => {
    const v = val !== undefined && val !== null ? String(val).trim() : "";
    return `${prefix}${v || "_"}${suffix}`;
  };

  const rbInline = (actual, target, text) =>
    `${actual === target ? "[+]" : "[ ]"} ${text}`;

  let text = `  ${isPopulated ? "[+]" : "[ ]"} Lung nodule ${n} (size, character and location)\n`;
  text += `    Entire Nodule: ${isPopulated ? txtVal(nodule.size, "", " mm") : "_ mm"}\n`;

  const density = isPopulated ? (nodule.density || "") : "";
  text += `    Density: ${density === "non-solid" ? "[+]" : "[ ]"} non-solid  `;
  text += `${density === "part-solid" ? "[+]" : "[ ]"} part-solid (solid part: ${
    density === "part-solid" ? txtVal(nodule.solidPart, "", " mm") : "___ mm"
  }) `;
  text += `${density === "solid" ? "[+]" : "[ ]"} solid\n`;

  const seStr = isPopulated ? txtVal(nodule.se) : "_";
  const imStr = isPopulated ? txtVal(nodule.im) : "_";
  text += `    Lobe: (SE:${seStr}, IM:${imStr}) `;
  text += `${isPopulated ? rbInline(nodule.lobe, "RUL", "RUL") : "[ ] RUL"} `;
  text += `${isPopulated ? rbInline(nodule.lobe, "RML", "RML") : "[ ] RML"} `;
  text += `${isPopulated ? rbInline(nodule.lobe, "RLL", "RLL") : "[ ] RLL"} `;
  text += `${isPopulated ? rbInline(nodule.lobe, "LUL", "LUL") : "[ ] LUL"} `;
  text += `${isPopulated ? rbInline(nodule.lobe, "LLL", "LLL") : "[ ] LLL"}\n`;

  text += `    The nodule is ${
    isPopulated ? rbInline(nodule.status, "unchanged", "unchanged") : "[ ] unchanged"
  } `;
  text += `${
    isPopulated
      ? rbInline(nodule.status, "enlarging", "enlarging (>1.5 mm)")
      : "[ ] enlarging (>1.5 mm)"
  } `;
  text += `${
    isPopulated
      ? rbInline(nodule.status, "newly found", "newly found (≧4 mm)")
      : "[ ] newly found (≧4 mm)"
  } `;
  text += `${
    isPopulated
      ? rbInline(nodule.status, "no prior", "No prior chest CT comparison")
      : "[ ] No prior chest CT comparison"
  }`;

  return text;
}

/**
 * 產生完整的 Lung-RADS 結構化報告文字
 *
 * @param {Object} data - 表單資料物件
 * @param {boolean} [isSimple=false] - 是否僅輸出陽性與重點項目 (簡易模式)
 * @returns {string}
 */
export function generateReportText(data = {}, isSimple = false) {
  let report = "";
  const add = (text) => {
    report += text;
  };
  const addLine = (condition, textGen) => {
    if (!isSimple || condition) add(textGen());
  };

  const txtVal = (val, prefix = "", suffix = "") => {
    const v = val !== undefined && val !== null ? String(val).trim() : "";
    return `${prefix}${v || "_"}${suffix}`;
  };

  const cbLine = (checked, text) =>
    `${checked ? "[+]" : "[ ]"} ${text}\n`;
  const cbInline = (checked, text) =>
    `${checked ? "[+]" : "[ ]"} ${text}`;
  const rbInline = (actual, target, text) =>
    `${actual === target ? "[+]" : "[ ]"} ${text}`;

  const quality = data.quality || "Good";
  report += `LDCT Quality: ${rbInline(quality, "Good", "Good")} ${rbInline(
    quality,
    "Acceptable",
    "Acceptable",
  )} ${rbInline(quality, "Not Acceptable", "Not Acceptable")}\n`;

  report += `CTDIvol: ${txtVal(data.ctdi)} mGy Total DLP: ${txtVal(
    data.dlp,
  )} mGy*cm\n`;

  report += `In comparison with the prior CT, Date (Y/M/D) ${txtVal(
    data.priorDate,
  )} ${cbLine(Boolean(data.noPrior), "No prior chest CT available")}`;

  report += "\nLung nodule findings related to cancer screening\n";
  report += "詳細規範請參閱 Lung-RADS v2022\n\n";

  addLine(Boolean(data.noNodule), () =>
    cbLine(Boolean(data.noNodule), "No lung nodule"),
  );
  addLine(Boolean(data.benignFeatures), () =>
    cbLine(Boolean(data.benignFeatures), "Nodule with benign features."),
  );

  const noduleLt6 = Boolean(data.noduleLt6);
  addLine(noduleLt6, () => {
    if (isSimple && !noduleLt6) return "";
    if (noduleLt6) {
      const se = data.lt6Se ? ` SE: ${data.lt6Se}` : " SE: _";
      const im = data.lt6Im ? `, IM: ${data.lt6Im}` : ", IM: _";
      return `[+] Lung nodule(s) (<6mm) (${se}${im})\n`;
    }
    return "[ ] Lung nodule(s) (<6mm) (選填 SE: , IM:  )\n";
  });

  addLine(Boolean(data.juxtapleural), () =>
    cbLine(Boolean(data.juxtapleural), "Juxtapleural nodule."),
  );

  const isGte6Checked = Boolean(
    data.noduleGte6 !== undefined
      ? data.noduleGte6
      : (data.nodule_gte6 !== undefined
          ? data.nodule_gte6
          : (data.nodules && data.nodules.some((n) => n.enabled))),
  );

  const totalNodules = data.totalNodules || "1";
  const nodules = Array.isArray(data.nodules)
    ? data.nodules
    : [1, 2, 3].map((i) => ({
        enabled: Boolean(data[`n${i}_enable`]),
        size: data[`n${i}_size`],
        density: data[`n${i}_density`],
        solidPart: data[`n${i}_solid_part`],
        se: data[`n${i}_se`],
        im: data[`n${i}_im`],
        lobe: data[`n${i}_lobe`],
        status: data[`n${i}_status`],
      }));

  const nodule1 = nodules[0] || {};
  const nodule2 = nodules[1] || {};
  const nodule3 = nodules[2] || {};

  if (isSimple) {
    if (isGte6Checked) {
      report +=
        "[+] Lung nodule(s) (≧6mm or enlarging>1.5mm or new≧4mm): total number ";
      report += `${rbInline(totalNodules, "1", "1")} ${rbInline(
        totalNodules,
        "2",
        "2",
      )} ${rbInline(totalNodules, "3", "3")} ${rbInline(
        totalNodules,
        ">=4",
        "≥4",
      )}`;
      report += ", and described as followings:\n";
      report +=
        generateNoduleText(nodule1, 1, true) +
        (nodule1.enabled ? "\n\n" : "");
      report +=
        generateNoduleText(nodule2, 2, true) +
        (nodule2.enabled ? "\n\n" : "");
      report +=
        generateNoduleText(nodule3, 3, true) +
        (nodule3.enabled ? "\n\n" : "");
    }
  } else {
    report += `${
      isGte6Checked ? "[+]" : "[ ]"
    } Lung nodule(s) (≧6mm or enlarging>1.5mm or new≧4mm): total number `;
    report += `${rbInline(totalNodules, "1", "1")} ${rbInline(
      totalNodules,
      "2",
      "2",
    )} ${rbInline(totalNodules, "3", "3")} ${rbInline(
      totalNodules,
      ">=4",
      "≥4",
    )}`;
    report += ", and described as followings:\n";
    report += generateNoduleText(nodule1, 1, false) + "\n\n";
    report += generateNoduleText(nodule2, 2, false) + "\n\n";
    report += generateNoduleText(nodule3, 3, false) + "\n\n";
  }

  const elseNodules = data.elseNodules || {};
  const showElse = totalNodules === ">=4";
  const elseLobesChecked = Boolean(
    elseNodules.rul ||
      elseNodules.rml ||
      elseNodules.rll ||
      elseNodules.lul ||
      elseNodules.lll ||
      data.else_rul ||
      data.else_rml ||
      data.else_rll ||
      data.else_lul ||
      data.else_lll,
  );
  const elseRul = Boolean(elseNodules.rul || data.else_rul);
  const elseRml = Boolean(elseNodules.rml || data.else_rml);
  const elseRll = Boolean(elseNodules.rll || data.else_rll);
  const elseLul = Boolean(elseNodules.lul || data.else_lul);
  const elseLll = Boolean(elseNodules.lll || data.else_lll);
  const elseSe = elseNodules.se !== undefined ? elseNodules.se : data.else_se;
  const elseIm = elseNodules.im !== undefined ? elseNodules.im : data.else_im;

  if (isSimple) {
    if (isGte6Checked && showElse) {
      report += `  [+] Lung nodules else `;
      report += `${cbInline(elseRul, "RUL")} `;
      report += `${cbInline(elseRml, "RML")} `;
      report += `${cbInline(elseRll, "RLL")} `;
      report += `${cbInline(elseLul, "LUL")} `;
      report += `${cbInline(elseLll, "LLL")} `;
      report += `(SE:${txtVal(elseSe)}, IM:${txtVal(elseIm)})\n\n`;
    }
  } else {
    report += `  ${
      elseLobesChecked && showElse ? "[+]" : "[ ]"
    } Lung nodules else `;
    report += `${showElse ? cbInline(elseRul, "RUL") : "[ ] RUL"} `;
    report += `${showElse ? cbInline(elseRml, "RML") : "[ ] RML"} `;
    report += `${showElse ? cbInline(elseRll, "RLL") : "[ ] RLL"} `;
    report += `${showElse ? cbInline(elseLul, "LUL") : "[ ] LLL"} `;
    report += `${showElse ? cbInline(elseLll, "LLL") : "[ ] LLL"} `;
    report += `(SE:${showElse ? txtVal(elseSe) : "_"}, IM:${
      showElse ? txtVal(elseIm) : "_"
    })\n\n`;
  }

  const airway = data.airway || {};
  const airwaySubsegmental = Boolean(
    airway.subsegmental || data.airway_subsegmental,
  );
  const airwayProximal = Boolean(airway.proximal || data.airway_proximal);
  const airwaySecretions = Boolean(
    airway.secretions || data.airway_secretions,
  );
  const airwayBaseline = Boolean(airway.baseline || data.airway_baseline);
  const airwayStable = Boolean(airway.stable || data.airway_stable);

  const airwayChecked = airwaySubsegmental || airwayProximal;
  if (!isSimple || airwayChecked) {
    report += `${airwayChecked ? "[+]" : "[ ]"} Airway nodule\n`;
    addLine(true, () => `  ${cbLine(airwaySubsegmental, "Subsegmental (Category 2)")}`);
    addLine(true, () => `  ${cbLine(airwayProximal, "Segmental or more proximal")}`);
    addLine(
      true,
      () => `    ${cbLine(airwaySecretions, "Favors secretions (Category 2)")}`,
    );
    addLine(true, () => `    ${cbLine(airwayBaseline, "At baseline (Category 4A)")}`);
    addLine(
      true,
      () => `    ${cbLine(airwayStable, "Stable or growing (Category 4B)")}`,
    );
    report += "\n";
  }

  const cysts = data.cysts || {};
  const cyst3 = Boolean(cysts.cyst_3 || data.cyst_3);
  const cyst4a = Boolean(cysts.cyst_4a || data.cyst_4a);
  const cyst4b = Boolean(cysts.cyst_4b || data.cyst_4b);
  const cystChecked = cyst3 || cyst4a || cyst4b;

  if (!isSimple || cystChecked) {
    const getCystString = (isCheckedCat, catName, seVal, imVal, lobes) => {
      if (isSimple && !isCheckedCat) return "";
      let line = `  ${cbLine(
        isCheckedCat,
        `Category ${catName}. Lobe: (SE: ${txtVal(seVal)}, IM: ${txtVal(
          imVal,
        )}) `,
      )}`;
      line = line.trimEnd();
      line += ` ${cbInline(Boolean(lobes.rul), "RUL")}`;
      line += ` ${cbInline(Boolean(lobes.rml), "RML")}`;
      line += ` ${cbInline(Boolean(lobes.rll), "RLL")}`;
      line += ` ${cbInline(Boolean(lobes.lul), "LUL")}`;
      line += ` ${cbInline(Boolean(lobes.lll), "LLL")}\n`;
      return line;
    };

    report += `${cystChecked ? "[+]" : "[ ]"} Atypical pulmonary cyst\n`;
    add(
      getCystString(
        cyst3,
        "3",
        cysts.cyst_3_se ?? data.cyst_3_se,
        cysts.cyst_3_im ?? data.cyst_3_im,
        {
          rul: cysts.cyst_3_rul ?? data.cyst_3_rul,
          rml: cysts.cyst_3_rml ?? data.cyst_3_rml,
          rll: cysts.cyst_3_rll ?? data.cyst_3_rll,
          lul: cysts.cyst_3_lul ?? data.cyst_3_lul,
          lll: cysts.cyst_3_lll ?? data.cyst_3_lll,
        },
      ),
    );
    add(
      getCystString(
        cyst4a,
        "4A",
        cysts.cyst_4a_se ?? data.cyst_4a_se,
        cysts.cyst_4a_im ?? data.cyst_4a_im,
        {
          rul: cysts.cyst_4a_rul ?? data.cyst_4a_rul,
          rml: cysts.cyst_4a_rml ?? data.cyst_4a_rml,
          rll: cysts.cyst_4a_rll ?? data.cyst_4a_rll,
          lul: cysts.cyst_4a_lul ?? data.cyst_4a_lul,
          lll: cysts.cyst_4a_lll ?? data.cyst_4a_lll,
        },
      ),
    );
    add(
      getCystString(
        cyst4b,
        "4B",
        cysts.cyst_4b_se ?? data.cyst_4b_se,
        cysts.cyst_4b_im ?? data.cyst_4b_im,
        {
          rul: cysts.cyst_4b_rul ?? data.cyst_4b_rul,
          rml: cysts.cyst_4b_rml ?? data.cyst_4b_rml,
          rll: cysts.cyst_4b_rll ?? data.cyst_4b_rll,
          lul: cysts.cyst_4b_lul ?? data.cyst_4b_lul,
          lll: cysts.cyst_4b_lll ?? data.cyst_4b_lll,
        },
      ),
    );
    report += "\n";
  }

  const metastases = Boolean(data.metastases);
  addLine(metastases, () =>
    cbLine(
      metastases,
      "The pattern of lung nodules has a higher probability of metastases",
    ),
  );

  const otherLung = data.otherLung || {};
  const otherEmphysema = Boolean(otherLung.emphysema ?? data.other_emphysema);
  const otherBronchiectasis = Boolean(
    otherLung.bronchiectasis ?? data.other_bronchiectasis,
  );
  const otherBronchitis = Boolean(
    otherLung.bronchitis ?? data.other_bronchitis,
  );
  const otherTreeinbud = Boolean(
    otherLung.treeinbud ?? data.other_treeinbud,
  );
  const otherCentrilobular = Boolean(
    otherLung.centrilobular ?? data.other_centrilobular,
  );
  const otherTb = Boolean(otherLung.tb ?? data.other_tb);
  const otherIld = Boolean(otherLung.ild ?? data.other_ild);
  const otherCheck = Boolean(
    otherLung.otherCheck ?? data.other_other_lung_check,
  );
  const otherText = otherLung.otherText ?? data.other_other_lung_text;

  const otherLungChecked =
    otherEmphysema ||
    otherBronchiectasis ||
    otherBronchitis ||
    otherTreeinbud ||
    otherCentrilobular ||
    otherTb ||
    otherIld ||
    otherCheck;

  if (!isSimple || otherLungChecked) {
    report += "\n----\nOther Lung Findings (選填)\n";
    let line1 = "",
      line2 = "";
    if (!isSimple || otherEmphysema)
      line1 += `${cbInline(otherEmphysema, "Emphysema")} `;
    if (!isSimple || otherBronchiectasis)
      line1 += `${cbInline(otherBronchiectasis, "Bronchiectasis")} `;
    if (!isSimple || otherBronchitis)
      line1 += `${cbInline(otherBronchitis, "Bronchitis/bronchiolitis")} `;
    if (!isSimple || otherTreeinbud)
      line1 += `${cbInline(otherTreeinbud, "Tree-in-bud pattern")}`;

    if (!isSimple || otherCentrilobular)
      line2 += `${cbInline(otherCentrilobular, "Centrilobular nodules")} `;
    if (!isSimple || otherTb)
      line2 += `${cbInline(otherTb, "Old pulmonary TB")} `;
    if (!isSimple || otherIld)
      line2 += `${cbInline(otherIld, "Interstitial lung disease (ILD)")} `;
    if (!isSimple || otherCheck)
      line2 += `${cbInline(otherCheck, `Other ${txtVal(otherText)}`)}`;

    if (line1.trim() !== "") report += line1.trimEnd() + "\n";
    if (line2.trim() !== "") report += line2.trimEnd() + "\n";
  }

  const otherFindings = data.otherFindings || {};
  const lymph = otherFindings.lymph ?? data.other_lymph;
  const coronaryLad = Boolean(
    otherFindings.coronaryLad ?? data.coronary_lad,
  );
  const coronaryLcx = Boolean(
    otherFindings.coronaryLcx ?? data.coronary_lcx,
  );
  const coronaryRca = Boolean(
    otherFindings.coronaryRca ?? data.coronary_rca,
  );
  const chest = otherFindings.chest ?? data.other_chest;
  const abnormal = otherFindings.abnormal ?? data.other_abnormal;

  const coronaryList = [];
  if (coronaryLad) coronaryList.push("LAD");
  if (coronaryLcx) coronaryList.push("LCX");
  if (coronaryRca) coronaryList.push("RCA");
  const coronaryVal = coronaryList.join(", ");
  const hasCoronary = coronaryList.length > 0;

  const otherFindingsChecked = Boolean(
    lymph || hasCoronary || chest || abnormal,
  );

  if (!isSimple || otherFindingsChecked) {
    report += "\nOther Findings (選填)\n";
    const addOtherFinding = (val, text) => {
      const v = val !== undefined && val !== null ? String(val).trim() : "";
      if (isSimple && !v) return;
      const mark = v ? "[+]" : "[ ]";
      const content = v ? `: ${v}` : "";
      report += `${mark} ${text}${content}\n`;
    };

    addOtherFinding(lymph, "Enlarged lymph nodes, location");

    if (!isSimple || hasCoronary) {
      report += `${hasCoronary ? "[+]" : "[ ]"} Coronary artery calcification${
        hasCoronary ? ": " + coronaryVal : ""
      }\n`;
    }

    addOtherFinding(chest, "Other significant abnormal chest findings");
    addOtherFinding(
      abnormal,
      "Other significant abnormal abdominal or neck findings in this chest CT scan",
    );
  }

  report += "\n----\nOverall recommendation\n";
  report += "Lung-RADS v2022 Category Descriptor\n";

  const category = data.category || "";
  const cat0 = data.cat0 || {};
  const cat0Prior = Boolean(cat0.prior ?? data.cat_0_prior);
  const cat0Unevaluated = Boolean(
    cat0.unevaluated ?? data.cat_0_unevaluated,
  );
  const cat0Inflammatory = Boolean(
    cat0.inflammatory ?? data.cat_0_inflammatory,
  );

  report += `  ${rbInline(category, "0", "Category 0: Incomplete.")}\n`;
  report += `    ${cbLine(cat0Prior, "Prior chest CT examination being located for comparison.")}`;
  report += `    ${cbLine(cat0Unevaluated, "Part or all of lungs cannot be evaluated.")}`;
  report += `    ${cbLine(cat0Inflammatory, "Findings suggestive of an inflammatory or infectious process.")}`;
  report += `  ${rbInline(category, "1", "Category 1: Negative.")}\n`;
  report += `  ${rbInline(
    category,
    "2",
    "Category 2: Benign - Based on imaging features or indolent behavior.",
  )}\n`;
  report += `  ${rbInline(
    category,
    "3",
    "Category 3: Probably Benign - Based on imaging features or behavior.",
  )}\n`;
  report += `  ${rbInline(category, "4A", "Category 4A: Suspicious.")}\n`;
  report += `  ${rbInline(category, "4B", "Category 4B: Very suspicious.")}\n`;
  report += `  ${rbInline(
    category,
    "4X",
    "Category 4X: Category 3 or 4 nodules with additional features or imaging findings that increase suspicion for lung cancer.",
  )}\n`;

  const modifierS = Boolean(data.modifierS ?? data.modifier_s);
  const referOpd = Boolean(data.referOpd ?? data.refer_opd);

  if (!isSimple || modifierS || referOpd) {
    report += "\n----\n(選填)\n";
    addLine(modifierS, () =>
      cbLine(
        modifierS,
        "Modifier S: May add to category 0-4 for clinically significant or potentially clinically significant findings unrelated to lung cancer.",
      ),
    );
    addLine(referOpd, () => cbLine(referOpd, "請至門診就診"));
  }

  return report.replace(/\n\n\n/g, "\n\n");
}
