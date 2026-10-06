export function ajcc_template(ca_str, t, t_str, n, n_str, m, m_str, ver = 8) {
    const t_val = Array.isArray(t) ? getMaxStage(t) : (t !== undefined && t !== null) ? String(t) : "";
    const n_val = Array.isArray(n) ? getMaxStage(n) : (n !== undefined && n !== null) ? String(n) : "";
    const m_val = Array.isArray(m) ? getMaxStage(m) : (m !== undefined && m !== null) ? String(m) : "";
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

(T)  PRIMARY TUMOR:
 T${t_val} : ${t_str || ""}

(N)  REGIONAL LYMPH NODES:
 N${n_val} : ${n_str || ""}

(M)  DISTANT METASTASIS:
 M${m_val} : ${m_str || ""}
===================================================


=====================
AJCC ${ver}th edition Staging status:
T${t_val}N${n_val}M${m_val}
=====================`;
    return report;
}

/**
 * 取得指定期別的直接父層期別代碼（例如 '1c1' -> '1c', '1b' -> '1', '4a' -> '4'）
 * 避免因 parseInt 造成如肺癌 M1c1 被錯配為 M1 而非 M1c
 * 
 * @param {string} val - 分期代碼
 * @param {Object|Map} [table] - 分期定義對照表
 * @returns {string|null} 直接父層代碼，若無父層則返回 null
 */
export function getParentStage(val, table) {
    if (!val || typeof val !== 'string') {
        return null;
    }
    const s = val.trim();
    const tableObj = (table instanceof Map) ? Object.fromEntries(table) : (table || {});

    // 1. 三層子期，形如 1c1, 1c2, 1b1, 2a1
    const matchSubSub = s.match(/^(\d+[a-z]+)\d+$/i);
    if (matchSubSub) {
        const directParent = matchSubSub[1];
        // 若 table 存在且包含直接父層 (例如 1c, 1b, 2a)，優先返回
        if (Object.prototype.hasOwnProperty.call(tableObj, directParent)) {
            return directParent;
        }
        // 若 table 沒有 directParent 但有整數層級 (例如 1)，退回整數層級
        const numParent = parseInt(s, 10).toString();
        if (Object.prototype.hasOwnProperty.call(tableObj, numParent)) {
            return numParent;
        }
        return directParent;
    }

    // 2. 兩層子期，形如 1a, 2b, 4a, 1mi, 2mi
    const matchSub = s.match(/^(\d+)[a-z]+/i);
    if (matchSub) {
        return matchSub[1];
    }

    return null;
}

/**
 * 計算分期代碼的臨床嚴重度權重階層
 * 臨床層級：4b > 4a > 4 > 3c > 3b > 3a > 3 > 2c > 2b > 2a > 2 > 1c > 1b > 1a > 1mi > 1 > Tis (is) > Ta (a) > 0(i+) > 0 > x
 * 
 * @param {string|number} stage - 分期代碼
 * @returns {number[]} 階層權重陣列
 */
export function getStageRank(stage) {
    if (stage === undefined || stage === null) {
        return [-1];
    }
    const s = String(stage).trim().toLowerCase();
    if (s === "") {
        return [-1];
    }
    // Tx, Nx, Mx: 臨床上無法評估，優先級高於未填，但低於任何確定期別
    if (s === "x") {
        return [0];
    }
    // T0, N0, M0: 無腫瘤/無轉移
    if (s === "0") {
        return [10, 0, 0];
    }
    // 0(i+): 孤立性腫瘤細胞 (Isolated tumor cells)
    if (s.startsWith("0(") || s === "0(i+)") {
        return [10, 1, 0];
    }
    // Ta: 非侵襲性乳突狀癌 (Noninvasive papillary carcinoma)
    if (s === "a") {
        return [20, 0, 0];
    }
    // Tis (is): 原位癌 (Carcinoma in situ)
    if (s === "is") {
        return [30, 0, 0];
    }

    // 數字開頭：1, 1a, 1b1, 2, 2a, 3, 4, 4b 等
    const match = s.match(/^(\d+)(.*)$/);
    if (match) {
        const majorNum = parseInt(match[1], 10);
        const suffix = match[2];
        const baseWeight = 100 + majorNum * 100;

        if (!suffix) {
            // 純數字，例如 '1', '2', '3', '4'
            return [baseWeight, 0, 0];
        }
        if (suffix === "mi") {
            // 1mi, 2mi: 微小侵犯
            return [baseWeight, 5, 0];
        }

        // 後綴字母與可選第二數字，例如 'a', 'a1', 'b', 'b2', 'c1'
        const letterMatch = suffix.match(/^([a-z]+)(\d+)?$/);
        if (letterMatch) {
            const letters = letterMatch[1];
            let letterWeight = 0;
            for (let i = 0; i < letters.length; i++) {
                letterWeight = letterWeight * 26 + (letters.charCodeAt(i) - 96) * 10;
            }
            const subNum = letterMatch[2] ? parseInt(letterMatch[2], 10) : 0;
            return [baseWeight, letterWeight, subNum];
        }

        return [baseWeight, 999, 0];
    }

    // 其他未知非空字串
    return [5];
}

/**
 * 比較兩個分期代碼的臨床嚴重度
 * 
 * @param {string|number} a 
 * @param {string|number} b 
 * @returns {number} 1 (a > b), -1 (a < b), 0 (a === b)
 */
export function compareStage(a, b) {
    const rankA = getStageRank(a);
    const rankB = getStageRank(b);
    const maxLen = Math.max(rankA.length, rankB.length);
    for (let i = 0; i < maxLen; i++) {
        const valA = rankA[i] !== undefined ? rankA[i] : 0;
        const valB = rankB[i] !== undefined ? rankB[i] : 0;
        if (valA !== valB) {
            return valA > valB ? 1 : -1;
        }
    }
    return 0;
}

/**
 * 從分期陣列中取得臨床最高期別 (4b > 4a > 4 > 3 > 2 > 1 > 0 > x)
 * 解決 JavaScript 原生 Array.prototype.sort() 字典序導致 'x' > '4' 覆寫 T4 侵犯的問題
 * 
 * @param {Array<string|number>} stage_arr - 分期代碼陣列
 * @returns {string} 最高分期代碼，若無有效分期則返回空字串 ""
 */
export function getMaxStage(stage_arr) {
    if (!Array.isArray(stage_arr) || stage_arr.length === 0) {
        return "";
    }
    const validStages = stage_arr.filter(s => s !== null && s !== undefined && String(s).trim() !== "");
    if (validStages.length === 0) {
        return "";
    }
    return validStages.reduce((max, current) => {
        return compareStage(current, max) > 0 ? String(current).trim() : max;
    }, String(validStages[0]).trim());
}

export function ajcc_template_with_parent(ca_str, t, t_table, n, n_table, m, m_table, ver = 8) {
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

`;
    if (t_table instanceof Map) {
        t_table = Object.fromEntries(t_table);
    } else if (!t_table) {
        t_table = {};
    }
    const t_val = Array.isArray(t) ? getMaxStage(t) : (t !== undefined && t !== null) ? String(t) : "";
    report += "(T)  PRIMARY TUMOR:\n";
    const t_p = getParentStage(t_val, t_table);
    if (t_p) {
        let t_p_str = t_table[t_p] || "";
        report += ` T${t_p} : ${t_p_str}\n  `;
    }
    let t_str = (t_val && t_table[t_val]) ? t_table[t_val] : "";
    report += ` T${t_val} : ${t_str}\n\n`;

    if (n_table instanceof Map) {
        n_table = Object.fromEntries(n_table);
    } else if (!n_table) {
        n_table = {};
    }
    const n_val = Array.isArray(n) ? getMaxStage(n) : (n !== undefined && n !== null) ? String(n) : "";
    report += "(N)  REGIONAL LYMPH NODES:\n";
    const n_p = getParentStage(n_val, n_table);
    if (n_p) {
        let n_p_str = n_table[n_p] || "";
        report += ` N${n_p} : ${n_p_str}\n  `;
    }
    let n_str = (n_val && n_table[n_val]) ? n_table[n_val] : "";
    report += ` N${n_val} : ${n_str}\n\n`;

    if (m_table instanceof Map) {
        m_table = Object.fromEntries(m_table);
    } else if (!m_table) {
        m_table = {};
    }
    const m_val = Array.isArray(m) ? getMaxStage(m) : (m !== undefined && m !== null) ? String(m) : "";
    report += "(M)  DISTANT METASTASIS:\n";
    const m_p = getParentStage(m_val, m_table);
    if (m_p) {
        let m_p_str = m_table[m_p] || "";
        report += ` M${m_p} : ${m_p_str}\n  `;
    }
    let m_str = (m_val && m_table[m_val]) ? m_table[m_val] : "";
    report += ` M${m_val} : ${m_str}`;

    report += `
===================================================


=====================
AJCC ${ver}th edition Staging status:
T${t_val}N${n_val}M${m_val}
=====================`;
    return report;
}

