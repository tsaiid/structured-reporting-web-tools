import fs from 'fs';
import path from 'path';

describe('NHI Lung-RADS Auto Calculate Category', () => {
  let autoCalculateCategory;

  beforeAll(() => {
    const html = fs.readFileSync(
      path.resolve(__dirname, '../html/nhi_lung_rads.html'),
      'utf8',
    );
    document.documentElement.innerHTML = html;
    const module = require('./nhi_lung_rads');
    autoCalculateCategory = module.autoCalculateCategory;
  });

  beforeEach(() => {
    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    document
      .querySelectorAll('input[type="radio"]')
      .forEach((rb) => (rb.checked = false));
    document
      .querySelectorAll('input[type="text"]')
      .forEach((input) => (input.value = ''));
  });

  function setNodule1({ size, density, solidPart = '', status = 'no prior' }) {
    document.getElementById('nodule_gte6').checked = true;
    document.getElementById('n1_enable').checked = true;
    document.getElementById('n1_size').value = String(size);
    if (solidPart) {
      document.getElementById('n1_solid_part').value = String(solidPart);
    }
    const densityRadio = document.querySelector(
      `input[name="n1_density"][value="${density}"]`,
    );
    if (densityRadio) densityRadio.checked = true;
    const statusRadio = document.querySelector(
      `input[name="n1_status"][value="${status}"]`,
    );
    if (statusRadio) statusRadio.checked = true;
  }

  function getSelectedCategory() {
    return document.querySelector('input[name="category"]:checked')?.value;
  }

  describe('P1-1: Part-solid nodules category thresholds', () => {
    test('Newly found part-solid nodule with size < 6 mm should be Category 3 (not 4A)', () => {
      setNodule1({
        size: 5,
        density: 'part-solid',
        solidPart: 2,
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('3');
    });

    test('Baseline (no prior) part-solid nodule with size < 6 mm should be Category 2', () => {
      setNodule1({
        size: 5,
        density: 'part-solid',
        solidPart: 2,
        status: 'no prior',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('2');
    });

    test('Unchanged part-solid nodule with size < 6 mm should be Category 2', () => {
      setNodule1({
        size: 5.5,
        density: 'part-solid',
        solidPart: 2,
        status: 'unchanged',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('2');
    });

    test('Baseline part-solid nodule with size >= 6 mm and solidPart 4-5 mm (< 6 mm) should be Category 3', () => {
      setNodule1({
        size: 10,
        density: 'part-solid',
        solidPart: 5,
        status: 'no prior',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('3');
    });

    test('Unchanged part-solid nodule with size >= 6 mm and solidPart < 6 mm should be Category 3', () => {
      setNodule1({
        size: 12,
        density: 'part-solid',
        solidPart: 4,
        status: 'unchanged',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('3');
    });

    test('Baseline part-solid nodule with size >= 6 mm and solidPart 6 to < 8 mm should be Category 4A', () => {
      setNodule1({
        size: 10,
        density: 'part-solid',
        solidPart: 7,
        status: 'no prior',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4A');
    });

    test('Part-solid nodule with solidPart >= 8 mm should be Category 4B', () => {
      setNodule1({
        size: 15,
        density: 'part-solid',
        solidPart: 9,
        status: 'unchanged',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4B');
    });

    test('Newly found part-solid nodule with size >= 6 mm and solidPart < 4 mm should be Category 4A', () => {
      setNodule1({
        size: 10,
        density: 'part-solid',
        solidPart: 3,
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4A');
    });

    test('Newly found part-solid nodule with size >= 6 mm and solidPart >= 4 mm should be Category 4B', () => {
      setNodule1({
        size: 10,
        density: 'part-solid',
        solidPart: 5,
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4B');
    });

    test('Enlarging part-solid nodule with size >= 6 mm and solidPart < 4 mm should be Category 4A', () => {
      setNodule1({
        size: 8,
        density: 'part-solid',
        solidPart: 2,
        status: 'enlarging',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4A');
    });

    test('Enlarging part-solid nodule with size >= 6 mm and solidPart >= 4 mm should be Category 4B', () => {
      setNodule1({
        size: 8,
        density: 'part-solid',
        solidPart: 4.5,
        status: 'enlarging',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4B');
    });
  });

  describe('Solid nodules category thresholds', () => {
    test('Newly found solid nodule < 4 mm should be Category 2', () => {
      setNodule1({
        size: 3.5,
        density: 'solid',
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('2');
    });

    test('Newly found solid nodule 4 to < 6 mm should be Category 3', () => {
      setNodule1({
        size: 5,
        density: 'solid',
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('3');
    });

    test('Newly found solid nodule 6 to < 8 mm should be Category 4A', () => {
      setNodule1({
        size: 7,
        density: 'solid',
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4A');
    });

    test('Newly found solid nodule >= 8 mm should be Category 4B', () => {
      setNodule1({
        size: 9,
        density: 'solid',
        status: 'newly found',
      });
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('4B');
    });
  });

  describe('Non-nodule and Category 0 findings', () => {
    test('No nodule checked should be Category 1', () => {
      document.getElementById('no_nodule').checked = true;
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('1');
    });

    test('Cat 0 inflammatory finding should be Category 0', () => {
      document.getElementById('cat_0_inflammatory').checked = true;
      autoCalculateCategory();
      expect(getSelectedCategory()).toBe('0');
    });
  });
});
