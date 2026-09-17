import { Star, StarHalf } from "lucide-react";

export interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function RatingStars({ rating, count, size = "sm", showCount = true }: RatingStarsProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4 && rating % 1 <= 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-1 text-accent">
      <div className="flex items-center" aria-label={`Đánh giá: ${rating} trên 5 sao`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${starSize} fill-accent text-accent`} />
        ))}
        {hasHalf && <StarHalf className={`${starSize} fill-accent text-accent`} />}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-border`} />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-content-muted font-medium ml-1">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
}
