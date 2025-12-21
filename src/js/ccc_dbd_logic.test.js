import { calculate_staging } from './ccc_dbd_logic';

describe('Distal Cholangiocarcinoma (DBD) Logic', () => {
    const defaultData = {
        isMeasurable: true,
        hasInvasion: true,
        invasionDepth: 0,
        isT4: false,
        nodesCount: 0,
        hasMetastasis: false
    };

    test('Tx: Non-measurable or no invasion', () => {
        expect(calculate_staging({ ...defaultData, isMeasurable: false }).t).toContain('x');
        expect(calculate_staging({ ...defaultData, hasInvasion: false }).t).toContain('x');
    });

    test('T1: Depth < 5 mm', () => {
        const data = { ...defaultData, invasionDepth: 3 };
        expect(calculate_staging(data).t).toContain('1');
    });

    test('T2: Depth 5-12 mm', () => {
        const data = { ...defaultData, invasionDepth: 8 };
        expect(calculate_staging(data).t).toContain('2');
    });

    test('T3: Depth > 12 mm', () => {
        const data = { ...defaultData, invasionDepth: 15 };
        expect(calculate_staging(data).t).toContain('3');
    });

    test('T4: Celiac axis / SMA', () => {
        const data = { ...defaultData, isT4: true };
        expect(calculate_staging(data).t).toContain('4');
    });

    test('N Staging', () => {
        expect(calculate_staging({ ...defaultData, invasionDepth: 5, nodesCount: 2 }).n).toContain('1');
        expect(calculate_staging({ ...defaultData, invasionDepth: 5, nodesCount: 5 }).n).toContain('2');
    });

    test('M1: Distant metastasis', () => {
        expect(calculate_staging({ ...defaultData, invasionDepth: 5, hasMetastasis: true }).m).toContain('1');
    });
});
