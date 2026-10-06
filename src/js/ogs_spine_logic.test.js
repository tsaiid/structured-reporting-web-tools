import {
    calculateOgsSpineStage,
    isNonAdjacentVertebralSegments,
    AJCC_T,
    AJCC_N,
    AJCC_M
} from './ogs_spine_logic.js';
import { getMaxStage } from './ajcc_common.js';

describe('OGS Spine Staging Logic (AJCC 8th)', () => {
    describe('isNonAdjacentVertebralSegments helper', () => {
        test('Returns false for 0 or 1 segment', () => {
            expect(isNonAdjacentVertebralSegments([])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Body R'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Posterior element'])).toBe(false);
        });

        test('Returns false for 2 adjacent segments', () => {
            expect(isNonAdjacentVertebralSegments(['Body R', 'Body L'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Body L', 'Pedicle L'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Pedicle L', 'Posterior element'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Posterior element', 'Pedicle R'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Pedicle R', 'Body R'])).toBe(false);
        });

        test('Returns true for 2 nonadjacent segments', () => {
            expect(isNonAdjacentVertebralSegments(['Body R', 'Pedicle L'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Body R', 'Posterior element'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Body L', 'Posterior element'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Body L', 'Pedicle R'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Pedicle R', 'Pedicle L'])).toBe(true);
        });

        test('Returns false for 3 adjacent segments', () => {
            expect(isNonAdjacentVertebralSegments(['Body R', 'Body L', 'Pedicle L'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Pedicle R', 'Body R', 'Body L'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Pedicle L', 'Posterior element', 'Pedicle R'])).toBe(false);
        });

        test('Returns true for 3 nonadjacent segments', () => {
            expect(isNonAdjacentVertebralSegments(['Body R', 'Pedicle L', 'Posterior element'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Body R', 'Body L', 'Posterior element'])).toBe(true);
            expect(isNonAdjacentVertebralSegments(['Pedicle R', 'Body L', 'Pedicle L'])).toBe(true);
        });

        test('Returns false for 4 or 5 segments (handled by segCount >= 4 rule)', () => {
            expect(isNonAdjacentVertebralSegments(['Body R', 'Body L', 'Pedicle L', 'Posterior element'])).toBe(false);
            expect(isNonAdjacentVertebralSegments(['Body R', 'Body L', 'Pedicle L', 'Posterior element', 'Pedicle R'])).toBe(false);
        });
    });

    describe('T Stage', () => {
        test('Default / empty inputs should result in T0', () => {
            const res = calculateOgsSpineStage({});
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('Non-measurable or Not assessable should return Tx', () => {
            const res1 = calculateOgsSpineStage({ isNonMeasurable: true });
            expect(getMaxStage(res1.t)).toBe('x');

            const res2 = calculateOgsSpineStage({ isNotAssessable: true });
            expect(getMaxStage(res2.t)).toBe('x');
        });

        test('T0 when explicitly marked no evidence', () => {
            const res = calculateOgsSpineStage({ isNoEvidence: true });
            expect(getMaxStage(res.t)).toBe('0');
        });

        test('T1: Confined to 1 vertebral segment or 2 adjacent segments', () => {
            const resOne = calculateOgsSpineStage({ segments: ['Body R'] });
            expect(getMaxStage(resOne.t)).toBe('1');

            const resTwoAdj = calculateOgsSpineStage({ segments: ['Body R', 'Body L'] });
            expect(getMaxStage(resTwoAdj.t)).toBe('1');
        });

        test('T2: Confined to 3 adjacent vertebral segments', () => {
            const resThreeAdj = calculateOgsSpineStage({
                segments: ['Body R', 'Body L', 'Pedicle L']
            });
            expect(getMaxStage(resThreeAdj.t)).toBe('2');
        });

        test('T3: 2 or 3 nonadjacent vertebral segments', () => {
            const resTwoNonAdj = calculateOgsSpineStage({
                segments: ['Body R', 'Pedicle L']
            });
            expect(getMaxStage(resTwoNonAdj.t)).toBe('3');

            const resThreeNonAdj = calculateOgsSpineStage({
                segments: ['Body R', 'Body L', 'Posterior element']
            });
            expect(getMaxStage(resThreeNonAdj.t)).toBe('3');
        });

        test('T3: 4 or more vertebral segments', () => {
            const resFour = calculateOgsSpineStage({
                segments: ['Body R', 'Body L', 'Pedicle L', 'Posterior element']
            });
            expect(getMaxStage(resFour.t)).toBe('3');

            const resFive = calculateOgsSpineStage({
                segments: ['Body R', 'Body L', 'Pedicle L', 'Posterior element', 'Pedicle R']
            });
            expect(getMaxStage(resFive.t)).toBe('3');
        });

        test('T4a: Extension into the spinal canal', () => {
            const res = calculateOgsSpineStage({
                segments: ['Body R'],
                invasion: { t4a: true }
            });
            expect(getMaxStage(res.t)).toBe('4a');
        });

        test('T4b: Evidence of gross vascular invasion or tumor thrombus in great vessels', () => {
            const res = calculateOgsSpineStage({
                segments: ['Body R', 'Body L', 'Pedicle L', 'Posterior element'],
                invasion: { t4b: true }
            });
            expect(getMaxStage(res.t)).toBe('4b');
        });

        test('T4b overrides T4a when both are checked', () => {
            const res = calculateOgsSpineStage({
                invasion: { t4a: true, t4b: true }
            });
            expect(getMaxStage(res.t)).toBe('4b');
        });
    });

    describe('N Stage', () => {
        test('N0 by default', () => {
            const res = calculateOgsSpineStage({});
            expect(getMaxStage(res.n)).toBe('0');
        });

        test('N1 when regional nodes are involved', () => {
            const res = calculateOgsSpineStage({ nodes: { hasNodes: true } });
            expect(getMaxStage(res.n)).toBe('1');
        });
    });

    describe('M Stage', () => {
        test('M0 by default', () => {
            const res = calculateOgsSpineStage({});
            expect(getMaxStage(res.m)).toBe('0');
        });

        test('M1a: Lung metastasis only', () => {
            const res = calculateOgsSpineStage({
                metastasis: { hasLungMetastasis: true }
            });
            expect(getMaxStage(res.m)).toBe('1a');
        });

        test('M1b: Bone or other distant metastasis', () => {
            const resBone = calculateOgsSpineStage({
                metastasis: { hasBoneMetastasis: true }
            });
            expect(getMaxStage(resBone.m)).toBe('1b');

            const resOther = calculateOgsSpineStage({
                metastasis: { isM1b: true }
            });
            expect(getMaxStage(resOther.m)).toBe('1b');
        });

        test('M1b overrides M1a when both lung and bone/other sites are positive', () => {
            const resBoth = calculateOgsSpineStage({
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
            expect(AJCC_T.get('1')).toContain('one vertebral segment');
            expect(AJCC_T.get('2')).toContain('three adjacent');
            expect(AJCC_T.get('3')).toContain('nonadjacent');
            expect(AJCC_T.get('4a')).toContain('spinal canal');
            expect(AJCC_T.get('4b')).toContain('great vessels');
        });

        test('AJCC_N and AJCC_M contain expected definitions', () => {
            expect(AJCC_N.get('1')).toContain('Regional lymph node metastasis');
            expect(AJCC_M.get('1a')).toBe('Lung');
            expect(AJCC_M.get('1b')).toContain('Bone');
        });
    });
});
