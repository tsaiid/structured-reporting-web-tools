import { calculateProstateStage } from './prostate_logic';

describe('Prostate Logic', () => {
    describe('calculateProstateStage', () => {
        test('Tx: Not assessable', () => {
            const result = calculateProstateStage({
                isNotAssessable: true,
                isNoOrEquivocal: false,
                tumorSize: 0,
                invasion: { prostateInvasionType: '', t3a: false, t3b: false, t4: false },
                hasNodes: false,
                metastasis: { m1a: false, m1b: false, m1c: false }
            });
            expect(result.t).toEqual(['x']);
        });

        test('T0: No or equivocal', () => {
            const result = calculateProstateStage({
                isNotAssessable: false,
                isNoOrEquivocal: true,
                tumorSize: 0,
                invasion: { prostateInvasionType: '', t3a: false, t3b: false, t4: false },
                hasNodes: false,
                metastasis: { m1a: false, m1b: false, m1c: false }
            });
            expect(result.t).toEqual(['0']);
        });

        test('T2c and T4 invasion', () => {
            const result = calculateProstateStage({
                isNotAssessable: false,
                isNoOrEquivocal: false,
                tumorSize: 2.5,
                invasion: { 
                    prostateInvasionType: 'Involves both lobes', 
                    t3a: false, t3b: false, t4: true 
                },
                hasNodes: false,
                metastasis: { m1a: false, m1b: false, m1c: false }
            });
            expect(result.t).toContain('2c');
            expect(result.t).toContain('4');
        });

        test('N1: Nodes present', () => {
            const result = calculateProstateStage({
                isNotAssessable: false,
                isNoOrEquivocal: false,
                tumorSize: 2.5,
                invasion: { prostateInvasionType: '', t3a: false, t3b: false, t4: false },
                hasNodes: true,
                metastasis: { m1a: false, m1b: false, m1c: false }
            });
            expect(result.n).toContain('1');
        });

        test('M1b and M1c metastasis', () => {
            const result = calculateProstateStage({
                isNotAssessable: false,
                isNoOrEquivocal: false,
                tumorSize: 2.5,
                invasion: { prostateInvasionType: '', t3a: false, t3b: false, t4: false },
                hasNodes: false,
                metastasis: { m1a: false, m1b: true, m1c: true }
            });
            expect(result.m).toContain('1b');
            expect(result.m).toContain('1c');
        });
    });
});
