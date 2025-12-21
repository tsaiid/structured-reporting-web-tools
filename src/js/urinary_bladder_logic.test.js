import { calculateUrinaryBladderStage } from './urinary_bladder_logic';

describe('Urinary Bladder Logic', () => {
    describe('calculateUrinaryBladderStage', () => {
        test('Tx: Not assessable invasion', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: true,
                isNonMeasurable: false,
                isTInvasionNotAssessable: true,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodes: { hasNodes: false, hasCommonIliacNodes: false, isMultipleNodes: false, nodesCount: 0 },
                metastasis: { hasMetastasis: false, isM1b: false }
            });
            expect(result.t).toContain('x');
        });

        test('T0: Non-measurable but invasion assessable (and negative)', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: false,
                isNonMeasurable: true,
                isTInvasionNotAssessable: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodes: { hasNodes: false, hasCommonIliacNodes: false, isMultipleNodes: false, nodesCount: 0 },
                metastasis: { hasMetastasis: false, isM1b: false }
            });
            expect(result.t).toContain('0');
        });

        test('T4b: overrides lower', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: false,
                isNonMeasurable: false,
                isTInvasionNotAssessable: false,
                invasion: { t4b: true, t4a: true, t3: true, t2: true },
                nodes: { hasNodes: false, hasCommonIliacNodes: false, isMultipleNodes: false, nodesCount: 0 },
                metastasis: { hasMetastasis: false, isM1b: false }
            });
            expect(result.t).toContain('4b');
        });

        test('N3: Common iliac nodes', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: false,
                isNonMeasurable: false,
                isTInvasionNotAssessable: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodes: { hasNodes: true, hasCommonIliacNodes: true, isMultipleNodes: false, nodesCount: 1 },
                metastasis: { hasMetastasis: false, isM1b: false }
            });
            expect(result.n).toContain('3');
        });

        test('N2: Multiple nodes', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: false,
                isNonMeasurable: false,
                isTInvasionNotAssessable: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodes: { hasNodes: true, hasCommonIliacNodes: false, isMultipleNodes: true, nodesCount: 1 },
                metastasis: { hasMetastasis: false, isM1b: false }
            });
            expect(result.n).toContain('2');
        });

        test('M1b: Non-lymph-node metastasis', () => {
            const result = calculateUrinaryBladderStage({
                isNotAssessable: false,
                isNonMeasurable: false,
                isTInvasionNotAssessable: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodes: { hasNodes: false, hasCommonIliacNodes: false, isMultipleNodes: false, nodesCount: 0 },
                metastasis: { hasMetastasis: true, isM1b: true }
            });
            expect(result.m).toContain('1b');
        });
    });
});
