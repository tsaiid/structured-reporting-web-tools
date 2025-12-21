import { calculateEndometriumStage } from './endometrium_logic';

describe('Endometrium Logic', () => {
    describe('calculateEndometriumStage', () => {
        test('Tx: Not assessable and no invasion', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: true,
                invasion: { t4: false, t3b: false, t3a: false, t2: false, t1b: false, t1a: false },
                nodes: { hasParaaortic: false, hasRegional: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('x');
        });

        test('T4: overrides everything', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: true, // User checked this but also checked T4
                invasion: { t4: true, t3b: false, t3a: false, t2: false, t1b: false, t1a: false },
                nodes: { hasParaaortic: false, hasRegional: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4');
        });

        test('T1b: deep myometrial invasion', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2: false, t1b: true, t1a: false },
                nodes: { hasParaaortic: false, hasRegional: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('1b');
        });

        test('N2: Paraaortic nodes', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2: false, t1b: false, t1a: false },
                nodes: { hasParaaortic: true, hasRegional: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('N1: Pelvic nodes only', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2: false, t1b: false, t1a: false },
                nodes: { hasParaaortic: false, hasRegional: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('1');
        });

        test('M1: Metastasis', () => {
            const result = calculateEndometriumStage({
                isNotAssessable: false,
                invasion: { t4: false, t3b: false, t3a: false, t2: false, t1b: false, t1a: false },
                nodes: { hasParaaortic: false, hasRegional: false },
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
