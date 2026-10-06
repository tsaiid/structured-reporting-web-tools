import { ajcc_template, ajcc_template_with_parent } from './ajcc_common';

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
    });
});
