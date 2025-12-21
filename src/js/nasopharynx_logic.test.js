import { calculateNasopharynxStage } from './nasopharynx_logic';

describe('Nasopharynx Logic (AJCC 9th)', () => {
    describe('calculateNasopharynxStage', () => {
        test('T4: overrides all', () => {
            const result = calculateNasopharynxStage({
                isNonMeasurable: false,
                invasion: { t1: true, t2: true, t3: true, t4: true },
                nodes: { isPositive: false, maxSize: 0, hasN3Location: false, hasENE: false, isBilateral: false, isUnilateral: false, isRPOnly: false },
                metastasis: { isPositive: false, isMoreThan3: false }
            });
            expect(result.t).toContain('4');
        });

        test('N3: Size > 6cm', () => {
            const result = calculateNasopharynxStage({
                isNonMeasurable: false,
                invasion: { t1: true, t2: false, t3: false, t4: false },
                nodes: { isPositive: true, maxSize: 6.1, hasN3Location: false, hasENE: false, isBilateral: false, isUnilateral: false, isRPOnly: false },
                metastasis: { isPositive: false, isMoreThan3: false }
            });
            expect(result.n).toContain('3');
        });

        test('N3: Advanced ENE', () => {
            const result = calculateNasopharynxStage({
                isNonMeasurable: false,
                invasion: { t1: true, t2: false, t3: false, t4: false },
                nodes: { isPositive: true, maxSize: 2.0, hasN3Location: false, hasENE: true, isBilateral: false, isUnilateral: false, isRPOnly: false },
                metastasis: { isPositive: false, isMoreThan3: false }
            });
            expect(result.n).toContain('3');
        });

        test('N2: Bilateral', () => {
            const result = calculateNasopharynxStage({
                isNonMeasurable: false,
                invasion: { t1: true, t2: false, t3: false, t4: false },
                nodes: { isPositive: true, maxSize: 2.0, hasN3Location: false, hasENE: false, isBilateral: true, isUnilateral: false, isRPOnly: false },
                metastasis: { isPositive: false, isMoreThan3: false }
            });
            expect(result.n).toContain('2');
        });

        test('M1b: > 3 lesions', () => {
            const result = calculateNasopharynxStage({
                isNonMeasurable: false,
                invasion: { t1: true, t2: false, t3: false, t4: false },
                nodes: { isPositive: false, maxSize: 0, hasN3Location: false, hasENE: false, isBilateral: false, isUnilateral: false, isRPOnly: false },
                metastasis: { isPositive: true, isMoreThan3: true }
            });
            expect(result.m).toContain('1b');
        });
    });
});
