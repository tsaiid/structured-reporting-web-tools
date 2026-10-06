import { calculateOgsPelvisStage, AJCC_T, AJCC_N, AJCC_M } from './ogs_pelvis_logic.js';
import { getMaxStage } from './ajcc_common.js';

describe('OGS Pelvis Staging Logic (AJCC 8th)', () => {
    describe('T Stage', () => {
        test('Default / empty inputs should result in T0', () => {
            const res = calculateOgsPelvisStage({});
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('Non-measurable or Not assessable should return Tx', () => {
            const res1 = calculateOgsPelvisStage({ isNonMeasurable: true });
            expect(getMaxStage(res1.t)).toBe('x');

            const res2 = calculateOgsPelvisStage({ isNotAssessable: true });
            expect(getMaxStage(res2.t)).toBe('x');
        });

        test('T0 when explicitly marked no evidence', () => {
            const res = calculateOgsPelvisStage({ isNoEvidence: true });
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('T1: 1 segment with no extraosseous extension', () => {
            // T1a: <= 8 cm
            const res1a = calculateOgsPelvisStage({
                segments: ['Iliac wing'],
                tumorSize: 6.0,
                hasExtraosseousExtension: false
            });
            expect(getMaxStage(res1a.t)).toBe('1a');

            // T1b: > 8 cm
            const res1b = calculateOgsPelvisStage({
                segments: ['Iliac wing'],
                tumorSize: 9.5,
                hasExtraosseousExtension: false
            });
            expect(getMaxStage(res1b.t)).toBe('1b');

            // No size specified falls back to base T1
            const resBase = calculateOgsPelvisStage({
                segments: ['Iliac wing'],
                hasExtraosseousExtension: false
            });
            expect(getMaxStage(resBase.t)).toBe('1');
        });

        test('T2: 1 segment WITH extraosseous extension', () => {
            const res2a = calculateOgsPelvisStage({
                segments: ['Acetabulum/periacetabulum'],
                tumorSize: 5.0,
                hasExtraosseousExtension: true
            });
            expect(getMaxStage(res2a.t)).toBe('2a');

            const res2b = calculateOgsPelvisStage({
                segments: ['Acetabulum/periacetabulum'],
                tumorSize: 11.0,
                hasExtraosseousExtension: true
            });
            expect(getMaxStage(res2b.t)).toBe('2b');
        });

        test('T2: 2 segments WITHOUT extraosseous extension', () => {
            const res2a = calculateOgsPelvisStage({
                segments: ['Iliac wing', 'Acetabulum/periacetabulum'],
                tumorSize: 8.0,
                hasExtraosseousExtension: false
            });
            expect(getMaxStage(res2a.t)).toBe('2a');

            const res2b = calculateOgsPelvisStage({
                segments: ['Iliac wing', 'Acetabulum/periacetabulum'],
                tumorSize: 10.0,
                hasExtraosseousExtension: false
            });
            expect(getMaxStage(res2b.t)).toBe('2b');
        });

        test('T3: 2 segments WITH extraosseous extension', () => {
            const res3a = calculateOgsPelvisStage({
                segments: ['Iliac wing', 'Acetabulum/periacetabulum'],
                tumorSize: 7.5,
                hasExtraosseousExtension: true
            });
            expect(getMaxStage(res3a.t)).toBe('3a');

            const res3b = calculateOgsPelvisStage({
                segments: ['Iliac wing', 'Acetabulum/periacetabulum'],
                tumorSize: 12.0,
                hasExtraosseousExtension: true
            });
            expect(getMaxStage(res3b.t)).toBe('3b');
        });

        test('T4: Spanning 3 or more segments', () => {
            const res3Segs = calculateOgsPelvisStage({
                segments: ['Sacrum', 'Pubic rami, symphysis, and ischium', 'Acetabulum/periacetabulum'],
                tumorSize: 15.0
            });
            expect(getMaxStage(res3Segs.t)).toBe('4');
        });

        test('T4: Crossing sacroiliac joint (Sacrum + Iliac wing)', () => {
            const resCrossSI = calculateOgsPelvisStage({
                segments: ['Sacrum', 'Iliac wing'],
                tumorSize: 6.0
            });
            expect(getMaxStage(resCrossSI.t)).toBe('4');
        });

        test('T4a: Sacroiliac joint involvement extending medial to sacral neuroforamen', () => {
            const res = calculateOgsPelvisStage({
                segments: ['Sacrum', 'Iliac wing'],
                invasion: { t4a: true }
            });
            expect(getMaxStage(res.t)).toBe('4a');
        });

        test('T4b: Encasement of external iliac vessels or gross thrombus in pelvic vessels', () => {
            const res = calculateOgsPelvisStage({
                segments: ['Acetabulum/periacetabulum'],
                invasion: { t4b: true }
            });
            expect(getMaxStage(res.t)).toBe('4b');
        });

        test('T4b overrides T4a and lower stages', () => {
            const res = calculateOgsPelvisStage({
                segments: ['Sacrum', 'Iliac wing'],
                invasion: { t4a: true, t4b: true }
            });
            expect(getMaxStage(res.t)).toBe('4b');
        });
    });

    describe('N Stage', () => {
        test('N0 by default', () => {
            const res = calculateOgsPelvisStage({});
            expect(getMaxStage(res.n)).toBe('0');
        });

        test('N1 when regional lymph node metastasis is present', () => {
            const res = calculateOgsPelvisStage({ nodes: { hasNodes: true } });
            expect(getMaxStage(res.n)).toBe('1');
        });
    });

    describe('M Stage', () => {
        test('M0 by default', () => {
            const res = calculateOgsPelvisStage({});
            expect(getMaxStage(res.m)).toBe('0');
        });

        test('M1a: Distant metastasis to lung only', () => {
            const res = calculateOgsPelvisStage({
                metastasis: { hasLungMetastasis: true }
            });
            expect(getMaxStage(res.m)).toBe('1a');
        });

        test('M1b: Distant metastasis to bone or other sites', () => {
            const resBone = calculateOgsPelvisStage({
                metastasis: { hasBoneMetastasis: true }
            });
            expect(getMaxStage(resBone.m)).toBe('1b');

            const resOther = calculateOgsPelvisStage({
                metastasis: { isM1b: true }
            });
            expect(getMaxStage(resOther.m)).toBe('1b');
        });

        test('M1b overrides M1a when both lung and bone/other sites are positive', () => {
            const resBoth = calculateOgsPelvisStage({
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
            expect(AJCC_T.get('1a')).toContain('≤8 cm');
            expect(AJCC_T.get('1b')).toContain('>8 cm');
            expect(AJCC_T.get('2a')).toContain('≤8 cm');
            expect(AJCC_T.get('2b')).toContain('>8 cm');
            expect(AJCC_T.get('3a')).toContain('≤8 cm');
            expect(AJCC_T.get('3b')).toContain('>8 cm');
            expect(AJCC_T.get('4a')).toContain('sacral neuroforamen');
            expect(AJCC_T.get('4b')).toContain('external iliac vessels');
        });

        test('AJCC_N and AJCC_M contain expected definitions', () => {
            expect(AJCC_N.get('1')).toContain('Regional lymph node metastasis');
            expect(AJCC_M.get('1a')).toBe('Lung');
            expect(AJCC_M.get('1b')).toContain('Bone');
        });
    });
});
