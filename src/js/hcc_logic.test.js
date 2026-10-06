import { calculateHCCStage } from './hcc_logic';

describe('HCC Logic', () => {
    describe('calculateHCCStage', () => {
        test('T4: Major vascular invasion overrides everything', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 1.5,
                majorVascularInvasion: true,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['4']);
        });

        test('T1a: Single tumor <= 2cm', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2.0,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1a']);
        });

        test('T1b: Single tumor > 2cm', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2.1,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1b']);
        });

        test('T2: Single tumor > 2cm with vascular invasion', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2.1,
                vascularInvasion: true,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2']);
        });

        test('T1a: Single tumor <= 2cm remains T1a with vascular invasion', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2.0,
                vascularInvasion: true,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1a']);
        });

        test('T2: Multiple tumors, none > 5cm', () => {
            const result = calculateHCCStage({
                tumorCount: 2,
                largestTumorSize: 4.9,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2']);
        });

        test('T3: Multiple tumors, at least one > 5cm', () => {
            const result = calculateHCCStage({
                tumorCount: 3,
                largestTumorSize: 5.1,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['3']);
        });

        test('Multiple tumors (NaN count inputs treated as multiple)', () => {
             const result = calculateHCCStage({
                tumorCount: NaN,
                largestTumorSize: 3,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['2']);
        });

        test('N1: Nodes present', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2,
                majorVascularInvasion: false,
                hasNodes: true,
                hasMetastasis: false
            });
            expect(result.n).toEqual(['0', '1']); // Logic pushes '1' into ['0']
        });

        test('M1: Metastasis present', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: 2,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: true
            });
            expect(result.m).toEqual(['0', '1']); // Logic pushes '1' into ['0']
        });
        test('Tx: Non-measurable tumor results in Tx', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: NaN,
                isNonMeasurable: true,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('Tx: Unfilled size and tumor count results in Tx (not default T2)', () => {
            const result = calculateHCCStage({
                tumorCount: NaN,
                largestTumorSize: NaN,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('Tx: Solitary tumor with missing size results in Tx (not default T1a)', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: undefined,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('T0: Explicitly no tumor results in T0', () => {
            const result = calculateHCCStage({
                tumorCount: 0,
                largestTumorSize: 0,
                isT0: true,
                majorVascularInvasion: false,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['0']);
        });

        test('T4: T4 features override non-measurable size', () => {
            const result = calculateHCCStage({
                tumorCount: 1,
                largestTumorSize: NaN,
                isNonMeasurable: true,
                hasT4Features: true,
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['4']);
        });
    });
});
