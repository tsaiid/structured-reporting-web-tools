import { calculateGastricStage } from './gastric_logic';

describe('Gastric Logic', () => {
    describe('calculateGastricStage', () => {
        test('T3 selected', () => {
            const result = calculateGastricStage({
                tStageValue: '3',
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toContain('3');
        });

        test('N3b: >= 16 nodes', () => {
            const result = calculateGastricStage({
                tStageValue: '1a',
                nodesCount: 16,
                hasMetastasis: false
            });
            expect(result.n).toContain('3b');
        });

        test('N3a: 7-15 nodes', () => {
            const result = calculateGastricStage({
                tStageValue: '1a',
                nodesCount: 7,
                hasMetastasis: false
            });
            expect(result.n).toContain('3a');
        });

        test('N2: 3-6 nodes', () => {
            const result = calculateGastricStage({
                tStageValue: '1a',
                nodesCount: 3,
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('M1: Metastasis', () => {
            const result = calculateGastricStage({
                tStageValue: '1a',
                nodesCount: 0,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });

        test('Tx: "x" selected results in Tx and not T0', () => {
            const result = calculateGastricStage({
                tStageValue: 'x',
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
            expect(result.t).not.toContain('0');
        });

        test('Tx: isNonMeasurable results in Tx', () => {
            const result = calculateGastricStage({
                isNonMeasurable: true,
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
            expect(result.t).not.toContain('0');
        });

        test('Tx: isNonMeasurable with default tStageValue "x"', () => {
            const result = calculateGastricStage({
                isNonMeasurable: true,
                tStageValue: 'x',
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('T4b: invasion stage preserved even when non-measurable', () => {
            const result = calculateGastricStage({
                isNonMeasurable: true,
                tStageValue: '4b',
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['4b']);
        });

        test('T0: explicitly no tumor results in T0', () => {
            const result = calculateGastricStage({
                isT0: true,
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['0']);
        });

        test('Tx: default/empty data fallback results in Tx', () => {
            const result = calculateGastricStage({
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });
    });
});
