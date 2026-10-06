import { get_t_stage_by_size, getMaxStageNumber, calculateLungStage, resolveM1RadioState } from './lung_logic';

describe('Lung Logic', () => {
  describe('get_t_stage_by_size', () => {
    test('should return x for NaN', () => {
      expect(get_t_stage_by_size(NaN)).toBe('x');
    });
    test('should return 0 for 0', () => {
      expect(get_t_stage_by_size(0)).toBe('0');
    });
    test('should return 1a for <= 1', () => {
      expect(get_t_stage_by_size(0.5)).toBe('1a');
      expect(get_t_stage_by_size(1)).toBe('1a');
    });
    test('should return 1b for > 1 and <= 2', () => {
      expect(get_t_stage_by_size(1.1)).toBe('1b');
      expect(get_t_stage_by_size(2)).toBe('1b');
    });
    test('should return 1c for > 2 and <= 3', () => {
      expect(get_t_stage_by_size(2.1)).toBe('1c');
      expect(get_t_stage_by_size(3)).toBe('1c');
    });
    test('should return 2a for > 3 and <= 4', () => {
      expect(get_t_stage_by_size(3.1)).toBe('2a');
      expect(get_t_stage_by_size(4)).toBe('2a');
    });
    test('should return 2b for > 4 and <= 5', () => {
      expect(get_t_stage_by_size(4.1)).toBe('2b');
      expect(get_t_stage_by_size(5)).toBe('2b');
    });
    test('should return 3 for > 5 and <= 7', () => {
      expect(get_t_stage_by_size(5.1)).toBe('3');
      expect(get_t_stage_by_size(7)).toBe('3');
    });
    test('should return 4 for > 7', () => {
      expect(get_t_stage_by_size(7.1)).toBe('4');
      expect(get_t_stage_by_size(10)).toBe('4');
    });
  });

  describe('getMaxStageNumber', () => {
    test('should return max number', () => {
      expect(getMaxStageNumber(['1a', '2', '3'])).toBe(3);
      expect(getMaxStageNumber(['1a', '2b'])).toBe(2);
      expect(getMaxStageNumber(['x', '1'])).toBe(1);
    });
  });

  describe('calculateLungStage', () => {
    test('basic case: small tumor, no nodes, no metastasis', () => {
      const data = {
        tumorSize: 2,
        isNonMeasurable: false,
        invasion: { t4: false, t3: false, t2a: false },
        nodes: { n1: false, n2: false, n2Type: null, n3: false },
        metastasis: { m1a: false, m1bc: false, m1Type: null }
      };
      const result = calculateLungStage(data);
      expect(result.t).toEqual(['1b']);
      expect(result.n).toEqual(['0']);
      expect(result.m).toEqual(['0']);
    });

    test('T4 invasion overrides size', () => {
      const data = {
        tumorSize: 2,
        isNonMeasurable: false,
        invasion: { t4: true, t3: false, t2a: false },
        nodes: { n1: false, n2: false, n2Type: null, n3: false },
        metastasis: { m1a: false, m1bc: false, m1Type: null }
      };
      const result = calculateLungStage(data);
      expect(result.t).toContain('4');
      expect(result.t).toContain('1b');
    });

    test('N2b involvement', () => {
      const data = {
        tumorSize: 2,
        isNonMeasurable: false,
        invasion: { t4: false, t3: false, t2a: false },
        nodes: { n1: false, n2: true, n2Type: '2b', n3: false },
        metastasis: { m1a: false, m1bc: false, m1Type: null }
      };
      const result = calculateLungStage(data);
      expect(result.n).toContain('2');
      expect(result.n).toContain('2b');
    });

    test('M1b single extrathoracic metastasis', () => {
      const data = {
        tumorSize: 2,
        isNonMeasurable: false,
        invasion: { t4: false, t3: false, t2a: false },
        nodes: { n1: false, n2: false, n2Type: null, n3: false },
        metastasis: { m1a: false, m1bc: true, m1Type: '1b' }
      };
      const result = calculateLungStage(data);
      expect(result.m).toContain('1b');
    });

    test('M1c2 metastasis', () => {
      const data = {
        tumorSize: 2,
        isNonMeasurable: false,
        invasion: { t4: false, t3: false, t2a: false },
        nodes: { n1: false, n2: false, n2Type: null, n3: false },
        metastasis: { m1a: false, m1bc: true, m1Type: '1c2' }
      };
      const result = calculateLungStage(data);
      expect(result.m).toContain('1c2');
    });
  });

  describe('resolveM1RadioState', () => {
    test('when checkedCount is 0, clears radio selection and enables 1b', () => {
      expect(resolveM1RadioState(0, undefined)).toEqual({
        selectedRadio: null,
        isM1bDisabled: false
      });
      expect(resolveM1RadioState(0, '1c1')).toEqual({
        selectedRadio: null,
        isM1bDisabled: false
      });
    });

    test('when checkedCount is 1 with no prior selection, defaults to 1b', () => {
      expect(resolveM1RadioState(1, undefined)).toEqual({
        selectedRadio: '1b',
        isM1bDisabled: false
      });
      expect(resolveM1RadioState(1, null)).toEqual({
        selectedRadio: '1b',
        isM1bDisabled: false
      });
    });

    test('when checkedCount is 1, preserves user choice of 1b without overriding', () => {
      expect(resolveM1RadioState(1, '1b')).toEqual({
        selectedRadio: '1b',
        isM1bDisabled: false
      });
    });

    test('when checkedCount is 1, preserves user choice of 1c1 without overriding', () => {
      expect(resolveM1RadioState(1, '1c1')).toEqual({
        selectedRadio: '1c1',
        isM1bDisabled: false
      });
    });

    test('when checkedCount drops to 1 from multi-organ (1c2), converts to 1c1 and enables 1b', () => {
      expect(resolveM1RadioState(1, '1c2')).toEqual({
        selectedRadio: '1c1',
        isM1bDisabled: false
      });
    });

    test('when checkedCount is greater than 1, sets to 1c2 and disables 1b', () => {
      expect(resolveM1RadioState(2, '1b')).toEqual({
        selectedRadio: '1c2',
        isM1bDisabled: true
      });
      expect(resolveM1RadioState(3, '1c1')).toEqual({
        selectedRadio: '1c2',
        isM1bDisabled: true
      });
    });
  });
});

