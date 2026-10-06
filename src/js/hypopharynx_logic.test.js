import { calculateHypopharynxStage, calculate_staging } from './hypopharynx_logic';
import { getMaxStage } from './ajcc_common';

describe('Hypopharynx Logic (AJCC 8th)', () => {
    // 預設資料範本 (Default data template)
    const defaultData = {
        isNotAssessable: false,
        isNoEvidence: false,
        hasTumorLocation: false,
        subsiteCount: 0,
        tumorSize: 0,
        invasion: {
            t3: false,
            t4a: false,
            t4b: false
        },
        nodes: {
            hasNodes: false,
            hasRightNodes: false,
            hasLeftNodes: false,
            isEne: false,
            size: 0,
            isSingle: true
        },
        tumorSide: {
            isRight: false,
            isLeft: false
        },
        hasMetastasis: false
    };

    describe('calculateHypopharynxStage 基本分期', () => {
        test('Default (T0, N0, M0)', () => {
            const result = calculateHypopharynxStage(defaultData);
            expect(result.t).toContain('0');
            expect(result.n).toContain('0');
            expect(result.m).toContain('0');
            expect(getMaxStage(result.t)).toBe('0');
            expect(getMaxStage(result.n)).toBe('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('別名 calculate_staging 函式應能正常呼叫', () => {
            const result = calculate_staging(defaultData);
            expect(result.t).toContain('0');
        });

        test('空參數預設防禦', () => {
            const result = calculateHypopharynxStage();
            expect(result.t).toContain('0');
            expect(result.n).toContain('0');
            expect(result.m).toContain('0');
        });
    });

    describe('Primary Tumor (T Category)', () => {
        test('Tx: 原發腫瘤無法評估 (Not assessable)', () => {
            const data = { ...defaultData, isNotAssessable: true };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('x');
            expect(getMaxStage(result.t)).toBe('x');
        });

        test('T0: 無原發腫瘤證據 (No evidence of primary tumor)', () => {
            const data = { ...defaultData, isNoEvidence: true };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('0');
            expect(getMaxStage(result.t)).toBe('0');
        });

        test('T1: 單一次部位且腫瘤 <= 2 cm', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 1.5
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('1');
            expect(result.t).not.toContain('2');
            expect(getMaxStage(result.t)).toBe('1');
        });

        test('T1: 邊界測試 2.0 cm', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 2.0
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('1');
            expect(getMaxStage(result.t)).toBe('1');
        });

        test('T2: 單一次部位但腫瘤 > 2 cm 且 <= 4 cm', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 3.0
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('2');
            expect(getMaxStage(result.t)).toBe('2');
        });

        test('T2: 侵犯多於一個次部位 (subsiteCount > 1)，即使大小 <= 2 cm', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 2,
                tumorSize: 1.5
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('2');
            expect(getMaxStage(result.t)).toBe('2');
        });

        test('T3: 腫瘤 > 4 cm', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 4.5
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('3');
            expect(getMaxStage(result.t)).toBe('3');
        });

        test('T3: 局部侵犯 (Fixation of hemilarynx / extension to esophageal mucosa)', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 1.8,
                invasion: { ...defaultData.invasion, t3: true }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('3');
            expect(getMaxStage(result.t)).toBe('3');
        });

        test('T4a: 中度晚期侵犯 (Thyroid/cricoid cartilage, hyoid bone, thyroid gland, soft tissue)', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 2.5,
                invasion: { ...defaultData.invasion, t4a: true }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('4a');
            expect(getMaxStage(result.t)).toBe('4a');
        });

        test('T4b: 極度晚期侵犯 (Prevertebral fascia, carotid artery encasement, mediastinum)', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 2,
                tumorSize: 5.0,
                invasion: { ...defaultData.invasion, t4a: true, t4b: true }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('4b');
            expect(getMaxStage(result.t)).toBe('4b');
        });

        test('T4a: 未勾選 subsite 但有記錄 T4a 侵犯時不應遺漏', () => {
            const data = {
                ...defaultData,
                hasTumorLocation: false,
                invasion: { ...defaultData.invasion, t4a: true }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.t).toContain('4a');
            expect(getMaxStage(result.t)).toBe('4a');
        });
    });

    describe('Regional Lymph Nodes (N Category)', () => {
        test('N0: 無淋巴結轉移', () => {
            const data = {
                ...defaultData,
                nodes: { ...defaultData.nodes, hasNodes: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('0');
            expect(getMaxStage(result.n)).toBe('0');
        });

        test('N1: 單一同側淋巴結 <= 3 cm 且 ENE(-)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: false,
                    size: 2.5,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('1');
            expect(getMaxStage(result.n)).toBe('1');
        });

        test('N2a: 單一同側淋巴結 > 3 cm 但 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: false,
                    size: 4.5,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('2a');
            expect(getMaxStage(result.n)).toBe('2a');
        });

        test('N2b: 多發同側淋巴結 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: false,
                    size: 2.5,
                    isSingle: false
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('2b');
            expect(getMaxStage(result.n)).toBe('2b');
        });

        test('N2c: 雙側頸部淋巴結轉移 (Bilateral nodes)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: true,
                    isEne: false,
                    size: 3.0,
                    isSingle: false
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('2c');
            expect(getMaxStage(result.n)).toBe('2c');
        });

        test('N2c: 對側頸部淋巴結轉移 (腫瘤在右，淋巴結在左)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: false,
                    hasLeftNodes: true,
                    isEne: false,
                    size: 2.0,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('2c');
            expect(getMaxStage(result.n)).toBe('2c');
        });

        test('N2c: 對側頸部淋巴結轉移 (腫瘤在左，淋巴結在右)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: false,
                    size: 2.0,
                    isSingle: true
                },
                tumorSide: { isRight: false, isLeft: true }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('2c');
            expect(getMaxStage(result.n)).toBe('2c');
        });

        test('N3a: 淋巴結 > 6 cm 且 ENE(-)', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: false,
                    size: 6.8,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('3a');
            expect(getMaxStage(result.n)).toBe('3a');
        });

        test('N3b: 具被膜外侵犯 ENE(+)，即使小於 3 cm', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    isEne: true,
                    size: 1.5,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('3b');
            expect(getMaxStage(result.n)).toBe('3b');
        });

        test('別名相容性測試: hasENE, nodeSize, isSingleNode', () => {
            const data = {
                ...defaultData,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    hasENE: true,
                    nodeSize: 2.0,
                    isSingleNode: true
                }
            };
            const result = calculateHypopharynxStage(data);
            expect(result.n).toContain('3b');
            expect(getMaxStage(result.n)).toBe('3b');
        });
    });

    describe('Distant Metastasis (M Category)', () => {
        test('M0: 無遠端轉移', () => {
            const data = { ...defaultData, hasMetastasis: false };
            const result = calculateHypopharynxStage(data);
            expect(result.m).toContain('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('M1: 遠端轉移', () => {
            const data = { ...defaultData, hasMetastasis: true };
            const result = calculateHypopharynxStage(data);
            expect(result.m).toContain('1');
            expect(getMaxStage(result.m)).toBe('1');
        });
    });

    describe('綜合臨床案例驗證 (Composite Clinical Cases)', () => {
        test('典型案例一：早期下咽癌 (T1N0M0)', () => {
            const result = calculateHypopharynxStage({
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 1.8
            });
            expect(getMaxStage(result.t)).toBe('1');
            expect(getMaxStage(result.n)).toBe('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('典型案例二：局部侵犯伴隨對側轉移與遠端轉移 (T4aN2cM1)', () => {
            const result = calculateHypopharynxStage({
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 2,
                tumorSize: 3.5,
                invasion: { t3: false, t4a: true, t4b: false },
                nodes: {
                    hasNodes: true,
                    hasRightNodes: false,
                    hasLeftNodes: true,
                    isEne: false,
                    size: 2.8,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false },
                hasMetastasis: true
            });
            expect(getMaxStage(result.t)).toBe('4a');
            expect(getMaxStage(result.n)).toBe('2c');
            expect(getMaxStage(result.m)).toBe('1');
        });

        test('典型案例三：極晚期包埋頸動脈與 ENE(+) (T4bN3bM0)', () => {
            const result = calculateHypopharynxStage({
                ...defaultData,
                hasTumorLocation: true,
                subsiteCount: 1,
                tumorSize: 4.2,
                invasion: { t3: true, t4a: true, t4b: true },
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: true,
                    isEne: true,
                    size: 5.5,
                    isSingle: false
                },
                tumorSide: { isRight: true, isLeft: false },
                hasMetastasis: false
            });
            expect(getMaxStage(result.t)).toBe('4b');
            expect(getMaxStage(result.n)).toBe('3b');
            expect(getMaxStage(result.m)).toBe('0');
        });
    });
});
