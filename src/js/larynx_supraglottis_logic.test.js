import { calculate_staging } from './larynx_supraglottis_logic';

describe('Larynx Supraglottis Logic', () => {
    // Default data template
    const defaultData = {
        hasTumor: false,
        subsiteCount: 0,
        isNonMeasurable: false,
        invasion: { t2: false, t3: false, t4a: false, t4b: false },
        nodes: {
            hasNodes: false,
            hasRightNodes: false,
            hasLeftNodes: false,
            isEne: false,
            size: 0,
            isSingle: true
        },
        tumorSide: { isRight: false, isLeft: false },
        hasMetastasis: false
    };

    test('Default (T0, N0, M0)', () => {
        const result = calculate_staging(defaultData);
        expect(result.t).toContain('0');
        expect(result.n).toContain('0');
        expect(result.m).toContain('0');
    });

    test('T1: Single subsite', () => {
        const data = { ...defaultData, hasTumor: true, subsiteCount: 1 };
        const result = calculate_staging(data);
        expect(result.t).toContain('1');
        expect(result.t).not.toContain('2');
    });

    test('T2: Multiple subsites', () => {
        const data = { ...defaultData, hasTumor: true, subsiteCount: 2 };
        const result = calculate_staging(data);
        expect(result.t).toContain('2');
    });

    test('Tx: Non-measurable', () => {
        const data = { ...defaultData, isNonMeasurable: true };
        const result = calculate_staging(data);
        expect(result.t).toContain('x');
    });

    test('T Invasion Staging', () => {
        let data = { ...defaultData, invasion: { ...defaultData.invasion, t3: true } };
        expect(calculate_staging(data).t).toContain('3');

        data = { ...defaultData, invasion: { ...defaultData.invasion, t4a: true } };
        expect(calculate_staging(data).t).toContain('4a');
    });

    test('N Staging (Same as Glottis)', () => {
        // N2c (Bilateral)
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, hasRightNodes: true, hasLeftNodes: true } 
        };
        expect(calculate_staging(data).n).toContain('2c');
    });

    test('M1: Distant Metastasis', () => {
        const data = { ...defaultData, hasMetastasis: true };
        const result = calculate_staging(data);
        expect(result.m).toContain('1');
    });
});
