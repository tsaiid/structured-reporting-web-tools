import { calculate_staging } from './larynx_subglottis_logic';

describe('Larynx Subglottis Logic', () => {
    // Default data template
    const defaultData = {
        hasTumor: false,
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

    test('T1: Tumor present', () => {
        const data = { ...defaultData, hasTumor: true };
        const result = calculate_staging(data);
        expect(result.t).toContain('1');
    });

    test('Tx: Non-measurable', () => {
        const data = { ...defaultData, isNonMeasurable: true };
        const result = calculate_staging(data);
        expect(result.t).toContain('x');
    });

    test('T Invasion Staging', () => {
        let data = { ...defaultData, invasion: { ...defaultData.invasion, t2: true } };
        expect(calculate_staging(data).t).toContain('2');

        data = { ...defaultData, invasion: { ...defaultData.invasion, t3: true } };
        expect(calculate_staging(data).t).toContain('3');

        data = { ...defaultData, invasion: { ...defaultData.invasion, t4a: true } };
        expect(calculate_staging(data).t).toContain('4a');

        data = { ...defaultData, invasion: { ...defaultData.invasion, t4b: true } };
        expect(calculate_staging(data).t).toContain('4b');
    });

    test('N Staging (Same as Glottis)', () => {
        // N1
        let data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, size: 2.5 } };
        expect(calculate_staging(data).n).toContain('1');

        // N2a
        data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, size: 4.0 } };
        expect(calculate_staging(data).n).toContain('2a');

        // N2b
        data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, size: 2.0, isSingle: false } };
        expect(calculate_staging(data).n).toContain('2b');

        // N2c (Bilateral)
        data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, hasRightNodes: true, hasLeftNodes: true } };
        expect(calculate_staging(data).n).toContain('2c');

        // N3a
        data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, size: 7.0 } };
        expect(calculate_staging(data).n).toContain('3a');

        // N3b (ENE)
        data = { ...defaultData, nodes: { ...defaultData.nodes, hasNodes: true, isEne: true } };
        expect(calculate_staging(data).n).toContain('3b');
    });

    test('M1: Distant Metastasis', () => {
        const data = { ...defaultData, hasMetastasis: true };
        const result = calculate_staging(data);
        expect(result.m).toContain('1');
    });
});
