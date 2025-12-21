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
    });
});
