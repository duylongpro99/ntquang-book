import { ArrowRight, Clock, User } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { ARTICLES_DATA } from "@/src/data/articles";

export const metadata = {
  title: "Tin Tức & Kiến Thức Y Khoa - Thư Viện Sách Y Học",
  description:
    "Cập nhật bài viết hướng dẫn lâm sàng, điểm tin y học và giới thiệu sách chuyên khoa mới.",
};

export default function BlogListPage() {
  const featuredArticle = ARTICLES_DATA[0];
  const otherArticles = ARTICLES_DATA.slice(1);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
      <Breadcrumb items={[{ label: "Tin tức y khoa" }]} />

      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-content tracking-tight">
          Tin Tức & Kiến Thức Y Khoa
        </h1>
        <p className="text-xs sm:text-sm text-content-muted mt-1">
          Cập nhật các điểm tin phát hành sách mới, phác đồ điều trị và tài liệu nghiên cứu lâm sàng
        </p>
      </div>

      {/* Featured Headline Article */}
      {featuredArticle && (
        <article className="bg-surface rounded-xl border border-border shadow-e1 overflow-hidden group">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            <div className="md:col-span-7 aspect-16/10 bg-surface-muted overflow-hidden">
              <img
                src={featuredArticle.cover}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                  {featuredArticle.category}
                </span>
                <Link href={`/tin-tuc/${featuredArticle.slug}`}>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-content group-hover:text-primary transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-content-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-border flex items-center justify-between text-xs text-content-muted">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{featuredArticle.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featuredArticle.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {otherArticles.map((article) => (
          <article
            key={article.id}
            className="group bg-surface rounded-xl border border-border shadow-e1 overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="aspect-16/10 bg-surface-muted overflow-hidden relative border-b border-border">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-surface/90 backdrop-blur-xs text-primary font-bold text-[11px] px-2 py-0.5 rounded shadow-xs">
                  {article.category}
                </span>
              </div>

              <div className="p-5">
                <Link href={`/tin-tuc/${article.slug}`}>
                  <h3 className="text-base font-heading font-bold text-content group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-xs text-content-muted line-clamp-2 mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between text-xs text-content-muted border-t border-border/60 mt-2">
              <span className="truncate max-w-[140px]">{article.author}</span>
              <Link
                href={`/tin-tuc/${article.slug}`}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Đọc bài</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
