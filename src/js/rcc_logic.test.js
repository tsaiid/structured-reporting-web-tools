import { calculateRCCStage } from './rcc_logic';

describe('RCC Logic', () => {
    describe('calculateRCCStage', () => {
        test('T4: overrides all', () => {
            const result = calculateRCCStage({
                tumorSize: 3.0,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: true, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });

        test('T3c: IVC above diaphragm', () => {
            const result = calculateRCCStage({
                tumorSize: 5.0,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: true, t3c: true, t4: false, ivcLevel: '3c' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('3c');
        });

        test('T2b: > 10cm', () => {
            const result = calculateRCCStage({
                tumorSize: 11.0,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('2b');
        });

        test('N1: Nodes present', () => {
            const result = calculateRCCStage({
                tumorSize: 3.0,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: true,
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
        });

        test('M1: Metastasis', () => {
            const result = calculateRCCStage({
                tumorSize: 3.0,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });

        test('Tx: Non-assessable tumor without invasion results in Tx', () => {
            const result = calculateRCCStage({
                tumorSize: NaN,
                isNotAssessable: true,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('Tx: Missing tumor size without invasion results in Tx (not default T1a)', () => {
            const result = calculateRCCStage({
                tumorSize: NaN,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('T0: Explicitly no tumor results in T0', () => {
            const result = calculateRCCStage({
                tumorSize: 0,
                isT0: true,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['0']);
        });

        test('T1a: Solitary tumor <= 4cm results in T1a', () => {
            const result = calculateRCCStage({
                tumorSize: 3.5,
                isNotAssessable: false,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: false, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1a']);
        });

        test('T4: T4 invasion overrides non-assessable flag', () => {
            const result = calculateRCCStage({
                tumorSize: NaN,
                isNotAssessable: true,
                invasion: { t3a: false, t3bc: false, t3c: false, t4: true, ivcLevel: '' },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });
    });
});
