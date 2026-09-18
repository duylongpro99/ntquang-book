import { slugify } from '../../scripts/seed/slugify';

describe('slugify', () => {
  it.each([
    ['Kiến thức y học', 'kien-thuc-y-hoc'],
    ['Cận lâm sàng', 'can-lam-sang'],
    ['Giáo trình y khoa', 'giao-trinh-y-khoa'],
    ['NXB Y Học', 'nxb-y-hoc'],
    ['McGraw-Hill', 'mcgraw-hill'],
    ['Frank H. Netter, MD', 'frank-h-netter-md'],
    ['GS.TS. Đào Văn Phan (Chủ biên)', 'gs-ts-dao-van-phan-chu-bien'],
    ['BS. Nguyễn Tôn Thơ', 'bs-nguyen-ton-tho'],
    ['PGS.TS.BS. Nguyễn Thanh Hùng', 'pgs-ts-bs-nguyen-thanh-hung'],
  ])('slugifies %s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('is stable (idempotent on its own output)', () => {
    const once = slugify('Chấn thương chỉnh hình');
    expect(slugify(once)).toBe(once);
  });
});
