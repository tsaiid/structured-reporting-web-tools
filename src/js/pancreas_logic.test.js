import { calculatePancreasStage } from './pancreas_logic';

describe('Pancreas Logic', () => {
    describe('calculatePancreasStage', () => {
        test('T4: overrides all', () => {
            const result = calculatePancreasStage({
                tumorSize: 1.0,
                isNonMeasurable: false,
                isT4: true,
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });

        test('T3: > 4cm', () => {
            const result = calculatePancreasStage({
                tumorSize: 4.1,
                isNonMeasurable: false,
                isT4: false,
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toContain('3');
        });

        test('T1a: <= 0.5cm', () => {
            const result = calculatePancreasStage({
                tumorSize: 0.5,
                isNonMeasurable: false,
                isT4: false,
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toContain('1a');
        });

        test('N2: >= 4 nodes', () => {
            const result = calculatePancreasStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                isT4: false,
                nodesCount: 4,
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('M1: Metastasis', () => {
            const result = calculatePancreasStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                isT4: false,
                nodesCount: 0,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
