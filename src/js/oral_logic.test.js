import { calculateOralStage } from './oral_logic';

describe('Oral Logic', () => {
    describe('calculateOralStage', () => {
        test('T4b: overrides all', () => {
            const result = calculateOralStage({
                tumorSize: 1.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: false,
                isOral: true,
                invasion: { lipT4a: false, oralT4a: false, t4b: true },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4b');
        });

        test('T4a (Oral): bone invasion', () => {
            const result = calculateOralStage({
                tumorSize: 3.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: false,
                isOral: true,
                invasion: { lipT4a: false, oralT4a: true, t4b: false },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4a');
        });

        test('N3b: ENE present', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: true, nodeSize: 2.0, hasENE: true, isSingleNode: true, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.n).toContain('3b');
        });

        test('N2c: Bilateral nodes', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: true, nodeSize: 2.0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('2c');
        });

        test('M1: Metastasis', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
