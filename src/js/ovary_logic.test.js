import { calculateOvaryStage } from './ovary_logic';

describe('Ovary Logic', () => {
    describe('calculateOvaryStage', () => {
        test('Tx: No invasion, no size', () => {
            const result = calculateOvaryStage({
                tumorSize: NaN,
                hasInvasion: false,
                isBilateral: false,
                invasion: { t3: false, t3_gt_2cm: false, t2: false, t2a: false, t2b: false },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('x');
        });

        test('T1b: Bilateral, no invasion', () => {
            const result = calculateOvaryStage({
                tumorSize: 2.0,
                hasInvasion: false,
                isBilateral: true,
                invasion: { t3: false, t3_gt_2cm: false, t2: false, t2a: false, t2b: false },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('1b');
        });

        test('T3c: Implants > 2cm', () => {
            const result = calculateOvaryStage({
                tumorSize: 2.0,
                hasInvasion: true,
                isBilateral: false,
                invasion: { t3: true, t3_gt_2cm: true, t2: false, t2a: false, t2b: false },
                hasNodes: false,
                hasMetastasis: false
            });
            expect(result.t).toContain('3c');
        });

        test('T1a with N1: Regional nodes do not overwrite T stage', () => {
            const result = calculateOvaryStage({
                tumorSize: 2.0,
                hasInvasion: false,
                isBilateral: false,
                invasion: { t3: false, t3_gt_2cm: false, t2: false, t2a: false, t2b: false },
                hasNodes: true,
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
            expect(result.t).toContain('1a');
            expect(result.t).not.toContain('3');
        });

        test('M1: Metastasis', () => {
            const result = calculateOvaryStage({
                tumorSize: 2.0,
                hasInvasion: false,
                isBilateral: false,
                invasion: { t3: false, t3_gt_2cm: false, t2: false, t2a: false, t2b: false },
                hasNodes: false,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
