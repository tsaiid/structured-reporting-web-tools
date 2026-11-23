import $ from 'jquery';
import { ajcc_template, ajcc_template_with_parent, getMaxStage, compareStage, getStageRank, getParentStage, showCopyFeedback, setupReportPage, initFormEnhancements, resetReportForm, initSidebar } from './ajcc_common';

describe('ajcc_common', () => {
    const mockTMap = new Map([
        ['x', 'Primary tumor cannot be assessed'],
        ['0', 'No evidence of primary tumor'],
        ['1', 'Tumor 2 cm or less in greatest dimension'],
        ['1a', 'Tumor 1 cm or less in greatest dimension'],
        ['1b', 'Tumor > 1 cm but <= 2 cm'],
        ['2', 'Tumor > 2 cm but <= 4 cm'],
        ['4', 'Tumor invades adjacent structures'],
        ['4a', 'Tumor invades visceral peritoneum'],
        ['4b', 'Tumor directly invades adjacent organs']
    ]);

    const mockNMap = new Map([
        ['0', 'No regional lymph node metastasis'],
        ['1', 'One to three regional lymph nodes'],
        ['1a', 'One regional lymph node'],
        ['1b', 'Two or three regional lymph nodes'],
        ['2', 'Four or more regional nodes']
    ]);

    const mockMMap = new Map([
        ['0', 'No distant metastasis'],
        ['1', 'Metastasis to distant sites'],
        ['1a', 'Metastasis to one site'],
        ['1b', 'Metastasis to multiple sites'],
        ['1c', 'Metastasis to peritoneal surface']
    ]);

    describe('ajcc_template', () => {
        test('formats report with full string values', () => {
            const result = ajcc_template('Colon Cancer', '2', 'Tumor > 2 cm', '0', 'No nodes', '0', 'No metastasis', 8);
            expect(result).toContain('AJCC Cancer Staging System, 8th edition');
            expect(result).toContain('For Colon Cancer');
            expect(result).toContain('T2 : Tumor > 2 cm');
            expect(result).toContain('N0 : No nodes');
            expect(result).toContain('M0 : No metastasis');
            expect(result).toContain('T2N0M0');
        });

        test('handles undefined and null gracefully without printing "undefined"', () => {
            const result = ajcc_template('Colon Cancer', undefined, undefined, null, null, undefined, undefined, 8);
            expect(result).not.toContain('undefined');
            expect(result).not.toContain('null');
            expect(result).toContain('(T)  PRIMARY TUMOR:\n T : ');
            expect(result).toContain('(N)  REGIONAL LYMPH NODES:\n N : ');
            expect(result).toContain('(M)  DISTANT METASTASIS:\n M : ');
            expect(result).toContain('TNM');
        });
    });

    describe('ajcc_template_with_parent', () => {
        test('formats subcategories with parent stage line', () => {
            const result = ajcc_template_with_parent(
                'Colorectal Carcinoma',
                '4a',
                mockTMap,
                '1b',
                mockNMap,
                '1c',
                mockMMap,
                8
            );

            expect(result).toContain('AJCC Cancer Staging System, 8th edition');
            expect(result).toContain('For Colorectal Carcinoma');
            // Parent and subcategory for T
            expect(result).toContain('T4 : Tumor invades adjacent structures');
            expect(result).toContain('T4a : Tumor invades visceral peritoneum');
            // Parent and subcategory for N
            expect(result).toContain('N1 : One to three regional lymph nodes');
            expect(result).toContain('N1b : Two or three regional lymph nodes');
            // Parent and subcategory for M
            expect(result).toContain('M1 : Metastasis to distant sites');
            expect(result).toContain('M1c : Metastasis to peritoneal surface');
            // Staging summary
            expect(result).toContain('T4aN1bM1c');
        });

        test('formats base categories without parent line duplication', () => {
            const result = ajcc_template_with_parent(
                'Colorectal Carcinoma',
                '2',
                mockTMap,
                '0',
                mockNMap,
                '0',
                mockMMap,
                8
            );

            expect(result).toContain('T2 : Tumor > 2 cm but <= 4 cm');
            expect(result).toContain('N0 : No regional lymph node metastasis');
            expect(result).toContain('M0 : No distant metastasis');
            expect(result).toContain('T2N0M0');
        });

        test('works with plain object tables as well as Map', () => {
            const objT = Object.fromEntries(mockTMap);
            const objN = Object.fromEntries(mockNMap);
            const objM = Object.fromEntries(mockMMap);

            const result = ajcc_template_with_parent('Colorectal Carcinoma', '1a', objT, '0', objN, '0', objM, 8);
            expect(result).toContain('T1 : Tumor 2 cm or less in greatest dimension');
            expect(result).toContain('T1a : Tumor 1 cm or less in greatest dimension');
            expect(result).toContain('T1aN0M0');
        });

        test('prevents crash when t, n, m are undefined (empty selection)', () => {
            expect(() => {
                const result = ajcc_template_with_parent(
                    'Colorectal Carcinoma',
                    undefined,
                    mockTMap,
                    undefined,
                    mockNMap,
                    undefined,
                    mockMMap,
                    8
                );
                expect(result).not.toContain('undefined');
                expect(result).toContain('(T)  PRIMARY TUMOR:\n T : \n\n');
                expect(result).toContain('(N)  REGIONAL LYMPH NODES:\n N : \n\n');
                expect(result).toContain('(M)  DISTANT METASTASIS:\n M : ');
                expect(result).toContain('TNM');
            }).not.toThrow();
        });

        test('handles null and empty string parameters safely', () => {
            const result = ajcc_template_with_parent(
                'Colorectal Carcinoma',
                null,
                mockTMap,
                '',
                mockNMap,
                null,
                mockMMap,
                9
            );
            expect(result).not.toContain('null');
            expect(result).not.toContain('undefined');
            expect(result).toContain('AJCC Cancer Staging System, 9th edition');
            expect(result).toContain('TNM');
        });

        test('handles undefined or null tables without throwing', () => {
            expect(() => {
                const result = ajcc_template_with_parent(
                    'Colorectal Carcinoma',
                    '1',
                    null,
                    '0',
                    undefined,
                    '0',
                    null,
                    8
                );
                expect(result).toContain('T1N0M0');
            }).not.toThrow();
        });

        test('correctly matches M1c as parent for lung M1c1 instead of M1', () => {
            const lungMMap = new Map([
                ['0', 'No distant metastasis'],
                ['1', 'Distant metastasis'],
                ['1a', 'Pleural or pericardial nodules'],
                ['1b', 'Single extrathoracic metastasis in a single organ system'],
                ['1c', 'Multiple extrathoracic metastases'],
                ['1c1', 'Multiple extrathoracic metastases in a single organ system'],
                ['1c2', 'Multiple extrathoracic metastases in multiple organ systems'],
            ]);

            const result = ajcc_template_with_parent(
                'Lung Carcinoma',
                '1a',
                mockTMap,
                '0',
                mockNMap,
                '1c1',
                lungMMap,
                9
            );

            // 必須是 M1c 而非 M1 作為直接父層
            expect(result).toContain('M1c : Multiple extrathoracic metastases');
            expect(result).toContain('M1c1 : Multiple extrathoracic metastases in a single organ system');
            expect(result).not.toContain('M1 : Distant metastasis');
            expect(result).toContain('T1aN0M1c1');
        });

        test('accepts array parameters and automatically resolves max stage', () => {
            const result = ajcc_template_with_parent(
                'Colorectal Carcinoma',
                ['x', '4a'],
                mockTMap,
                ['0', '1b'],
                mockNMap,
                ['0', '1c'],
                mockMMap,
                8
            );

            expect(result).toContain('T4 : Tumor invades adjacent structures');
            expect(result).toContain('T4a : Tumor invades visceral peritoneum');
            expect(result).toContain('N1b : Two or three regional lymph nodes');
            expect(result).toContain('M1c : Metastasis to peritoneal surface');
            expect(result).toContain('T4aN1bM1c');
        });
    });

    describe('getParentStage', () => {
        const lungMMap = new Map([
            ['0', 'No distant metastasis'],
            ['1', 'Distant metastasis'],
            ['1c', 'Multiple extrathoracic metastases'],
            ['1c1', 'Multiple extrathoracic metastases in a single organ system'],
            ['1c2', 'Multiple extrathoracic metastases in multiple organ systems'],
        ]);

        test('returns direct parent for 3-part stages (e.g. 1c1 -> 1c, 1b1 -> 1b)', () => {
            expect(getParentStage('1c1', lungMMap)).toBe('1c');
            expect(getParentStage('1c2', lungMMap)).toBe('1c');
            expect(getParentStage('1b1')).toBe('1b');
            expect(getParentStage('2a2')).toBe('2a');
        });

        test('returns major stage for 2-part stages (e.g. 4a -> 4, 1b -> 1)', () => {
            expect(getParentStage('4a')).toBe('4');
            expect(getParentStage('1b')).toBe('1');
            expect(getParentStage('2b')).toBe('2');
            expect(getParentStage('1mi')).toBe('1');
        });

        test('returns null for base stages or special values', () => {
            expect(getParentStage('1')).toBeNull();
            expect(getParentStage('0')).toBeNull();
            expect(getParentStage('x')).toBeNull();
            expect(getParentStage('is')).toBeNull();
            expect(getParentStage('a')).toBeNull();
            expect(getParentStage('')).toBeNull();
            expect(getParentStage(null)).toBeNull();
        });
    });

    describe('getMaxStage', () => {
        test('resolves T4 over Tx (fixes JS lexicographical sort bug where x > 4)', () => {
            expect(getMaxStage(['4', 'x'])).toBe('4');
            expect(getMaxStage(['x', '4'])).toBe('4');
            expect(getMaxStage(['x', '4b'])).toBe('4b');
            expect(getMaxStage(['x', '1a'])).toBe('1a');
            expect(getMaxStage(['x', '0'])).toBe('0');
        });

        test('orders by clinical severity within the same major category', () => {
            expect(getMaxStage(['4', '4a', '4b'])).toBe('4b');
            expect(getMaxStage(['3', '3a', '3b', '3c'])).toBe('3c');
            expect(getMaxStage(['2', '2a', '2a1', '2a2', '2b', '2c'])).toBe('2c');
            expect(getMaxStage(['1', '1mi', '1a', '1b', '1c'])).toBe('1c');
            expect(getMaxStage(['1c', '1c1', '1c2'])).toBe('1c2');
            expect(getMaxStage(['1b', '1b1', '1b2', '1b3'])).toBe('1b3');
        });

        test('orders correctly across special non-invasive stages', () => {
            // 1 > is (Tis) > a (Ta) > 0(i+) > 0 > x
            expect(getMaxStage(['1', 'is'])).toBe('1');
            expect(getMaxStage(['is', 'a'])).toBe('is');
            expect(getMaxStage(['a', '0'])).toBe('a');
            expect(getMaxStage(['0(i+)', '0'])).toBe('0(i+)');
            expect(getMaxStage(['0', 'x'])).toBe('0');
        });

        test('handles empty or boundary inputs gracefully', () => {
            expect(getMaxStage(['x'])).toBe('x');
            expect(getMaxStage(['0'])).toBe('0');
            expect(getMaxStage([])).toBe('');
            expect(getMaxStage([null, undefined, ''])).toBe('');
            expect(getMaxStage(null)).toBe('');
        });
    });

    describe('showCopyFeedback', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            document.body.innerHTML = `
                <button type="button" id="btn_copy" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-r-lg hover:bg-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:bg-blue-700">
                    <i class="fas fa-copy"></i>
                    <span class="hidden md:inline ml-1">Show &amp; Copy</span>
                </button>
                <button type="button" id="btn_plain">Copy</button>
                <h5 id="reportModalLongTitle">Lung Cancer Staging Form</h5>
            `;
        });

        afterEach(() => {
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
            document.body.innerHTML = '';
        });

        test('updates button text, icon, color and title upon copy success', () => {
            const btn = document.getElementById('btn_copy');
            showCopyFeedback(btn, true);

            expect(btn.innerHTML).toContain('fa-check');
            expect(btn.innerHTML).toContain('Copied!');
            expect(btn.classList.contains('bg-green-600')).toBe(true);
            expect(btn.classList.contains('bg-blue-600')).toBe(false);
            expect(btn.getAttribute('title')).toBe('Copied to clipboard!');

            // Timers advance
            jest.advanceTimersByTime(2000);

            expect(btn.innerHTML).toContain('fa-copy');
            expect(btn.innerHTML).toContain('Show &amp; Copy');
            expect(btn.classList.contains('bg-green-600')).toBe(false);
            expect(btn.classList.contains('bg-blue-600')).toBe(true);
            expect(btn.getAttribute('title')).toBeNull();
        });

        test('preserves original HTML across multiple rapid clicks', () => {
            const btn = document.getElementById('btn_copy');

            showCopyFeedback(btn, true);
            jest.advanceTimersByTime(1000);
            expect(btn.innerHTML).toContain('Copied!');

            // Second click during active feedback
            showCopyFeedback(btn, true);
            jest.advanceTimersByTime(1500);
            // Should still be showing Copied! because timer was reset
            expect(btn.innerHTML).toContain('Copied!');

            // Advance remaining time
            jest.advanceTimersByTime(600);
            expect(btn.innerHTML).toContain('Show &amp; Copy');
            expect(btn.innerHTML).toContain('fa-copy');
        });

        test('handles copy failure with red styling and failed text', () => {
            const btn = document.getElementById('btn_copy');
            showCopyFeedback(btn, false);

            expect(btn.innerHTML).toContain('fa-times');
            expect(btn.innerHTML).toContain('Failed!');
            expect(btn.classList.contains('bg-red-600')).toBe(true);
            expect(btn.getAttribute('title')).toBe('Copy failed!');

            jest.advanceTimersByTime(2000);

            expect(btn.innerHTML).toContain('Show &amp; Copy');
            expect(btn.classList.contains('bg-blue-600')).toBe(true);
            expect(btn.classList.contains('bg-red-600')).toBe(false);
        });

        test('formats plain button without responsive span gracefully', () => {
            const btn = document.getElementById('btn_plain');
            showCopyFeedback(btn, true);

            expect(btn.textContent).toContain('✓ Copied!');

            jest.advanceTimersByTime(2000);
            expect(btn.textContent).toBe('Copy');
        });

        test('appends feedback badge to modal title and removes after timeout', () => {
            const btn = document.getElementById('btn_copy');
            showCopyFeedback(btn, true, { modalTitleSelector: '#reportModalLongTitle' });

            const title = document.getElementById('reportModalLongTitle');
            expect(title.innerHTML).toContain('report-modal-copy-feedback-badge');
            expect(title.innerHTML).toContain('Copied to clipboard');

            jest.advanceTimersByTime(2000);
            expect(title.innerHTML).not.toContain('report-modal-copy-feedback-badge');
            expect(title.textContent).toBe('Lung Cancer Staging Form');
        });
    });

    describe('setupReportPage', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <button type="button" id="btn_copy" class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-r-lg hover:bg-blue-700">
                    <i class="fas fa-copy"></i>
                    <span class="hidden md:inline ml-1">Show &amp; Copy</span>
                </button>
                <div id="reportModalLongTitle">Oral Cancer Staging Form</div>
                <div id="reportModalBody"><pre><code>T2N0M0 Staging Report</code></pre></div>
            `;
        });

        afterEach(() => {
            document.body.innerHTML = '';
            jest.restoreAllMocks();
        });

        test('triggers generateReportFn and copies combined text with visual feedback', async () => {
            const generateMock = jest.fn();
            const writeTextMock = jest.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: {
                    writeText: writeTextMock
                }
            });

            setupReportPage({
                generateReportFn: generateMock
            });

            $('#btn_copy').trigger('click');

            expect(generateMock).toHaveBeenCalled();
            expect(writeTextMock).toHaveBeenCalledWith('Oral Cancer Staging Form\n\nT2N0M0 Staging Report');

            // Wait microtask for promise resolution
            await Promise.resolve();

            const btn = document.getElementById('btn_copy');
            expect(btn.innerHTML).toContain('Copied!');
            expect(btn.classList.contains('bg-green-600')).toBe(true);
        });

        test('falls back to execCommand when navigator.clipboard is unavailable', () => {
            const generateMock = jest.fn();
            const originalClipboard = navigator.clipboard;
            delete navigator.clipboard;

            const execCommandMock = jest.fn().mockReturnValue(true);
            document.execCommand = execCommandMock;

            setupReportPage({
                generateReportFn: generateMock
            });

            $('#btn_copy').trigger('click');

            expect(generateMock).toHaveBeenCalled();
            expect(execCommandMock).toHaveBeenCalledWith('copy');

            const btn = document.getElementById('btn_copy');
            expect(btn.innerHTML).toContain('Copied!');

            navigator.clipboard = originalClipboard;
        });

        test('updates live TNM preview badge without opening report modal and supports reset', () => {
            document.body.innerHTML = `
                <main>
                    <span id="live_tnm_badge">TxN0M0</span>
                    <button type="button" id="btn_reset">Reset</button>
                    <button type="button" id="btn_copy">Show & Copy</button>
                    <input type="checkbox" id="cb_t2" />
                </main>
                <dialog id="reportModalLong">
                    <h5 id="reportModalLongTitle"></h5>
                    <div id="reportModalBody"><pre><code></code></pre></div>
                    <button type="button" id="btn_modal_copy">Copy</button>
                </dialog>
            `;
            const modal = document.getElementById('reportModalLong');
            modal.showModal = jest.fn();

            const generateFn = () => {
                const t = $('#cb_t2').is(':checked') ? '2' : 'x';
                const report = ajcc_template_with_parent('Test Cancer', t, mockTMap, '0', mockNMap, '0', mockMMap, 8);
                $('#reportModalLongTitle').text('Test Staging Form');
                $('#reportModalBody pre code').text(report);
                modal.showModal();
            };

            setupReportPage({ generateReportFn: generateFn });

            // Initial live preview should compute TxN0M0 without calling showModal
            expect(modal.showModal).not.toHaveBeenCalled();
            expect($('#live_tnm_badge').text()).toBe('TxN0M0');

            // Checking input updates live badge
            $('#cb_t2').prop('checked', true).trigger('change');
            expect($('#live_tnm_badge').text()).toBe('T2N0M0');
            expect(modal.showModal).not.toHaveBeenCalled();

            // Clicking reset restores defaults and updates badge back to TxN0M0
            $('#btn_reset').trigger('click');
            expect($('#cb_t2').is(':checked')).toBe(false);
            expect($('#live_tnm_badge').text()).toBe('TxN0M0');
        });

        test('strips copy feedback badge text when copying again from report modal', async () => {
            document.body.innerHTML = `
                <button type="button" id="btn_copy">Copy</button>
                <button type="button" id="btn_modal_copy">Copy</button>
                <h5 id="reportModalLongTitle">Lung Cancer Staging Form<span id="report-modal-copy-feedback-badge">Copied to clipboard</span></h5>
                <div id="reportModalBody"><pre><code>T2aN1M0</code></pre></div>
            `;
            const writeTextMock = jest.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock }
            });

            setupReportPage({ generateReportFn: jest.fn() });
            $('#btn_modal_copy').trigger('click');

            expect(writeTextMock).toHaveBeenCalledWith('Lung Cancer Staging Form\n\nT2aN1M0');
        });
    });

    describe('initFormEnhancements', () => {
        afterEach(() => {
            document.body.innerHTML = '';
        });

        test('clamps negative numbers, syncs Non-measurable, auto-checks Others, and syncs #cb_rn_sin', () => {
            document.body.innerHTML = `
                <main>
                    <input type="number" id="txt_ts_len" value="" />
                    <input type="checkbox" id="cb_ts_nm" />
                    <input type="checkbox" id="cb_dm_others" />
                    <input type="text" id="txt_dm_others" value="" />
                    <input type="checkbox" class="cb_rn" id="cb_rn_r_IIA" />
                    <input type="checkbox" class="cb_rn" id="cb_rn_r_III" />
                    <input type="checkbox" id="cb_rn_sin" checked />
                </main>
            `;

            initFormEnhancements();

            // 1. Non-negative validation
            expect($('#txt_ts_len').attr('min')).toBe('0');
            $('#txt_ts_len').val('-5').trigger('input');
            expect($('#txt_ts_len').val()).toBe('0');

            // 2. Non-measurable mutual sync
            $('#txt_ts_len').val('3.5').trigger('input');
            $('#cb_ts_nm').prop('checked', true).trigger('change');
            expect($('#txt_ts_len').val()).toBe('');
            $('#txt_ts_len').val('2.1').trigger('input');
            expect($('#cb_ts_nm').is(':checked')).toBe(false);

            // 3. Auto-check Others checkbox
            $('#txt_dm_others').val('peritoneum').trigger('input');
            expect($('#cb_dm_others').is(':checked')).toBe(true);

            // 4. Multi-station neck LN unchecks and disables #cb_rn_sin
            $('#cb_rn_r_IIA').prop('checked', true).trigger('change');
            expect($('#cb_rn_sin').is(':checked')).toBe(true);
            expect($('#cb_rn_sin').prop('disabled')).toBe(false);

            $('#cb_rn_r_III').prop('checked', true).trigger('change');
            expect($('#cb_rn_sin').is(':checked')).toBe(false);
            expect($('#cb_rn_sin').prop('disabled')).toBe(true);

            // Unchecking one station re-enables #cb_rn_sin
            $('#cb_rn_r_III').prop('checked', false).trigger('change');
            expect($('#cb_rn_sin').prop('disabled')).toBe(false);
        });
    });

    describe('initSidebar', () => {
        beforeEach(() => {
            localStorage.clear();
            document.body.innerHTML = `
                <nav id="main-sidebar">
                    <button id="sidebar-collapse-toggle"></button>
                    <span id="sidebar-tooltip"></span>
                    <input type="search" id="sidebar-filter" />
                    <button id="ajcc-toggle"></button>
                    <span id="ajcc-tooltip"></span>
                    <ul id="ajcc-sidebar-list">
                        <li><a href="lung.html"><span class="sidebar-label">Lung</span></a></li>
                        <li class="ajcc-optional"><a href="rcc.html"><span class="sidebar-label">RCC</span></a></li>
                    </ul>
                </nav>
            `;
        });

        afterEach(() => {
            document.body.innerHTML = '';
            document.body.className = '';
            document.documentElement.removeAttribute('data-sidebar-collapsed');
            document.documentElement.removeAttribute('data-ajcc-collapsed');
            localStorage.clear();
        });

        test('syncs data-sidebar-collapsed and data-ajcc-collapsed attributes on documentElement', () => {
            localStorage.setItem('sidebar_collapsed_locked', 'true');
            localStorage.setItem('ajcc_sidebar_state', 'collapsed');
            initSidebar();

            expect(document.documentElement.getAttribute('data-sidebar-collapsed')).toBe('true');
            expect(document.documentElement.getAttribute('data-ajcc-collapsed')).toBe('true');
            expect(document.body.classList.contains('sidebar-collapsed')).toBe(true);
            expect($('#ajcc-tooltip').text()).toBe('展開全部癌別');
            expect($('#ajcc-toggle').attr('title')).toBe('展開全部癌別');

            // Toggle expand sidebar & AJCC optional items
            $('#sidebar-collapse-toggle').trigger('click');
            $('#ajcc-toggle').trigger('click');

            expect(document.documentElement.hasAttribute('data-sidebar-collapsed')).toBe(false);
            expect(document.documentElement.hasAttribute('data-ajcc-collapsed')).toBe(false);
            expect(document.body.classList.contains('sidebar-collapsed')).toBe(false);
            expect($('#ajcc-tooltip').text()).toBe('收合次要癌別');
            expect($('#ajcc-toggle').attr('title')).toBe('收合次要癌別');
        });

        test('filters sidebar items including optional items when searching', () => {
            localStorage.setItem('ajcc_sidebar_state', 'collapsed');
            initSidebar();

            $('#sidebar-filter').val('rcc').trigger('input');
            expect($('a[href="lung.html"]').closest('li').css('display')).toBe('none');
            expect($('a[href="rcc.html"]').closest('li').css('display')).not.toBe('none');
            expect($('a[href="rcc.html"]').closest('li').css('opacity')).toBe('1');

            // Clearing filter restores list visibility
            $('#sidebar-filter').val('').trigger('input');
            expect($('a[href="lung.html"]').closest('li').css('display')).not.toBe('none');
        });
    });
});