export function join_checkbox_values(jq_cbs, sep = ', ') {
    return jq_cbs
        .map(function () {
            if (this.value !== "") {
                return this.value;
            }
        })
        .get()
        .join(sep);
}

export function generate_ajcc_table(t, n, m) {
    let t_table = "";
    let n_table = "";
    let m_table = "";
    const rowClass = "border-b border-gray-200 dark:border-gray-700";
    const headClass = "px-4 py-2 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap align-top";
    const cellClass = "px-4 py-2 text-gray-700 dark:text-gray-300 align-top";

    t.forEach(function (v, k, m) {
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        t_table += `
    <tr class="${rowClass}">
      <th scope="row" class="${headClass}">${k_span}</th>
      <td class="${cellClass}">${v}</td>
    </tr>`;
    });
    n.forEach(function (v, k, m) {
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        n_table += `
    <tr class="${rowClass}">
      <th scope="row" class="${headClass}">${k_span}</th>
      <td class="${cellClass}">${v}</td>
    </tr>`;
    });
    m.forEach(function (v, k, m) {
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        m_table += `
    <tr class="${rowClass}">
      <th scope="row" class="${headClass}">${k_span}</th>
      <td class="${cellClass}">${v}</td>
    </tr>`;
    });

    const tableWrapperClass = "w-full mb-6 overflow-x-auto";
    const tableClass = "w-full text-sm text-left border-collapse notranslate";
    const theadClass = "bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300";
    const thClass = "px-4 py-3 border-b border-gray-200 dark:border-gray-700";

    let ajcc_table = `
<div class="${tableWrapperClass}">
<table class="${tableClass}" id="ajcc_t" translate="no">
  <thead class="${theadClass}">
    <tr>
      <th scope="col" class="${thClass} w-32">T Category</th>
      <th scope="col" class="${thClass}">T Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${t_table}
  </tbody>
</table>
</div>

<div class="${tableWrapperClass}">
<table class="${tableClass}" id="ajcc_n" translate="no">
  <thead class="${theadClass}">
    <tr>
      <th scope="col" class="${thClass} w-32">N Category</th>
      <th scope="col" class="${thClass}">N Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${n_table}
  </tbody>
</table>
</div>

<div class="${tableWrapperClass}">
<table class="${tableClass}" id="ajcc_m" translate="no">
  <thead class="${theadClass}">
    <tr>
      <th scope="col" class="${thClass} w-32">M Category</th>
      <th scope="col" class="${thClass}">M Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${m_table}
  </tbody>
</table>
</div>
`;
    return ajcc_table;
}

