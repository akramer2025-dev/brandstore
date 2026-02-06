"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
  product: {
    name: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast.error("فشل تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      if (!response.ok) throw new Error("Failed to approve");

      toast.success("تم الموافقة على التقييم");
      fetchReviews();
    } catch (error) {
      toast.error("فشل الموافقة على التقييم");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("تم حذف التقييم");
      fetchReviews();
    } catch (error) {
      toast.error("فشل حذف التقييم");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.isApproved;
    if (filter === "approved") return review.isApproved;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin" label="العودة للوحة الإدارة" className="mb-2" />
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <Star className="w-10 h-10" />
            إدارة التقييمات
          </h1>
          <p className="text-teal-100 mt-2">
            إجمالي التقييمات: {reviews.length} | قيد المراجعة:{" "}
            {reviews.filter((r) => !r.isApproved).length}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            الكل ({reviews.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            قيد المراجعة ({reviews.filter((r) => !r.isApproved).length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
          >
            معتمد ({reviews.filter((r) => r.isApproved).length})
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card
                key={review.id}
                className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Product Name */}
                      <h3 className="text-lg font-bold mb-2">{review.product.name}</h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="mr-2 font-semibold text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <p className="text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
                          "{review.comment}"
                        </p>
                      )}

                      {/* User & Date */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold">{review.user.name}</span>
                        <span>•</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            review.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {review.isApproved ? "معتمد" : "قيد المراجعة"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mr-4">
                      {!review.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 ml-2" />
                          موافقة
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(review.id)}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold mb-2">لا توجد تقييمات</h3>
                <p className="text-gray-600">لا توجد تقييمات {filter === "pending" ? "قيد المراجعة" : filter === "approved" ? "معتمدة" : ""}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
