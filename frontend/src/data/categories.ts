export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  children?: CategoryItem[];
}

export const CATEGORIES_TREE: CategoryItem[] = [
  {
    id: "noi-khoa",
    name: "Nội Khoa",
    slug: "noi-khoa",
    count: 420,
    children: [
      { id: "giao-trinh-noi", name: "Giáo trình Nội", slug: "noi-khoa/giao-trinh-noi", count: 48 },
      { id: "noi-tong-quat", name: "Nội tổng quát", slug: "noi-khoa/noi-tong-quat", count: 65 },
      { id: "noi-tim-mach", name: "Nội tim mạch", slug: "noi-khoa/noi-tim-mach", count: 52 },
      { id: "noi-ho-hap", name: "Nội hô hấp", slug: "noi-khoa/noi-ho-hap", count: 38 },
      { id: "noi-tieu-hoa", name: "Nội tiêu hóa", slug: "noi-khoa/noi-tieu-hoa", count: 45 },
      { id: "than-tiet-nieu", name: "Nội thận – Tiết niệu", slug: "noi-khoa/than-tiet-nieu", count: 32 },
      { id: "noi-tiet", name: "Nội tiết – Đái tháo đường", slug: "noi-khoa/noi-tiet", count: 29 },
      { id: "co-xuong-khop", name: "Nội cơ xương khớp", slug: "noi-khoa/co-xuong-khop", count: 31 },
      { id: "noi-than-kinh", name: "Nội thần kinh", slug: "noi-khoa/noi-than-kinh", count: 37 },
      { id: "di-ung-mien-dich", name: "Dị ứng miễn dịch lâm sàng", slug: "noi-khoa/di-ung-mien-dich", count: 18 },
      { id: "hoi-suc-cap-cuu", name: "Hồi sức – Cấp cứu – ICU", slug: "noi-khoa/hoi-suc-cap-cuu", count: 41 },
      { id: "huyet-hoc-truyen-mau", name: "Huyết học truyền máu", slug: "noi-khoa/huyet-hoc-truyen-mau", count: 24 },
    ],
  },
  {
    id: "ngoai-khoa",
    name: "Ngoại Khoa",
    slug: "ngoai-khoa",
    count: 385,
    children: [
      { id: "giao-trinh-ngoai", name: "Giáo trình Ngoại", slug: "ngoai-khoa/giao-trinh-ngoai", count: 36 },
      { id: "ngoai-tong-quat", name: "Ngoại tổng quát", slug: "ngoai-khoa/ngoai-tong-quat", count: 54 },
      { id: "ngoai-cap-cuu", name: "Ngoại cấp cứu", slug: "ngoai-khoa/ngoai-cap-cuu", count: 42 },
      { id: "ngoai-tieu-hoa", name: "Ngoại tiêu hóa – Gan mật", slug: "ngoai-khoa/ngoai-tieu-hoa", count: 47 },
      { id: "ngoai-long-nguc", name: "Ngoại lồng ngực – Tim mạch", slug: "ngoai-khoa/ngoai-long-nguc", count: 35 },
      { id: "ngoai-mach-mau", name: "Ngoại mạch máu", slug: "ngoai-khoa/ngoai-mach-mau", count: 22 },
      { id: "ngoai-tiet-nieu", name: "Ngoại tiết niệu", slug: "ngoai-khoa/ngoai-tiet-nieu", count: 28 },
      { id: "ngoai-than-kinh", name: "Ngoại thần kinh – Sọ não", slug: "ngoai-khoa/ngoai-than-kinh", count: 39 },
      { id: "chan-thuong-chinh-hinh", name: "Chấn thương chỉnh hình", slug: "ngoai-khoa/chan-thuong-chinh-hinh", count: 58 },
      { id: "bong", name: "Bỏng – Tạo hình", slug: "ngoai-khoa/bong", count: 24 },
    ],
  },
  {
    id: "san-phu-khoa",
    name: "Sản Phụ Khoa",
    slug: "san-phu-khoa",
    count: 195,
    children: [
      { id: "giao-trinh-san-phu-khoa", name: "Giáo trình Sản phụ khoa", slug: "san-phu-khoa/giao-trinh-san-phu-khoa", count: 28 },
      { id: "san-khoa", name: "Sản khoa", slug: "san-phu-khoa/san-khoa-san-khoa", count: 96 },
      { id: "phu-khoa", name: "Phụ khoa & Hiếm muộn", slug: "san-phu-khoa/phu-khoa", count: 71 },
    ],
  },
  {
    id: "nhi-khoa",
    name: "Nhi Khoa",
    slug: "nhi-khoa",
    count: 210,
    children: [
      { id: "giao-trinh-nhi-khoa", name: "Giáo trình Nhi khoa", slug: "nhi-khoa/giao-trinh-nhi-khoa", count: 32 },
      { id: "noi-nhi", name: "Nội Nhi & Sơ sinh", slug: "nhi-khoa/noi-nhi", count: 124 },
      { id: "ngoai-nhi", name: "Ngoại Nhi & Dị tật bẩm sinh", slug: "nhi-khoa/ngoai-nhi", count: 54 },
    ],
  },
  {
    id: "chuyen-khoa-le",
    name: "Chuyên Khoa Lẻ",
    slug: "chuyen-khoa-le",
    count: 340,
    children: [
      { id: "nhan-khoa", name: "Nhãn khoa", slug: "chuyen-khoa-le/nhan-khoa", count: 42 },
      { id: "da-lieu", name: "Da liễu & Thẩm mỹ da", slug: "chuyen-khoa-le/da-lieu", count: 51 },
      { id: "tai-mui-hong", name: "Tai Mũi Họng", slug: "chuyen-khoa-le/tai-mui-hong-chuyen-khoa-le", count: 48 },
      { id: "rang-ham-mat", name: "Răng Hàm Mặt", slug: "chuyen-khoa-le/rang-ham-mat", count: 39 },
      { id: "truyen-nhiem", name: "Truyền nhiễm & Bệnh nhiệt đới", slug: "chuyen-khoa-le/truyen-nhiem", count: 35 },
      { id: "ung-buou", name: "Ung bướu & Xạ trị", slug: "chuyen-khoa-le/ung-buou", count: 44 },
      { id: "tam-than", name: "Tâm thần & Tâm lý lâm sàng", slug: "chuyen-khoa-le/tam-than", count: 28 },
      { id: "gay-me-hoi-suc", name: "Gây mê hồi sức", slug: "chuyen-khoa-le/gay-me-hoi-suc", count: 33 },
      { id: "phuc-hoi-chuc-nang", name: "Phục hồi chức năng & Vật lý trị liệu", slug: "chuyen-khoa-le/phuc-hoi-chuc-nang", count: 20 },
    ],
  },
  {
    id: "can-lam-sang",
    name: "Cận Lâm Sàng",
    slug: "can-lam-sang",
    count: 260,
    children: [
      { id: "chan-doan-hinh-anh", name: "Chẩn đoán hình ảnh (X-quang, CT, MRI)", slug: "can-lam-sang/chan-doan-hinh-anh", count: 110 },
      { id: "xet-nghiem", name: "Xét nghiệm y học", slug: "can-lam-sang/xet-nghiem", count: 68 },
      { id: "dien-tam-do", name: "Điện tâm đồ (ECG)", slug: "can-lam-sang/dien-tam-do", count: 52 },
      { id: "dien-nao-do", name: "Điện não đồ (EEG)", slug: "can-lam-sang/dien-nao-do", count: 30 },
    ],
  },
  {
    id: "y-hoc-co-so",
    name: "Y Học Cơ Sở",
    slug: "y-hoc-co-so",
    count: 280,
    children: [
      { id: "giai-phau-hoc", name: "Giải phẫu học", slug: "y-hoc-co-so/giai-phau-hoc", count: 62 },
      { id: "sinh-ly-hoc", name: "Sinh lý học", slug: "y-hoc-co-so/sinh-ly-hoc", count: 48 },
      { id: "duoc-ly-hoc", name: "Dược lý học", slug: "y-hoc-co-so/duoc-ly-hoc", count: 55 },
      { id: "giai-phau-benh", name: "Giải phẫu bệnh", slug: "y-hoc-co-so/giai-phau-benh", count: 38 },
      { id: "ky-nang-lam-sang", name: "Kỹ năng lâm sàng", slug: "y-hoc-co-so/ky-nang-lam-sang", count: 41 },
      { id: "vi-sinh-ky-sinh-trung", name: "Vi sinh – Ký sinh trùng", slug: "y-hoc-co-so/vi-sinh-ky-sinh-trung", count: 36 },
    ],
  },
  {
    id: "sach-tieng-anh",
    name: "Sách Tiếng Anh",
    slug: "sach-tieng-anh",
    count: 180,
  },
  {
    id: "sach-dich-anh-viet",
    name: "Sách Dịch Anh – Việt",
    slug: "sach-dich-anh-viet",
    count: 95,
  },
];

export function findCategoryBySlug(slugPath: string): CategoryItem | null {
  const cleanPath = slugPath.replace(/^\/+|\/+$/g, "");
  for (const cat of CATEGORIES_TREE) {
    if (cat.slug === cleanPath || cat.id === cleanPath) return cat;
    if (cat.children) {
      for (const child of cat.children) {
        if (child.slug === cleanPath || child.id === cleanPath) return child;
      }
    }
  }
  return null;
}
