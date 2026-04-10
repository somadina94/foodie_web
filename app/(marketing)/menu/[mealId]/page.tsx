"use client";

import { useParams } from "next/navigation";
import { MealDetailView } from "@/components/organisms/meal-detail-view";

export default function MealDetailPage() {
  const params = useParams();
  const mealId = typeof params.mealId === "string" ? params.mealId : "";

  if (!mealId) {
    return null;
  }

  return <MealDetailView mealId={mealId} />;
}
