export function ajcc_template(ca_str, t, t_str, n, n_str, m, m_str, ver = 8) {
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

(T)  PRIMARY TUMOR:
 T${t} : ${t_str}

(N)  REGIONAL LYMPH NODES:
 N${n} : ${n_str}

(M)  DISTANT METASTASIS:
 M${m} : ${m_str}
===================================================


=====================
AJCC ${ver}th edition Staging status:
T${t}N${n}M${m}
=====================`;
    return report;
}

export function ajcc_template_with_parent(ca_str, t, t_table, n, n_table, m, m_table, ver = 8) {
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

`;
    if (t_table instanceof Map) {
        t_table = Object.fromEntries(t_table);
    }
    report += "(T)  PRIMARY TUMOR:\n";
    if (t.match(/[abc]/)) {
        let t_p = parseInt(t);
        let t_p_str = t_table[t_p];
        report += ` T${t_p} : ${t_p_str}\n  `;
    }
    report += ` T${t} : ${t_table[t]}\n\n`;

    if (n_table instanceof Map) {
        n_table = Object.fromEntries(n_table);
    }
    report += "(N)  REGIONAL LYMPH NODES:\n";
    if (n.match(/[abc]/)) {
        let n_p = parseInt(n);
        let n_p_str = n_table[n_p];
        report += ` N${n_p} : ${n_p_str}\n  `;
    }
    report += ` N${n} : ${n_table[n]}\n\n`;

    if (m_table instanceof Map) {
        m_table = Object.fromEntries(m_table);
    }
    report += "(M)  DISTANT METASTASIS:\n";
    if (m.match(/[abc]/)) {
        let m_p = parseInt(m);
        let m_p_str = m_table[m_p];
        report += ` M${m_p} : ${m_p_str}\n  `;
    }
    report += ` M${m} : ${m_table[m]}`;

    report += `
===================================================


=====================
AJCC ${ver}th edition Staging status:
T${t}N${n}M${m}
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
    const tableClass = "w-full text-sm text-left border-collapse";
    const theadClass = "bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300";
    const thClass = "px-4 py-3 border-b border-gray-200 dark:border-gray-700";

    let ajcc_table = `
<div class="${tableWrapperClass}">
<table class="${tableClass}" id="ajcc_t">
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
<table class="${tableClass}" id="ajcc_n">
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
<table class="${tableClass}" id="ajcc_m">
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
        if (collapsed) {
            $body.addClass('sidebar-collapsed');
            $sidebarCollapseToggle.html('<i class="fas fa-angle-double-right" id="sidebar-collapse-icon"></i>');
            $sidebarCollapseToggle.attr('title', '展開 Sidebar');

            // Hide highlight when collapsed
            toggleHighlight(false);
        } else {
            $body.removeClass('sidebar-collapsed');
            $sidebarCollapseToggle.html('<i class="fas fa-angle-double-left" id="sidebar-collapse-icon"></i>');
            $sidebarCollapseToggle.attr('title', '收合 Sidebar');

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
