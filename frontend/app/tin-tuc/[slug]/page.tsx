import { Calendar, Clock, HeartPulse, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Rail } from "@/src/components/book/Rail";
import { ShareBar } from "@/src/components/detail/ShareBar";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { getArticleBySlug } from "@/src/lib/cms/articles";
import { listBooks } from "@/src/lib/cms/books";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Không tìm thấy bài viết" };
  return { title: article.title, description: article.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Related books to show at bottom
  const recommendedBooks = (await listBooks({ limit: 4 })).books;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
      <Breadcrumb
        items={[{ label: "Tin tức y khoa", href: "/tin-tuc" }, { label: article.title }]}
      />

      <div className="max-w-3xl mx-auto">
        {/* Article Header */}
        <header className="space-y-4 pb-6 border-b border-border">
          <span className="inline-block px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-content tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-content-muted pt-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-content">{article.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishedAt}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime} đọc</span>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        <div className="my-6 aspect-16/9 rounded-xl overflow-hidden bg-surface-muted border border-border shadow-e1">
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Share Bar */}
        <div className="py-3 border-y border-border mb-6">
          <ShareBar title={article.title} />
        </div>

        {/* Article Body Content */}
        <div
          className="prose max-w-none text-content text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Medical Disclaimer Footnote */}
        <aside
          aria-label="Tuyên bố miễn trừ y khoa"
          className="mt-10 p-4 bg-surface-muted rounded-xl border border-border flex items-start gap-3 text-xs text-content-muted"
        >
          <HeartPulse className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-content text-xs">
              Tuyên bố miễn trừ trách nhiệm y khoa:
            </h4>
            <p className="leading-relaxed text-[11px]">
              Bài viết mang tính chất chia sẻ kiến thức học thuật và tổng hợp tài liệu y học. Không
              sử dụng thông tin trong bài viết để tự chẩn đoán hoặc tự ý điều trị mà không có hướng
              dẫn từ bác sĩ chuyên khoa.
            </p>
          </div>
        </aside>
      </div>

      {/* Recommended Books Section */}
      <div className="pt-8 border-t border-border">
        <Rail
          title="Tài Liệu Y Khoa Nổi Bật Dành Cho Bạn"
          subtitle="Các đầu sách kinh điển có thể tải về ngay hôm nay"
          books={recommendedBooks}
          viewAllHref="/thu-vien-sach"
        />
      </div>
    </div>
  );
}
