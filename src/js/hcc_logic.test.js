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
    });
});
