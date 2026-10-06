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

        test('Tx: Non-measurable tumor results in Tx (not default T0)', () => {
            const result = calculateGistStage({
                tumorSize: NaN,
                isNonMeasurable: true,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('Tx: Missing size results in Tx (not default T0)', () => {
            const result = calculateGistStage({
                tumorSize: NaN,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('T0: Explicitly no tumor (tumorSize: 0 or isT0: true) results in T0', () => {
            const result = calculateGistStage({
                tumorSize: 0,
                isT0: true,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['0']);
        });

        test('T2: > 2cm and <= 5cm', () => {
            const result = calculateGistStage({
                tumorSize: 3.5,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2']);
        });

        test('T3: > 5cm and <= 10cm', () => {
            const result = calculateGistStage({
                tumorSize: 8.0,
                isNonMeasurable: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['3']);
        });
    });
});
