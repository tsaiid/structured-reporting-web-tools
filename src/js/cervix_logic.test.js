import { calculateCervixStage } from './cervix_logic';

describe('Cervix Logic', () => {
    describe('calculateCervixStage', () => {
        test('T4: overrides all', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { t4: true, t3b: false, t3a: false, t2b: false, t2a: false, t1: false },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });

        test('T1b: T1 + measurable > 0', () => {
             const result = calculateCervixStage({
                tumorSize: 1.5,
                isNonMeasurable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2b: false, t2a: false, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('1b');
        });

         test('T1a: T1 + non-measurable', () => {
             const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: true,
                invasion: { t4: false, t3b: false, t3a: false, t2b: false, t2a: false, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('1a');
        });

        test('N2: Paraaortic nodes', () => {
             const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2b: false, t2a: false, t1: false },
                nodes: { hasRegional: true, hasParaaortic: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('N1: Regional nodes only', () => {
             const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2b: false, t2a: false, t1: false },
                nodes: { hasRegional: true, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
        });
    });
});
