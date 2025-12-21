import { calculateEsophagusStage } from './esophagus_logic';

describe('Esophagus Logic', () => {
    describe('calculateEsophagusStage', () => {
        test('Tx: No invasion, no measurable tumor', () => {
            const result = calculateEsophagusStage({
                hasInvasion: false,
                hasNoMeasurableTumor: true,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['x']);
        });

        test('T1: No invasion, measurable tumor', () => {
            const result = calculateEsophagusStage({
                hasInvasion: false,
                hasNoMeasurableTumor: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toEqual(['1']);
        });

        test('T4b: Invasion present', () => {
            const result = calculateEsophagusStage({
                hasInvasion: true,
                hasNoMeasurableTumor: false,
                invasion: { t4b: true, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                hasMetastasis: false
            });
            expect(result.t).toContain('4b');
        });

        test('N3: >= 7 nodes', () => {
            const result = calculateEsophagusStage({
                hasInvasion: false,
                hasNoMeasurableTumor: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 7,
                hasMetastasis: false
            });
            expect(result.n).toContain('3');
        });

        test('N2: 3-6 nodes', () => {
            const result = calculateEsophagusStage({
                hasInvasion: false,
                hasNoMeasurableTumor: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 3,
                hasMetastasis: false
            });
            expect(result.n).toContain('2');
        });

        test('M1: Metastasis', () => {
            const result = calculateEsophagusStage({
                hasInvasion: false,
                hasNoMeasurableTumor: false,
                invasion: { t4b: false, t4a: false, t3: false, t2: false },
                nodesCount: 0,
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });
    });
});
