import { calculate_staging } from './ccc_pbd_logic';

describe('Perihilar Cholangiocarcinoma (PBD) Logic', () => {
    const defaultData = {
        tumorSize: 0,
        isNonMeasurable: false,
        isT0: false,
        isT1: false,
        isT2a: false,
        isT2b: false,
        isT3: false,
        isT4: false,
        nodesCount: 0,
        hasMetastasis: false
    };

    test('T0: No evidence of primary tumor', () => {
        const data = { ...defaultData, isT0: true };
        const result = calculate_staging(data);
        expect(result.t).toContain('0');
    });

    test('Tx: Non-measurable or no size', () => {
        const data1 = { ...defaultData, isNonMeasurable: true };
        expect(calculate_staging(data1).t).toContain('x');
    });

    test('T1: Confined to bile duct', () => {
        const data = { ...defaultData, tumorSize: 1.0, isT1: true };
        expect(calculate_staging(data).t).toContain('1');
    });

    test('T2a: Adipose tissue invasion', () => {
        const data = { ...defaultData, tumorSize: 1.0, isT2a: true };
        expect(calculate_staging(data).t).toContain('2a');
    });

    test('T2b: Hepatic parenchyma invasion', () => {
        const data = { ...defaultData, tumorSize: 1.0, isT2b: true };
        expect(calculate_staging(data).t).toContain('2b');
    });

    test('T3: Unilateral vascular branches', () => {
        const data = { ...defaultData, tumorSize: 1.0, isT3: true };
        expect(calculate_staging(data).t).toContain('3');
    });

    test('T4: Advanced invasion', () => {
        const data = { ...defaultData, tumorSize: 1.0, isT4: true };
        expect(calculate_staging(data).t).toContain('4');
    });

    test('N Staging', () => {
        // N1: 1-3 nodes
        expect(calculate_staging({ ...defaultData, tumorSize: 1.0, nodesCount: 2 }).n).toContain('1');
        // N2: 4+ nodes
        expect(calculate_staging({ ...defaultData, tumorSize: 1.0, nodesCount: 5 }).n).toContain('2');
    });

    test('M1: Distant metastasis', () => {
        expect(calculate_staging({ ...defaultData, tumorSize: 1.0, hasMetastasis: true }).m).toContain('1');
    });
});
