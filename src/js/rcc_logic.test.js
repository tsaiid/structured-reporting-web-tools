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
    });
});
