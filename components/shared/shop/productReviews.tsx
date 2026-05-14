
"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

interface Props {
  productId: string;
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
};

export function ProductReviews({
  reviews,
  avgRating,
  totalReviews,
}: Props) {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <div className="text-5xl font-bold text-orange-500">
          {avgRating.toFixed(1)} <span className="text-gray-400 text-2xl">/ 5</span>
        </div>
        <div className="flex mt-2 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.round(avgRating)
                  ? "fill-orange-400 text-orange-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">{totalReviews} Reviews</p>

        <div className="space-y-2 mt-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <Star className="h-3 w-3 fill-orange-400 text-orange-400 shrink-0" />
                <span className="text-xs w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="md:col-span-2 space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {review.profiles?.full_name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {review.profiles?.full_name ?? "Anonymous"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600">{review.body}</p>
          </div>
        ))}

        <div className="border border-gray-100 rounded-xl p-6 space-y-4 mt-8">
          <h3 className="font-semibold">Leave a Review</h3>
          <Textarea placeholder="Enter your review" rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Name" />
            <Input placeholder="Email" type="email" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 text-gray-300 cursor-pointer hover:fill-orange-400 hover:text-orange-400"
              />
            ))}
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">SUBMIT</Button>
        </div>
      </div>
    </div>
  );
}