/**
 * Sets up the standard report page interactions:
 * - Copy button logic (ClipboardJS)
 * - AJCC Modal button logic
 * - Populates AJCC Modal content on load
 *
 * @param {Object} options
 * @param {Function} options.generateReportFn - Function to call when copy is clicked (to generate text).
 * @param {Object} options.ajccData - { T: Map, N: Map, M: Map } Definitions for the table.
 * @param {string} options.ajccTitleHtml - HTML content for #ajccModalLongTitle.
 * @param {string} [options.copyButtonId='#btn_copy']
 * @param {string} [options.ajccButtonId='#btn_ajcc']
 * @param {string} [options.ajccModalId='#ajccModalLong']
 * @param {string} [options.ajccModalTitleId='#ajccModalLongTitle']
 * @param {string} [options.ajccModalBodyId='#ajccModalBody']
 * @param {string} [options.reportModalTitleId='#reportModalLongTitle']
 * @param {string} [options.reportModalBodySelector='#reportModalBody pre code']
 */
export function setupReportPage({
    generateReportFn,
    ajccData,
    ajccTitleHtml,
    copyButtonId = '#btn_copy',
    ajccButtonId = '#btn_ajcc',
    ajccModalId = '#ajccModalLong',
    ajccModalTitleId = '#ajccModalLongTitle',
    ajccModalBodyId = '#ajccModalBody',
    reportModalTitleId = '#reportModalLongTitle',
    reportModalBodySelector = '#reportModalBody pre code'
}) {
    // 1. Copy Button Click - Trigger Generation and Copy
    $(copyButtonId).on('click', function (event) {
        event.preventDefault();

        // Generate report
        if (typeof generateReportFn === 'function') {
            generateReportFn();
        }

        // Get text to copy
        const report_title = $(reportModalTitleId).text();
        const report_body = $(reportModalBodySelector).text();
        const text_to_copy = report_title + "\n\n" + report_body;

        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text_to_copy).then(() => {
                // Optional: Feedback could be added here
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        } else {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text_to_copy;
            textArea.style.position = "fixed";  // Avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    });

    // 2. AJCC Button Click
    $(ajccButtonId).on('click', function (event) {
        event.preventDefault();
        const modal = document.querySelector(ajccModalId);
        if (modal) {
            modal.showModal();
        }
    });

    // 3. Document Ready - Populate AJCC Table
    $(document).ready(function () {
        // console.log("setupReportPage: Document loaded");
        if (ajccData && ajccData.T && ajccData.N && ajccData.M) {
            const ajcc_table = generate_ajcc_table(ajccData.T, ajccData.N, ajccData.M);
            $(ajccModalTitleId).html(ajccTitleHtml);
            $(ajccModalBodyId).html(ajcc_table);
        }
        initSidebar();
    });
}

export function initSidebar() {
    const $list = $('#ajcc-sidebar-list');
    const $toggleBtn = $('#ajcc-toggle');
    const $body = $('body');
    const $sidebarCollapseToggle = $('#sidebar-collapse-toggle');
    const $sidebarNav = $('#main-sidebar');

    // --- Identify Active Page ---
    const currentPath = window.location.pathname;
    let $activeLink = $();
    $list.find('a').each(function() {
        const href = $(this).attr('href');
        if (href && currentPath.endsWith(href)) {
            $activeLink = $(this);
            return false; // break
        }
    });

    /**
     * Toggles the visual highlight (background and icon color) of the active item.
     * @param {boolean} show - Whether to show the highlight logic.
     */
    function toggleHighlight(show) {
        if (!$activeLink.length) return;

        const $icon = $activeLink.find('i');
        if (show) {
            $activeLink.addClass('bg-gray-200 dark:bg-gray-800');
            $icon.removeClass('text-gray-400 dark:text-gray-500')
                 .addClass('text-gray-600 dark:text-gray-300');
        } else {
            $activeLink.removeClass('bg-gray-200 dark:bg-gray-800');
            // Revert icon to default (non-hover) state
            $icon.addClass('text-gray-400 dark:text-gray-500')
                 .removeClass('text-gray-600 dark:text-gray-300');
        }
    }

    // --- 1. AJCC Optional Items Toggle ---
    let isAjccExpanded = localStorage.getItem('ajcc_sidebar_state') !== 'collapsed';

    function updateAjccState(expanded) {
        if (expanded) {
            $toggleBtn.html('<i class="fas fa-folder-open"></i>');
            $list.find('.ajcc-optional').css({
                'max-height': '50px',
                'opacity': '1',
                'margin-bottom': '',
                'padding-top': '',
                'padding-bottom': ''
            });
        } else {
            $toggleBtn.html('<i class="fas fa-folder"></i>');
            $list.find('.ajcc-optional').css({
                'max-height': '0',
                'opacity': '0',
                'margin-bottom': '0',
                'padding-top': '0',
                'padding-bottom': '0'
            });
        }
        isAjccExpanded = expanded;
    }

    updateAjccState(isAjccExpanded);

    $toggleBtn.on('click', function(e) {
        e.preventDefault();
        const newState = !isAjccExpanded;
        updateAjccState(newState);
        localStorage.setItem('ajcc_sidebar_state', newState ? 'expanded' : 'collapsed');
    });

    // --- 2. Full Sidebar Collapse Logic ---
    let isSidebarCollapsed = localStorage.getItem('sidebar_collapsed_locked') === 'true';
    let ignoreHover = false;

    function updateSidebarCollapseState(collapsed) {
        const $tooltip = $('#sidebar-tooltip');
        if (collapsed) {
            $body.addClass('sidebar-collapsed');
            $tooltip.text('展開選單');

            // Hide highlight when collapsed
            toggleHighlight(false);
        } else {
            $body.removeClass('sidebar-collapsed');
            $tooltip.text('收合選單');

            // Show highlight when expanded
            toggleHighlight(true);
        }
        isSidebarCollapsed = collapsed;
    }

    // Hover Expansion Logic
    $sidebarNav.on('mouseenter', function() {
        if (isSidebarCollapsed && !ignoreHover) {
            $(this).addClass('hover-expanded');
            // Temporarily show highlight when hover-expanded
            toggleHighlight(true);
        }
    });

    $sidebarNav.on('mouseleave', function() {
        $(this).removeClass('hover-expanded');
        ignoreHover = false; // Reset when mouse leaves

        // If sidebar is supposedly collapsed, hide highlight again
        if (isSidebarCollapsed) {
            toggleHighlight(false);
        }
    });

    // Initial state
    updateSidebarCollapseState(isSidebarCollapsed);

    $sidebarCollapseToggle.on('click', function(e) {
        e.preventDefault();
        const newState = !isSidebarCollapsed;

        if (newState === true) {
            // Force remove hover-expanded and prevent it from coming back until mouse leaves
            $sidebarNav.removeClass('hover-expanded');
            ignoreHover = true; // Set lock
        }

        updateSidebarCollapseState(newState);
        localStorage.setItem('sidebar_collapsed_locked', newState);
    });
}
