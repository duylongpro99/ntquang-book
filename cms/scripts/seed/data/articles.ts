export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  cover: string;
  readTime: string;
}

export const ARTICLES_DATA: Article[] = [
  {
    id: "a1",
    slug: "cap-nhat-huong-dan-chan-doan-dieu-tri-tang-huyet-ap-2024",
    title: "Cập nhật Hướng dẫn Chẩn đoán và Xử trí Tăng huyết áp 2024 của Hội Tim Mạch VN",
    category: "Kiến thức y học",
    excerpt:
      "Điểm lại các thay đổi quan trọng về đích kiểm soát huyết áp, khuyến cáo phối hợp thuốc sớm ngay từ bước đầu tiên và theo dõi huyết áp lưu động 24h.",
    author: "BS. Nguyễn Văn Hùng",
    publishedAt: "25/02/2024",
    readTime: "7 phút đọc",
    cover:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Tăng huyết áp (THA) vẫn là một trong những nguyên nhân hàng đầu gây tử vong và tàn phế do biến cố tim mạch và đột quỵ tại Việt Nam. Theo khuyến cáo cập nhật năm 2024 của Hội Tim Mạch Học Việt Nam (VNHA), nhiều điểm mấu chốt trong tiếp cận chẩn đoán và điều trị đã được chuẩn hóa.</p>
      
      <h3>1. Định nghĩa và Phân loại huyết áp</h3>
      <p>Chẩn đoán tăng huyết áp khi huyết áp tâm thu ≥ 140 mmHg và/hoặc huyết áp tâm trương ≥ 90 mmHg đo tại phòng khám. Tuy nhiên, khuyến cáo nhấn mạnh việc khẳng định chẩn đoán bằng đo huyết áp lưu động (ABPM) hoặc theo dõi huyết áp tại nhà (HBPM) để loại trừ tăng huyết áp áo choàng trắng và tăng huyết áp ẩn giấu.</p>

      <h3>2. Chiến lược phối hợp thuốc liều thấp cố định</h3>
      <p>Ngoại trừ người cao tuổi thể trạng rất yếu hoặc THA độ 1 nguy cơ thấp, phần lớn bệnh nhân được khuyến cáo khởi trị ngay bằng viên phối hợp 2 thuốc liều thấp (ƯCMC/CTTT kết hợp với Chẹn kênh canxi hoặc Lợi tiểu thiazide-like). Điều này giúp kiểm soát HA nhanh chóng và cải thiện mức độ tuân thủ điều trị.</p>

      <h3>3. Mục tiêu huyết áp điều trị</h3>
      <p>Mục tiêu chung cho hầu hết bệnh nhân từ 18-65 tuổi là đưa huyết áp tâm thu về 120-129 mmHg nếu dung nạp tốt, huyết áp tâm trương < 80 mmHg. Không hạ huyết áp tâm thu xuống dưới 110 mmHg do nguy cơ giảm tưới máu mạch vành.</p>
    `,
  },
  {
    id: "a2",
    slug: "phan-biet-nhoi-mau-nao-va-xuat-huyet-nao-tren-ct-scanner",
    title: "Nguyên tắc tiếp cận hình ảnh CT Sọ Não trong Đột Quỵ Cấp giờ vàng",
    category: "Cận lâm sàng",
    excerpt:
      "Hướng dẫn thực hành nhận diện các dấu hiệu sớm của thiếu máu não cục bộ diện rộng và phân biệt chính xác với xuất huyết nội sọ trước khi quyết định tiêu sợi huyết.",
    author: "ThS.BS. Lê Hoàng Nam",
    publishedAt: "18/02/2024",
    readTime: "10 phút đọc",
    cover:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Trong cấp cứu đột quỵ não cấp, thời gian chính là tế bào não (Time is Brain). Chụp cắt lớp vi tính sọ não không tiêm thuốc cản quang là chỉ định đầu tay bắt buộc để loại trừ xuất huyết não trước khi xem xét điều trị tái tưới máu bằng rtPA.</p>
      
      <h3>1. Đánh giá xuất huyết não</h3>
      <p>Máu tụ cấp tính xuất hiện dưới dạng tổn thương tăng tỷ trọng tự nhiên (50-80 Hounsfield) trong nhu mô não hoặc khoang dưới nhện. Việc xác định xuất huyết não là chống chỉ định tuyệt đối của thuốc tiêu huyết khối đường tĩnh mạch.</p>

      <h3>2. Các dấu hiệu sớm của nhồi máu não trên CT sọ não không cản quang</h3>
      <p>Trong những giờ đầu, nhu mô não có thể chưa biểu hiện giảm tỷ trọng rõ rệt. Bác sĩ cần chú ý tìm các dấu hiệu sớm:</p>
      <ul>
        <li>Dấu hiệu xóa mờ dải băng thùy đảo (Insular ribbon sign)</li>
        <li>Xóa ranh giới chất trắng - chất xám tại nhân đậu</li>
        <li>Xóa các rãnh cuộn não do phù nề tế bào não</li>
        <li>Dấu hiệu tăng tỷ trọng động mạch não giữa (Dense MCA sign)</li>
      </ul>
      <p>Thang điểm ASPECTS được sử dụng rộng rãi để định lượng mức độ tổn thương sớm ở tuần hoàn não trước.</p>
    `,
  },
  {
    id: "a3",
    slug: "top-5-giao-trinh-y-khoa-phai-co-cho-sinh-vien-noi-tru",
    title: "Top 5 bộ sách và giáo trình gối đầu giường cho Bác sĩ Nội trú và Sinh viên Y",
    category: "Giáo trình y khoa",
    excerpt:
      "Tổng hợp các đầu sách tham khảo kinh điển từ giải phẫu Netter, nội khoa Harrison đến các phác đồ hồi sức cấp cứu thực hành lâm sàng tốt nhất.",
    author: "BSNT. Trần Minh Tuấn",
    publishedAt: "05/02/2024",
    readTime: "5 phút đọc",
    cover:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Hành trình học tập trong ngành y đòi hỏi sự trau dồi liên tục từ những nguồn tài liệu chuẩn mực. Dưới đây là 5 đầu sách quan trọng nhất được các thế hệ bác sĩ nội trú đánh giá cao nhất:</p>
      <ol>
        <li><strong>Atlas Giải Phẫu Người – Frank Netter:</strong> Nền tảng cốt lõi không thể thiếu cho mọi chuyên ngành lâm sàng và ngoại khoa.</li>
        <li><strong>Harrison's Principles of Internal Medicine:</strong> Kinh thánh của chuyên ngành Nội khoa toàn cầu.</li>
        <li><strong>Phác Đồ Hồi Sức Cấp Cứu Chống Độc 2024:</strong> Cẩm nang bỏ túi thiết thực cho các ca trực cấp cứu bệnh viện.</li>
        <li><strong>Điều Trị Học Nội Khoa (ĐH Y Dược TP.HCM):</strong> Giáo trình thực hành bám sát mô hình bệnh tật người Việt Nam.</li>
        <li><strong>Hướng Dẫn Đọc Điện Tâm Đồ Lâm Sàng:</strong> Kỹ năng chẩn đoán cận lâm sàng thiết yếu cho mọi bác sĩ.</li>
      </ol>
    `,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES_DATA.find((a) => a.slug === slug);
}
