import { calculateGistStage } from './gist_logic';

describe('GIST Logic', () => {
    describe('calculateGistStage', () => {
        test('T4: > 10cm', () => {
            const result = calculateGistStage({
                tumorSize: 10.1,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });

        test('T1: <= 2cm', () => {
            const result = calculateGistStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('1');
        });

        test('N1: Nodes present', () => {
            const result = calculateGistStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                hasNodes: true,
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
        });

        test('M1: Metastasis', () => {
            const result = calculateGistStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
