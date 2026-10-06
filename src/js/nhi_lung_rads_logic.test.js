import {
  calculateLungRadsCategory,
  generateReportText,
  generateNoduleText,
  LUNG_RADS_SCORES,
} from './nhi_lung_rads_logic.js';

describe('NHI Lung-RADS v2022 Logic Module', () => {
  describe('LUNG_RADS_SCORES constants', () => {
    test('defines expected numerical score tiers for category comparison', () => {
      expect(LUNG_RADS_SCORES.CAT_4B).toBeGreaterThan(LUNG_RADS_SCORES.CAT_4A);
      expect(LUNG_RADS_SCORES.CAT_4A).toBeGreaterThan(LUNG_RADS_SCORES.CAT_3);
      expect(LUNG_RADS_SCORES.CAT_3).toBeGreaterThan(LUNG_RADS_SCORES.CAT_2);
      expect(LUNG_RADS_SCORES.CAT_2).toBeGreaterThan(LUNG_RADS_SCORES.CAT_1);
      expect(LUNG_RADS_SCORES.CAT_0).toBeGreaterThan(LUNG_RADS_SCORES.CAT_4B);
    });
  });

  describe('Category 0: Incomplete Findings', () => {
    test('Prior CT examination being located yields Category 0', () => {
      expect(calculateLungRadsCategory({ cat_0_prior: true })).toBe('0');
      expect(calculateLungRadsCategory({ cat0: { prior: true } })).toBe('0');
    });

    test('Lungs cannot be evaluated yields Category 0', () => {
      expect(calculateLungRadsCategory({ cat_0_unevaluated: true })).toBe('0');
      expect(calculateLungRadsCategory({ cat0: { unevaluated: true } })).toBe('0');
    });

    test('Findings suggestive of infection/inflammation yield Category 0', () => {
      expect(calculateLungRadsCategory({ cat_0_inflammatory: true })).toBe('0');
      expect(calculateLungRadsCategory({ cat0: { inflammatory: true } })).toBe('0');
    });

    test('Category 0 takes precedence over suspicious nodules', () => {
      const data = {
        cat_0_inflammatory: true,
        nodules: [
          { size: 20, density: 'solid', status: 'newly found' },
        ],
      };
      expect(calculateLungRadsCategory(data)).toBe('0');
    });
  });

  describe('Category 1: Negative / Benign Features', () => {
    test('No nodule yields Category 1', () => {
      expect(calculateLungRadsCategory({ no_nodule: true })).toBe('1');
      expect(calculateLungRadsCategory({ noNodule: true })).toBe('1');
    });

    test('Nodule with benign features (calcification, fat) yields Category 1', () => {
      expect(calculateLungRadsCategory({ benign_features: true })).toBe('1');
      expect(calculateLungRadsCategory({ benignFeatures: true })).toBe('1');
    });

    test('Unselected / empty data yields empty string', () => {
      expect(calculateLungRadsCategory({})).toBe('');
    });
  });

  describe('Category 2: Benign Appearance or Behavior', () => {
    test('Nodule < 6 mm (nodule_lt6) yields Category 2', () => {
      expect(calculateLungRadsCategory({ nodule_lt6: true })).toBe('2');
      expect(calculateLungRadsCategory({ noduleLt6: true })).toBe('2');
    });

    test('Juxtapleural nodule yields Category 2', () => {
      expect(calculateLungRadsCategory({ juxtapleural: true })).toBe('2');
    });

    test('Airway nodule: subsegmental or favors secretions yields Category 2', () => {
      expect(calculateLungRadsCategory({ airway_subsegmental: true })).toBe('2');
      expect(calculateLungRadsCategory({ airway_secretions: true })).toBe('2');
      expect(calculateLungRadsCategory({ airway: { subsegmental: true } })).toBe('2');
      expect(calculateLungRadsCategory({ airway: { secretions: true } })).toBe('2');
    });

    test('Solid nodule < 6 mm at baseline or unchanged yields Category 2', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.9, density: 'solid', status: 'no prior' }],
      })).toBe('2');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 4.5, density: 'solid', status: 'unchanged' }],
      })).toBe('2');
    });

    test('Solid nodule newly found < 4 mm yields Category 2', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 3.9, density: 'solid', status: 'newly found' }],
      })).toBe('2');
    });

    test('Part-solid nodule < 6 mm at baseline or unchanged yields Category 2', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.9, density: 'part-solid', solidPart: 2, status: 'no prior' }],
      })).toBe('2');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.5, density: 'part-solid', solidPart: 1, status: 'unchanged' }],
      })).toBe('2');
    });

    test('Non-solid (pure ground glass) nodule < 30 mm yields Category 2', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 20, density: 'non-solid', status: 'no prior' }],
      })).toBe('2');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 29.9, density: 'non-solid', status: 'newly found' }],
      })).toBe('2');
    });

    test('Non-solid nodule >= 30 mm unchanged yields Category 2', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 35, density: 'non-solid', status: 'unchanged' }],
      })).toBe('2');
    });
  });

  describe('Category 3: Probably Benign', () => {
    test('Atypical pulmonary cyst Category 3 yields Category 3', () => {
      expect(calculateLungRadsCategory({ cyst_3: true })).toBe('3');
      expect(calculateLungRadsCategory({ cysts: { cyst_3: true } })).toBe('3');
    });

    test('Solid nodule 6 to < 8 mm at baseline or unchanged yields Category 3', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 6.0, density: 'solid', status: 'no prior' }],
      })).toBe('3');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 7.9, density: 'solid', status: 'unchanged' }],
      })).toBe('3');
    });

    test('Solid nodule newly found 4 to < 6 mm yields Category 3', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 4.0, density: 'solid', status: 'newly found' }],
      })).toBe('3');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.9, density: 'solid', status: 'newly found' }],
      })).toBe('3');
    });

    test('Part-solid nodule >= 6 mm with solid component < 6 mm at baseline/unchanged yields Category 3', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 10, density: 'part-solid', solidPart: 5.9, status: 'no prior' }],
      })).toBe('3');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 12, density: 'part-solid', solidPart: 4.0, status: 'unchanged' }],
      })).toBe('3');
    });

    test('Part-solid nodule newly found with total size < 6 mm yields Category 3 (P1-1 rule)', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.5, density: 'part-solid', solidPart: 2, status: 'newly found' }],
      })).toBe('3');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 4.0, density: 'part-solid', solidPart: 1, status: 'newly found' }],
      })).toBe('3');
    });

    test('Non-solid nodule >= 30 mm at baseline or newly found yields Category 3', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 30.0, density: 'non-solid', status: 'no prior' }],
      })).toBe('3');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 35.0, density: 'non-solid', status: 'newly found' }],
      })).toBe('3');
    });
  });

  describe('Category 4A: Suspicious', () => {
    test('Atypical pulmonary cyst Category 4A yields Category 4A', () => {
      expect(calculateLungRadsCategory({ cyst_4a: true })).toBe('4A');
      expect(calculateLungRadsCategory({ cysts: { cyst_4a: true } })).toBe('4A');
    });

    test('Airway nodule segmental or proximal at baseline yields Category 4A', () => {
      expect(calculateLungRadsCategory({ airway_baseline: true })).toBe('4A');
      expect(calculateLungRadsCategory({ airway: { baseline: true } })).toBe('4A');
    });

    test('Solid nodule 8 to < 15 mm at baseline or unchanged yields Category 4A', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 8.0, density: 'solid', status: 'no prior' }],
      })).toBe('4A');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 14.9, density: 'solid', status: 'unchanged' }],
      })).toBe('4A');
    });

    test('Solid nodule newly found 6 to < 8 mm yields Category 4A', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 6.0, density: 'solid', status: 'newly found' }],
      })).toBe('4A');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 7.9, density: 'solid', status: 'newly found' }],
      })).toBe('4A');
    });

    test('Solid nodule enlarging < 8 mm yields Category 4A', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 5.0, density: 'solid', status: 'enlarging' }],
      })).toBe('4A');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 7.9, density: 'solid', status: 'enlarging' }],
      })).toBe('4A');
    });

    test('Part-solid nodule >= 6 mm with solid component 6 to < 8 mm at baseline/unchanged yields Category 4A', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 10, density: 'part-solid', solidPart: 6.0, status: 'no prior' }],
      })).toBe('4A');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 12, density: 'part-solid', solidPart: 7.9, status: 'unchanged' }],
      })).toBe('4A');
    });

    test('Part-solid nodule newly found or enlarging with total size >= 6 mm and solid component < 4 mm yields Category 4A', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 10, density: 'part-solid', solidPart: 3.9, status: 'newly found' }],
      })).toBe('4A');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 8, density: 'part-solid', solidPart: 2.0, status: 'enlarging' }],
      })).toBe('4A');
    });
  });

  describe('Category 4B: Very Suspicious', () => {
    test('Atypical pulmonary cyst Category 4B yields Category 4B', () => {
      expect(calculateLungRadsCategory({ cyst_4b: true })).toBe('4B');
      expect(calculateLungRadsCategory({ cysts: { cyst_4b: true } })).toBe('4B');
    });

    test('Airway nodule segmental or proximal stable or growing yields Category 4B', () => {
      expect(calculateLungRadsCategory({ airway_stable: true })).toBe('4B');
      expect(calculateLungRadsCategory({ airway: { stable: true } })).toBe('4B');
    });

    test('Solid nodule >= 15 mm (any status) yields Category 4B', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 15.0, density: 'solid', status: 'no prior' }],
      })).toBe('4B');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 20.0, density: 'solid', status: 'unchanged' }],
      })).toBe('4B');
    });

    test('Solid nodule newly found or enlarging >= 8 mm yields Category 4B', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 8.0, density: 'solid', status: 'newly found' }],
      })).toBe('4B');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 10.0, density: 'solid', status: 'enlarging' }],
      })).toBe('4B');
    });

    test('Part-solid nodule with solid component >= 8 mm (any status) yields Category 4B', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 15, density: 'part-solid', solidPart: 8.0, status: 'unchanged' }],
      })).toBe('4B');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 18, density: 'part-solid', solidPart: 10.0, status: 'no prior' }],
      })).toBe('4B');
    });

    test('Part-solid nodule newly found or enlarging with total size >= 6 mm and solid component >= 4 mm yields Category 4B', () => {
      expect(calculateLungRadsCategory({
        nodules: [{ size: 6.0, density: 'part-solid', solidPart: 4.0, status: 'newly found' }],
      })).toBe('4B');
      expect(calculateLungRadsCategory({
        nodules: [{ size: 10.0, density: 'part-solid', solidPart: 5.5, status: 'enlarging' }],
      })).toBe('4B');
    });
  });

  describe('Precedence & Multiple Findings Integration', () => {
    test('Highest category is selected among multiple nodules (Cat 2 + Cat 4A -> 4A)', () => {
      const data = {
        nodules: [
          { size: 4, density: 'solid', status: 'no prior' }, // Cat 2
          { size: 7, density: 'solid', status: 'newly found' }, // Cat 4A
        ],
      };
      expect(calculateLungRadsCategory(data)).toBe('4A');
    });

    test('Cat 4B overrides Cat 4A and Cat 3 findings', () => {
      const data = {
        cyst_3: true,
        airway_baseline: true, // Cat 4A
        nodules: [
          { size: 9, density: 'solid', status: 'newly found' }, // Cat 4B
        ],
      };
      expect(calculateLungRadsCategory(data)).toBe('4B');
    });

    test('Disabled nodule (enabled: false) is ignored in calculation', () => {
      const data = {
        noduleLt6: true, // Cat 2
        nodules: [
          { enabled: false, size: 20, density: 'solid' }, // Cat 4B but disabled
        ],
      };
      expect(calculateLungRadsCategory(data)).toBe('2');
    });

    test('noduleGte6: false ignores all nodules in gte6 block', () => {
      const data = {
        noduleGte6: false,
        nodules: [
          { size: 20, density: 'solid' },
        ],
        noNodule: true,
      };
      expect(calculateLungRadsCategory(data)).toBe('1');
    });

    test('Handles legacy flat fields n1_*, n2_*, n3_* correctly', () => {
      const data = {
        nodule_gte6: true,
        n1_enable: true,
        n1_size: '7.5',
        n1_density: 'solid',
        n1_status: 'newly found',
      };
      expect(calculateLungRadsCategory(data)).toBe('4A');
    });
  });

  describe('Boundary Condition Verification', () => {
    test('Solid newly found boundary tests: 3.9 -> 2, 4.0 -> 3, 5.9 -> 3, 6.0 -> 4A, 7.9 -> 4A, 8.0 -> 4B', () => {
      const check = (size) =>
        calculateLungRadsCategory({ nodules: [{ size, density: 'solid', status: 'newly found' }] });

      expect(check(3.9)).toBe('2');
      expect(check(4.0)).toBe('3');
      expect(check(5.9)).toBe('3');
      expect(check(6.0)).toBe('4A');
      expect(check(7.9)).toBe('4A');
      expect(check(8.0)).toBe('4B');
    });

    test('Part-solid newly found with size >= 6 mm solidPart boundary tests: 3.9 -> 4A, 4.0 -> 4B', () => {
      const check = (solidPart) =>
        calculateLungRadsCategory({
          nodules: [{ size: 8, density: 'part-solid', solidPart, status: 'newly found' }],
        });

      expect(check(3.9)).toBe('4A');
      expect(check(4.0)).toBe('4B');
    });

    test('Part-solid baseline solidPart boundary tests: 5.9 -> 3, 6.0 -> 4A, 7.9 -> 4A, 8.0 -> 4B', () => {
      const check = (solidPart) =>
        calculateLungRadsCategory({
          nodules: [{ size: 10, density: 'part-solid', solidPart, status: 'no prior' }],
        });

      expect(check(5.9)).toBe('3');
      expect(check(6.0)).toBe('4A');
      expect(check(7.9)).toBe('4A');
      expect(check(8.0)).toBe('4B');
    });
  });

  describe('generateNoduleText Unit Tests', () => {
    test('formats nodule text properly for populated nodule', () => {
      const nodule = {
        enabled: true,
        size: '12',
        density: 'part-solid',
        solidPart: '5',
        se: '2',
        im: '45',
        lobe: 'RUL',
        status: 'newly found',
      };
      const text = generateNoduleText(nodule, 1, false);
      expect(text).toContain('[+] Lung nodule 1 (size, character and location)');
      expect(text).toContain('Entire Nodule: 12 mm');
      expect(text).toContain('[+] part-solid (solid part: 5 mm)');
      expect(text).toContain('(SE:2, IM:45)');
      expect(text).toContain('[+] RUL');
      expect(text).toContain('[+] newly found (≧4 mm)');
    });

    test('returns empty string in simple mode if nodule is disabled', () => {
      const nodule = { enabled: false, size: '10' };
      expect(generateNoduleText(nodule, 1, true)).toBe('');
    });
  });

  describe('generateReportText Unit Tests', () => {
    test('generates full report with correct default structure', () => {
      const data = {
        quality: 'Good',
        ctdi: '1.5',
        dlp: '52',
        noPrior: true,
        noNodule: true,
        category: '1',
      };
      const report = generateReportText(data, false);

      expect(report).toContain('LDCT Quality: [+] Good [ ] Acceptable [ ] Not Acceptable');
      expect(report).toContain('CTDIvol: 1.5 mGy Total DLP: 52 mGy*cm');
      expect(report).toContain('In comparison with the prior CT, Date (Y/M/D) _ [+] No prior chest CT available');
      expect(report).toContain('Lung nodule findings related to cancer screening');
      expect(report).toContain('[+] No lung nodule');
      expect(report).toContain('[ ] Lung nodule(s) (<6mm) (選填 SE: , IM:  )');
      expect(report).toContain('Overall recommendation');
      expect(report).toContain('[+] Category 1: Negative.');
    });

    test('generates simple report containing only positive findings', () => {
      const data = {
        quality: 'Good',
        ctdi: '1.2',
        dlp: '45',
        priorDate: '2025/01/10',
        noPrior: false,
        noduleGte6: true,
        totalNodules: '1',
        nodules: [
          {
            enabled: true,
            size: '8',
            density: 'solid',
            se: '3',
            im: '12',
            lobe: 'LUL',
            status: 'unchanged',
          },
        ],
        category: '4A',
        modifierS: true,
      };
      const simpleReport = generateReportText(data, true);

      expect(simpleReport).toContain('In comparison with the prior CT, Date (Y/M/D) 2025/01/10 [ ] No prior chest CT available');
      expect(simpleReport).not.toContain('No lung nodule');
      expect(simpleReport).toContain('[+] Lung nodule(s) (≧6mm or enlarging>1.5mm or new≧4mm): total number [+] 1');
      expect(simpleReport).toContain('Lung nodule 1');
      expect(simpleReport).toContain('[+] Category 4A: Suspicious.');
      expect(simpleReport).toContain('[+] Modifier S: May add to category 0-4');
    });

    test('formats cysts and airway findings accurately', () => {
      const data = {
        airway: {
          proximal: true,
          baseline: true,
        },
        cysts: {
          cyst_4a: true,
          cyst_4a_se: '4',
          cyst_4a_im: '28',
          cyst_4a_rul: true,
        },
        category: '4A',
      };
      const report = generateReportText(data, false);

      expect(report).toContain('[+] Airway nodule');
      expect(report).toContain('  [+] Segmental or more proximal');
      expect(report).toContain('    [+] At baseline (Category 4A)');
      expect(report).toContain('[+] Atypical pulmonary cyst');
      expect(report).toContain('  [+] Category 4A. Lobe: (SE: 4, IM: 28)');
      expect(report).toContain('[+] RUL');
    });
  });
});
