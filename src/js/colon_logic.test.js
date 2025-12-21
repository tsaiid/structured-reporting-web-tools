import { calculateColonStage } from './colon_logic';

describe('Colon Logic', () => {
    describe('calculateColonStage', () => {
        test('Tx: Not visualized', () => {
            const result = calculateColonStage({
                isNotVisualized: true,
                isNonMeasurable: false,
                tumorSize: 0,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                metastasis: { m1c: false, m1abCount: 0 }
            });
            expect(result.t).toEqual(['x']);
        });

        test('T4b overrides lower stages', () => {
            const result = calculateColonStage({
                isNotVisualized: false,
                isNonMeasurable: false,
                tumorSize: 3,
                invasion: { t4b: true, t4a: false, t3: true, t2: false },
                nodesCount: 0,
                metastasis: { m1c: false, m1abCount: 0 }
            });
            expect(result.t).toContain('4b');
        });

        test('N2b: >= 7 nodes', () => {
             const result = calculateColonStage({
                isNotVisualized: false,
                isNonMeasurable: false,
                tumorSize: 3,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 7,
                metastasis: { m1c: false, m1abCount: 0 }
            });
            expect(result.n).toContain('2b');
        });

        test('N1a: 1 node', () => {
             const result = calculateColonStage({
                isNotVisualized: false,
                isNonMeasurable: false,
                tumorSize: 3,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 1,
                metastasis: { m1c: false, m1abCount: 0 }
            });
            expect(result.n).toContain('1a');
        });

        test('M1c: Peritoneal metastasis', () => {
             const result = calculateColonStage({
                isNotVisualized: false,
                isNonMeasurable: false,
                tumorSize: 3,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                metastasis: { m1c: true, m1abCount: 1 }
            });
            expect(result.m).toContain('1c');
        });

        test('M1a: Single site metastasis', () => {
             const result = calculateColonStage({
                isNotVisualized: false,
                isNonMeasurable: false,
                tumorSize: 3,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                metastasis: { m1c: false, m1abCount: 1 }
            });
            expect(result.m).toContain('1a');
        });
    });
});
