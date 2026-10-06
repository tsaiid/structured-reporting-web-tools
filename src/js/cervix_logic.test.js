import { calculateCervixStage } from './cervix_logic';

describe('Cervix Logic', () => {
    const baseInvasion = { t4: false, t3b: false, t3a: false, t2b: false, t2a: false, t1: false };

    describe('calculateCervixStage', () => {
        test('T4: overrides all', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t4: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['4']);
        });

        test('T3b: Pelvic wall / hydronephrosis', () => {
            const result = calculateCervixStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t3b: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['3b']);
        });

        test('T3a: Lower 1/3 vagina invasion', () => {
            const result = calculateCervixStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t3a: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['3a']);
        });

        test('T2b: Parametrial invasion', () => {
            const result = calculateCervixStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t2b: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2b']);
        });

        test('T2a1: Upper 2/3 vagina invasion + tumor size <= 4cm', () => {
            const result1 = calculateCervixStage({
                tumorSize: 2.5,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t2a: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result1.t).toEqual(['2a1']);

            const result2 = calculateCervixStage({
                tumorSize: 4.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t2a: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result2.t).toEqual(['2a1']);
        });

        test('T2a2: Upper 2/3 vagina invasion + tumor size > 4cm', () => {
            const result = calculateCervixStage({
                tumorSize: 4.5,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t2a: true, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2a2']);
        });

        test('T2a: Upper 2/3 vagina invasion + non-measurable or missing size defaults to 2a', () => {
            const resultNonMeasurable = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: true,
                invasion: { ...baseInvasion, t2a: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(resultNonMeasurable.t).toEqual(['2a']);

            const resultNoSize = calculateCervixStage({
                tumorSize: NaN,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t2a: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(resultNoSize.t).toEqual(['2a']);
        });

        test('T1b1: Confined to cervix + tumor size <= 2cm', () => {
            const result1 = calculateCervixStage({
                tumorSize: 1.5,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result1.t).toEqual(['1b1']);

            const result2 = calculateCervixStage({
                tumorSize: 2.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result2.t).toEqual(['1b1']);
        });

        test('T1b2: Confined to cervix + tumor size > 2cm and <= 4cm', () => {
            const result1 = calculateCervixStage({
                tumorSize: 2.1,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result1.t).toEqual(['1b2']);

            const result2 = calculateCervixStage({
                tumorSize: 4.0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result2.t).toEqual(['1b2']);
        });

        test('T1b3: Confined to cervix + tumor size > 4cm', () => {
            const result = calculateCervixStage({
                tumorSize: 4.5,
                isNonMeasurable: false,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1b3']);
        });

        test('T1a: Confined to cervix + non-measurable / microscopic', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: true,
                invasion: { ...baseInvasion, t1: true },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1a']);
        });

        test('T0: No primary tumor (tumorSize 0 or isT0 true without invasion)', () => {
            const result1 = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result1.t).toEqual(['0']);

            const result2 = calculateCervixStage({
                tumorSize: NaN,
                isT0: true,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result2.t).toEqual(['0']);
        });

        test('Tx: Primary tumor cannot be assessed', () => {
            const result = calculateCervixStage({
                tumorSize: NaN,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('N2: Paraaortic nodes', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: true, hasParaaortic: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('N1: Regional nodes only', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: true, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
        });

        test('N0: No regional nodes', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.n).toEqual(['0']);
        });

        test('M1: Distant metastasis', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });

        test('M0: No distant metastasis', () => {
            const result = calculateCervixStage({
                tumorSize: 0,
                isNonMeasurable: false,
                invasion: { ...baseInvasion },
                nodes: { hasRegional: false, hasParaaortic: false },
                hasMetastasis: false
            });
            expect(result.m).toEqual(['0']);
        });
    });
});
