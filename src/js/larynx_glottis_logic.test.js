import { calculate_staging } from './larynx_glottis_logic';

describe('Larynx Glottis Logic', () => {
    // Default data template
    const defaultData = {
        hasTumor: false,
        lateralityCount: 0,
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

    test('T1a: Tumor present, single laterality', () => {
        const data = { ...defaultData, hasTumor: true, lateralityCount: 1 };
        const result = calculate_staging(data);
        expect(result.t).toContain('1a');
        expect(result.t).not.toContain('1b');
    });

    test('T1b: Tumor present, multiple lateralities', () => {
        const data = { ...defaultData, hasTumor: true, lateralityCount: 2 };
        const result = calculate_staging(data);
        expect(result.t).toContain('1b');
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

    test('N1: Single node < 3cm', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, size: 2.5, isSingle: true } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('1');
    });

    test('N2a: Single node 3-6cm', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, size: 4.5, isSingle: true } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('2a');
    });

    test('N2b: Multiple nodes', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, size: 2.0, isSingle: false } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('2b');
    });

    test('N2c: Bilateral nodes', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, hasRightNodes: true, hasLeftNodes: true, size: 2.0 } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('2c');
    });

    test('N2c: Contralateral nodes (Right Tumor, Left Nodes)', () => {
        const data = { 
            ...defaultData, 
            tumorSide: { isRight: true, isLeft: false },
            nodes: { ...defaultData.nodes, hasNodes: true, hasRightNodes: false, hasLeftNodes: true, size: 2.0 } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('2c');
    });

    test('N3a: Node > 6cm', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, size: 7.0 } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('3a');
    });

    test('N3b: ENE positive', () => {
        const data = { 
            ...defaultData, 
            nodes: { ...defaultData.nodes, hasNodes: true, size: 2.0, isEne: true } 
        };
        const result = calculate_staging(data);
        expect(result.n).toContain('3b');
    });

    test('M1: Distant Metastasis', () => {
        const data = { ...defaultData, hasMetastasis: true };
        const result = calculate_staging(data);
        expect(result.m).toContain('1');
    });
});
