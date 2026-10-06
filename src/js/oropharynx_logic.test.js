import {
    calculateOropharynxStage,
    calculate_staging,
    AJCC_T_HPV,
    AJCC_T_NONHPV,
    AJCC_N_HPV,
    AJCC_N_NONHPV,
    AJCC_M
} from './oropharynx_logic';
import { getMaxStage } from './ajcc_common';

describe('Oropharynx Logic (AJCC 8th)', () => {
    // 預設資料範本 (Default data template)
    const createDefaultData = (isHpv = false) => ({
        isHpv,
        isNotAssessable: false,
        isNoEvidence: false,
        hasTumorLocation: false,
        tumorSize: 0,
        invasion: {
            t3: false,
            t4: false,
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
    });

    describe('基本分期與函式介面防禦', () => {
        test('Default Non-HPV (T0, N0, M0)', () => {
            const result = calculateOropharynxStage(createDefaultData(false));
            expect(result.t).toContain('0');
            expect(result.n).toContain('0');
            expect(result.m).toContain('0');
            expect(getMaxStage(result.t)).toBe('0');
            expect(getMaxStage(result.n)).toBe('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('Default HPV(+) (T0, N0, M0)', () => {
            const result = calculateOropharynxStage(createDefaultData(true));
            expect(result.t).toContain('0');
            expect(result.n).toContain('0');
            expect(result.m).toContain('0');
            expect(getMaxStage(result.t)).toBe('0');
            expect(getMaxStage(result.n)).toBe('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('別名 calculate_staging 函式應能正常呼叫', () => {
            const result = calculate_staging(createDefaultData(true));
            expect(result.t).toContain('0');
        });

        test('空參數預設防禦', () => {
            const result = calculateOropharynxStage();
            expect(result.t).toContain('0');
            expect(result.n).toContain('0');
            expect(result.m).toContain('0');
        });

        test('AJCC 定義 Map 包含必要分期代碼', () => {
            expect(AJCC_T_HPV.has('4')).toBe(true);
            expect(AJCC_T_NONHPV.has('4a')).toBe(true);
            expect(AJCC_T_NONHPV.has('4b')).toBe(true);
            expect(AJCC_N_HPV.has('1')).toBe(true);
            expect(AJCC_N_HPV.has('2')).toBe(true);
            expect(AJCC_N_HPV.has('3')).toBe(true);
            expect(AJCC_N_NONHPV.has('2a')).toBe(true);
            expect(AJCC_N_NONHPV.has('2b')).toBe(true);
            expect(AJCC_N_NONHPV.has('2c')).toBe(true);
            expect(AJCC_N_NONHPV.has('3a')).toBe(true);
            expect(AJCC_N_NONHPV.has('3b')).toBe(true);
            expect(AJCC_M.has('0')).toBe(true);
            expect(AJCC_M.has('1')).toBe(true);
        });
    });

    describe('HPV(+) 原發腫瘤 (T Category - HPV-Mediated)', () => {
        const hpvBase = () => createDefaultData(true);

        test('Tx: 原發腫瘤無法評估', () => {
            const data = { ...hpvBase(), isNotAssessable: true };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('x');
            expect(getMaxStage(result.t)).toBe('x');
        });

        test('T0: 無原發腫瘤證據', () => {
            const data = { ...hpvBase(), isNoEvidence: true };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('0');
            expect(getMaxStage(result.t)).toBe('0');
        });

        test('T1: 腫瘤 <= 2 cm (1.5 cm)', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 1.5
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('1');
            expect(getMaxStage(result.t)).toBe('1');
        });

        test('T1: 臨界值 2.0 cm', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 2.0
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('1');
            expect(getMaxStage(result.t)).toBe('1');
        });

        test('T2: 腫瘤 > 2 cm 且 <= 4 cm (3.2 cm)', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 3.2
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('2');
            expect(getMaxStage(result.t)).toBe('2');
        });

        test('T2: 臨界值 4.0 cm', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 4.0
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('2');
            expect(getMaxStage(result.t)).toBe('2');
        });

        test('T3: 腫瘤 > 4 cm (4.5 cm)', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 4.5
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('3');
            expect(getMaxStage(result.t)).toBe('3');
        });

        test('T3: 侵犯會厭舌側面 (Extension to lingual surface of epiglottis)', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 1.5,
                invasion: { ...hpvBase().invasion, t3: true }
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('3');
            expect(getMaxStage(result.t)).toBe('3');
        });

        test('T4: HPV(+) 局部侵犯統一歸為 T4 (不細分 4a/4b)', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 2.5,
                invasion: { ...hpvBase().invasion, t4a: true }
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('4');
            expect(result.t).not.toContain('4a');
            expect(getMaxStage(result.t)).toBe('4');
        });

        test('T4: HPV(+) 即使侵犯 t4b 亦輸出 T4', () => {
            const data = {
                ...hpvBase(),
                hasTumorLocation: true,
                tumorSize: 3.0,
                invasion: { ...hpvBase().invasion, t4b: true }
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('4');
            expect(result.t).not.toContain('4b');
            expect(getMaxStage(result.t)).toBe('4');
        });
    });

    describe('Non-HPV (p16-) 原發腫瘤 (T Category)', () => {
        const nonHpvBase = () => createDefaultData(false);

        test('T1: 腫瘤 <= 2 cm', () => {
            const data = {
                ...nonHpvBase(),
                hasTumorLocation: true,
                tumorSize: 1.8
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('1');
            expect(getMaxStage(result.t)).toBe('1');
        });

        test('T2: 腫瘤 > 2 cm 且 <= 4 cm', () => {
            const data = {
                ...nonHpvBase(),
                hasTumorLocation: true,
                tumorSize: 3.5
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('2');
            expect(getMaxStage(result.t)).toBe('2');
        });

        test('T3: 腫瘤 > 4 cm', () => {
            const data = {
                ...nonHpvBase(),
                hasTumorLocation: true,
                tumorSize: 4.8
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('3');
            expect(getMaxStage(result.t)).toBe('3');
        });

        test('T4a: 中度晚期侵犯 (喉部、舌外在肌、內翼肌、硬顎、下顎骨)', () => {
            const data = {
                ...nonHpvBase(),
                hasTumorLocation: true,
                tumorSize: 2.0,
                invasion: { ...nonHpvBase().invasion, t4a: true }
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('4a');
            expect(getMaxStage(result.t)).toBe('4a');
        });

        test('T4b: 極度晚期侵犯 (外翼肌、翼板、鼻咽外側、顱底、頸動脈包埋)', () => {
            const data = {
                ...nonHpvBase(),
                hasTumorLocation: true,
                tumorSize: 2.0,
                invasion: { ...nonHpvBase().invasion, t4a: true, t4b: true }
            };
            const result = calculateOropharynxStage(data);
            expect(result.t).toContain('4b');
            expect(getMaxStage(result.t)).toBe('4b');
        });
    });

    describe('HPV(+) 區域淋巴結 (N Category - HPV-Mediated)', () => {
        const hpvBase = () => createDefaultData(true);

        test('N0: 無淋巴結轉移', () => {
            const data = {
                ...hpvBase(),
                nodes: { ...hpvBase().nodes, hasNodes: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('0');
            expect(getMaxStage(result.n)).toBe('0');
        });

        test('N1: 單一同側淋巴結 <= 6 cm (3.0 cm)', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 3.0,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('1');
            expect(getMaxStage(result.n)).toBe('1');
        });

        test('N1: 多發同側淋巴結 <= 6 cm (在 HPV(+) 仍為 N1，與 Non-HPV 之 N2b 不同)', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 4.5,
                    isSingle: false // 多顆
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('1');
            expect(getMaxStage(result.n)).toBe('1');
        });

        test('N1: HPV(+) 具 ENE(+) 同側淋巴結 <= 6 cm (臨床分期仍為 N1)', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 2.5,
                    isEne: true,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('1');
            expect(getMaxStage(result.n)).toBe('1');
        });

        test('N2: 對側淋巴結轉移 <= 6 cm (右側腫瘤，左側淋巴結)', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: false,
                    hasLeftNodes: true,
                    size: 3.5,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2');
            expect(getMaxStage(result.n)).toBe('2');
        });

        test('N2: 雙側淋巴結轉移 <= 6 cm', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: true,
                    size: 4.0,
                    isSingle: false
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2');
            expect(getMaxStage(result.n)).toBe('2');
        });

        test('N3: 淋巴結長徑 > 6 cm (不論側性與顆數)', () => {
            const data = {
                ...hpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 6.8,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('3');
            expect(getMaxStage(result.n)).toBe('3');
        });
    });

    describe('Non-HPV (p16-) 區域淋巴結 (N Category)', () => {
        const nonHpvBase = () => createDefaultData(false);

        test('N0: 無淋巴結轉移', () => {
            const data = {
                ...nonHpvBase(),
                nodes: { ...nonHpvBase().nodes, hasNodes: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('0');
            expect(getMaxStage(result.n)).toBe('0');
        });

        test('N1: 單一同側淋巴結 <= 3 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 2.2,
                    isEne: false,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('1');
            expect(getMaxStage(result.n)).toBe('1');
        });

        test('N2a: 單一同側淋巴結 > 3 cm 且 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 4.0,
                    isEne: false,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2a');
            expect(getMaxStage(result.n)).toBe('2a');
        });

        test('N2b: 多發同側淋巴結 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 2.5,
                    isEne: false,
                    isSingle: false // 多發
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2b');
            expect(getMaxStage(result.n)).toBe('2b');
        });

        test('N2c: 雙側淋巴結 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: true,
                    size: 3.5,
                    isEne: false,
                    isSingle: false
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2c');
            expect(getMaxStage(result.n)).toBe('2c');
        });

        test('N2c: 對側淋巴結 <= 6 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: false,
                    hasLeftNodes: true,
                    size: 2.0,
                    isEne: false,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('2c');
            expect(getMaxStage(result.n)).toBe('2c');
        });

        test('N3a: 淋巴結 > 6 cm 且 ENE(-)', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 7.0,
                    isEne: false,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('3a');
            expect(getMaxStage(result.n)).toBe('3a');
        });

        test('N3b: 具被膜外侵犯 ENE(+)，即使單顆 <= 3 cm', () => {
            const data = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 1.8,
                    isEne: true,
                    isSingle: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            const result = calculateOropharynxStage(data);
            expect(result.n).toContain('3b');
            expect(getMaxStage(result.n)).toBe('3b');
        });

        test('別名相容性測試: hasENE, nodeSize, isSingleNode, isMultiple', () => {
            const data1 = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    hasENE: true,
                    nodeSize: 2.0,
                    isSingleNode: true
                }
            };
            expect(calculateOropharynxStage(data1).n).toContain('3b');

            const data2 = {
                ...nonHpvBase(),
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    hasENE: false,
                    nodeSize: 2.0,
                    isMultiple: true
                },
                tumorSide: { isRight: true, isLeft: false }
            };
            expect(calculateOropharynxStage(data2).n).toContain('2b');
        });
    });

    describe('遠端轉移 (M Category)', () => {
        test('M0: 無遠端轉移', () => {
            const data = { ...createDefaultData(), hasMetastasis: false };
            const result = calculateOropharynxStage(data);
            expect(result.m).toContain('0');
            expect(getMaxStage(result.m)).toBe('0');
        });

        test('M1: 遠端轉移', () => {
            const data = { ...createDefaultData(), hasMetastasis: true };
            const result = calculateOropharynxStage(data);
            expect(result.m).toContain('1');
            expect(getMaxStage(result.m)).toBe('1');
        });
    });

    describe('HPV(+) 與 Non-HPV 關鍵臨床差異比對案例 (Comparative Clinical Cases)', () => {
        test('案例一：早期病灶 (T1N0M0) 在兩種系統皆相同', () => {
            const baseInput = {
                hasTumorLocation: true,
                tumorSize: 1.5,
                nodes: { hasNodes: false },
                hasMetastasis: false
            };
            const hpvRes = calculateOropharynxStage({ ...baseInput, isHpv: true });
            const nonHpvRes = calculateOropharynxStage({ ...baseInput, isHpv: false });

            expect(getMaxStage(hpvRes.t)).toBe('1');
            expect(getMaxStage(hpvRes.n)).toBe('0');
            expect(getMaxStage(nonHpvRes.t)).toBe('1');
            expect(getMaxStage(nonHpvRes.n)).toBe('0');
        });

        test('案例二：多發同側 4 cm 淋巴結 -> HPV(+) 為 N1，Non-HPV 為 N2b', () => {
            const baseInput = {
                hasTumorLocation: true,
                tumorSize: 2.5,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 4.0,
                    isSingle: false,
                    isEne: false
                },
                tumorSide: { isRight: true, isLeft: false },
                hasMetastasis: false
            };
            const hpvRes = calculateOropharynxStage({ ...baseInput, isHpv: true });
            const nonHpvRes = calculateOropharynxStage({ ...baseInput, isHpv: false });

            // HPV(+) 多發同側 <= 6 cm 仍屬 N1
            expect(getMaxStage(hpvRes.n)).toBe('1');
            // Non-HPV 多發同側 <= 6 cm 則為 N2b
            expect(getMaxStage(nonHpvRes.n)).toBe('2b');
        });

        test('案例三：單顆 2.5 cm 同側淋巴結伴隨 ENE(+) -> HPV(+) 臨床仍為 N1，Non-HPV 躍升為 N3b', () => {
            const baseInput = {
                hasTumorLocation: true,
                tumorSize: 2.0,
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: false,
                    size: 2.5,
                    isSingle: true,
                    isEne: true
                },
                tumorSide: { isRight: true, isLeft: false },
                hasMetastasis: false
            };
            const hpvRes = calculateOropharynxStage({ ...baseInput, isHpv: true });
            const nonHpvRes = calculateOropharynxStage({ ...baseInput, isHpv: false });

            expect(getMaxStage(hpvRes.n)).toBe('1');
            expect(getMaxStage(nonHpvRes.n)).toBe('3b');
        });

        test('案例四：侵犯外翼肌與雙側淋巴結轉移 (T4b, Bilateral nodes, M1) -> HPV(+) 為 T4N2M1，Non-HPV 為 T4bN2cM1', () => {
            const baseInput = {
                hasTumorLocation: true,
                tumorSize: 3.5,
                invasion: { t3: false, t4a: true, t4b: true },
                nodes: {
                    hasNodes: true,
                    hasRightNodes: true,
                    hasLeftNodes: true,
                    size: 3.5,
                    isSingle: false,
                    isEne: false
                },
                tumorSide: { isRight: true, isLeft: false },
                hasMetastasis: true
            };
            const hpvRes = calculateOropharynxStage({ ...baseInput, isHpv: true });
            const nonHpvRes = calculateOropharynxStage({ ...baseInput, isHpv: false });

            // HPV(+)
            expect(getMaxStage(hpvRes.t)).toBe('4');
            expect(getMaxStage(hpvRes.n)).toBe('2');
            expect(getMaxStage(hpvRes.m)).toBe('1');

            // Non-HPV
            expect(getMaxStage(nonHpvRes.t)).toBe('4b');
            expect(getMaxStage(nonHpvRes.n)).toBe('2c');
            expect(getMaxStage(nonHpvRes.m)).toBe('1');
        });
    });
});
