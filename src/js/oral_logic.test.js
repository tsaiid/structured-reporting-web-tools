import { calculateOralStage } from './oral_logic';

describe('Oral Logic', () => {
    describe('calculateOralStage', () => {
        test('T4b: overrides all', () => {
            const result = calculateOralStage({
                tumorSize: 1.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: false,
                isOral: true,
                invasion: { lipT4a: false, oralT4a: false, t4b: true },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4b');
        });

        test('T4a (Oral): bone invasion', () => {
            const result = calculateOralStage({
                tumorSize: 3.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: false,
                isOral: true,
                invasion: { lipT4a: false, oralT4a: true, t4b: false },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.t).toContain('4a');
        });

        test('N3b: ENE present', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: true, nodeSize: 2.0, hasENE: true, isSingleNode: true, isBilateralOrContralateral: false },
                hasMetastasis: false
            });
            expect(result.n).toContain('3b');
        });

        test('N2c: Bilateral nodes', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: true, nodeSize: 2.0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: true },
                hasMetastasis: false
            });
            expect(result.n).toContain('2c');
        });

        test('M1: Metastasis', () => {
            const result = calculateOralStage({
                tumorSize: 2.0,
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: true,
                isOral: false,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: true
            });
            expect(result.m).toContain('1');
        });

        describe('T category by Size & Depth of Invasion (DOI)', () => {
            const baseData = {
                isNotAssessable: false,
                isNoEvidence: false,
                hasTumorLocation: true,
                isLip: false,
                isOral: true,
                invasion: { lipT4a: false, oralT4a: false, t4b: false },
                nodes: { hasNodes: false, nodeSize: 0, hasENE: false, isSingleNode: false, isBilateralOrContralateral: false },
                hasMetastasis: false
            };

            test('T1: size <= 2 cm and DOI <= 5 mm', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 1.5, depthOfInvasion: 4.0 });
                expect(result.t).toContain('1');
                expect(result.t).not.toContain('2');
                expect(result.t).not.toContain('3');
            });

            test('T1: size <= 2 cm and DOI undefined (fallback)', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 1.8 });
                expect(result.t).toContain('1');
            });

            test('T2: size <= 2 cm upstaged by DOI > 5 mm and <= 10 mm', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 1.5, depthOfInvasion: 8.0 });
                expect(result.t).toContain('2');
                expect(result.t).not.toContain('1');
            });

            test('T3: size <= 2 cm upstaged by DOI > 10 mm', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 1.5, depthOfInvasion: 12.0 });
                expect(result.t).toContain('3');
                expect(result.t).not.toContain('1');
            });

            test('T2: size 2-4 cm with DOI <= 10 mm', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 3.0, depthOfInvasion: 5.0 });
                expect(result.t).toContain('2');
            });

            test('T2: size 2-4 cm with DOI undefined (fallback)', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 3.5 });
                expect(result.t).toContain('2');
            });

            test('T3: size 2-4 cm upstaged by DOI > 10 mm', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 3.0, depthOfInvasion: 11.0 });
                expect(result.t).toContain('3');
                expect(result.t).not.toContain('2');
            });

            test('T3: size > 4 cm even with small DOI', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 4.5, depthOfInvasion: 2.0 });
                expect(result.t).toContain('3');
            });

            test('T3: size > 4 cm with DOI undefined', () => {
                const result = calculateOralStage({ ...baseData, tumorSize: 5.0 });
                expect(result.t).toContain('3');
            });
        });
    });
});
