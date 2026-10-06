import { calculateOgsTrunkStage, AJCC_T, AJCC_N, AJCC_M } from './ogs_trunk_logic.js';
import { getMaxStage } from './ajcc_common.js';

describe('OGS Trunk / Appendicular / Skull Staging Logic (AJCC 8th)', () => {
    describe('T Stage', () => {
        test('Default / empty inputs should result in T0', () => {
            const res = calculateOgsTrunkStage({});
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('Non-measurable or Not assessable should return Tx', () => {
            const res1 = calculateOgsTrunkStage({ isNonMeasurable: true });
            expect(getMaxStage(res1.t)).toBe('x');

            const res2 = calculateOgsTrunkStage({ isNotAssessable: true });
            expect(getMaxStage(res2.t)).toBe('x');
        });

        test('T0 when explicitly marked no evidence', () => {
            const res = calculateOgsTrunkStage({ isNoEvidence: true });
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('T1: Tumor <= 8 cm in greatest dimension', () => {
            const resSmall = calculateOgsTrunkStage({ tumorSize: 3.5 });
            expect(getMaxStage(resSmall.t)).toBe('1');

            const resBoundary = calculateOgsTrunkStage({ tumorSize: 8.0 });
            expect(getMaxStage(resBoundary.t)).toBe('1');
        });

        test('T2: Tumor > 8 cm in greatest dimension', () => {
            const resBoundary = calculateOgsTrunkStage({ tumorSize: 8.1 });
            expect(getMaxStage(resBoundary.t)).toBe('2');

            const resLarge = calculateOgsTrunkStage({ tumorSize: 15.0 });
            expect(getMaxStage(resLarge.t)).toBe('2');
        });

        test('T3: Discontinuous tumors in the primary bone site', () => {
            const res = calculateOgsTrunkStage({ hasDiscontinuousTumor: true });
            expect(getMaxStage(res.t)).toBe('3');
        });

        test('T3 overrides T1 and T2 when discontinuous tumors are present', () => {
            const resWithT1 = calculateOgsTrunkStage({ tumorSize: 5.0, hasDiscontinuousTumor: true });
            expect(getMaxStage(resWithT1.t)).toBe('3');

            const resWithT2 = calculateOgsTrunkStage({ tumorSize: 12.0, hasDiscontinuousTumor: true });
            expect(getMaxStage(resWithT2.t)).toBe('3');
        });
    });

    describe('N Stage', () => {
        test('N0 by default when no regional nodes involvement', () => {
            const res = calculateOgsTrunkStage({});
            expect(getMaxStage(res.n)).toBe('0');
        });

        test('N1 when regional lymph node metastasis is present', () => {
            const res = calculateOgsTrunkStage({ nodes: { hasNodes: true } });
            expect(getMaxStage(res.n)).toBe('1');
        });
    });

    describe('M Stage', () => {
        test('M0 by default when no distant metastasis', () => {
            const res = calculateOgsTrunkStage({});
            expect(getMaxStage(res.m)).toBe('0');
        });

        test('M1a: Distant metastasis to lung only', () => {
            const res = calculateOgsTrunkStage({
                metastasis: { hasLungMetastasis: true }
            });
            expect(getMaxStage(res.m)).toBe('1a');
        });

        test('M1b: Distant metastasis to bone or other sites', () => {
            const resBone = calculateOgsTrunkStage({
                metastasis: { hasBoneMetastasis: true }
            });
            expect(getMaxStage(resBone.m)).toBe('1b');

            const resOther = calculateOgsTrunkStage({
                metastasis: { hasOtherMetastasis: true }
            });
            expect(getMaxStage(resOther.m)).toBe('1b');

            const resExplicit = calculateOgsTrunkStage({
                metastasis: { isM1b: true }
            });
            expect(getMaxStage(resExplicit.m)).toBe('1b');
        });

        test('M1b supersedes M1a when both lung and other sites are present', () => {
            const resBoth = calculateOgsTrunkStage({
                metastasis: {
                    hasLungMetastasis: true,
                    hasBoneMetastasis: true
                }
            });
            expect(getMaxStage(resBoth.m)).toBe('1b');
        });
    });

    describe('Dictionary and Definitions Integrity', () => {
        test('AJCC_T map contains expected definitions', () => {
            expect(AJCC_T.get('1')).toContain('≤8 cm');
            expect(AJCC_T.get('2')).toContain('>8 cm');
            expect(AJCC_T.get('3')).toContain('Discontinuous');
        });

        test('AJCC_N and AJCC_M contain expected definitions', () => {
            expect(AJCC_N.get('1')).toContain('Regional lymph node metastasis');
            expect(AJCC_M.get('1a')).toBe('Lung');
            expect(AJCC_M.get('1b')).toContain('Bone');
        });
    });
});
