import { calculate_staging } from './ccc_ibd_logic';

describe('Intrahepatic Cholangiocarcinoma (IBD) Logic', () => {
    const defaultData = {
        tumorSize: 0,
        isNonMeasurable: false,
        isT0: false,
        isT2: false,
        isT3: false,
        isT4: false,
        isMultiple: false,
        hasRegionalNodes: false,
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

        const data2 = { ...defaultData, tumorSize: 0 };
        expect(calculate_staging(data2).t).toContain('x');
    });

    test('T1a: Solitary <= 5cm', () => {
        const data = { ...defaultData, tumorSize: 3.0, isMultiple: false };
        const result = calculate_staging(data);
        expect(result.t).toContain('1');
        expect(result.t).toContain('1a');
    });

    test('T1b: Solitary > 5cm', () => {
        const data = { ...defaultData, tumorSize: 6.0, isMultiple: false };
        const result = calculate_staging(data);
        expect(result.t).toContain('1');
        expect(result.t).toContain('1b');
    });

    test('T2: Vascular invasion or Multiple', () => {
        const data1 = { ...defaultData, tumorSize: 3.0, isT2: true };
        expect(calculate_staging(data1).t).toContain('2');

        const data2 = { ...defaultData, tumorSize: 3.0, isMultiple: true };
        expect(calculate_staging(data2).t).toContain('2');
    });

    test('T3: Peritoneum perforation', () => {
        const data = { ...defaultData, tumorSize: 3.0, isT3: true };
        expect(calculate_staging(data).t).toContain('3');
    });

    test('T4: Extrahepatic structures', () => {
        const data = { ...defaultData, tumorSize: 3.0, isT4: true };
        expect(calculate_staging(data).t).toContain('4');
    });

    test('N1: Regional nodes', () => {
        const data = { ...defaultData, tumorSize: 3.0, hasRegionalNodes: true };
        expect(calculate_staging(data).n).toContain('1');
    });

    test('M1: Distant metastasis', () => {
        const data = { ...defaultData, tumorSize: 3.0, hasMetastasis: true };
        expect(calculate_staging(data).m).toContain('1');
    });
});
