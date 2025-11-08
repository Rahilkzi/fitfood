import { supabase } from "@/lib/supabase";

/**
 * 🔹 Local fallback plans — used if Supabase has no data yet.
 * You can modify these or preload them into Supabase.
 */
export const subscriptionPlans = [
  {
    id: "local-daily",
    plan_code: "daily",
    name: "Daily Fresh",
    description: "Fresh fruits delivered every single day.",
    price: 99,
    deliveries_per_week: 7,
    features: [
      "Daily delivery",
      "Premium fruit selection",
      "Flexible delivery times",
      "Cancel anytime",
    ],
  },
  {
    id: "local-weekly",
    plan_code: "weekly",
    name: "Weekly Bundle",
    description: "Enjoy fresh fruits 5 days a week.",
    price: 349,
    deliveries_per_week: 5,
    features: [
      "5 deliveries per week",
      "Variety fruit mix",
      "Weekend off",
      "Great savings",
    ],
  },
  {
    id: "local-monthly",
    plan_code: "monthly",
    name: "Monthly Saver",
    description: "Subscribe for a full month and save big.",
    price: 1299,
    deliveries_per_week: 5,
    features: [
      "20+ deliveries/month",
      "Max savings guaranteed",
      "Priority support",
      "Free delivery",
    ],
  },
];

/**
 * 🔹 Fetch plans from Supabase.
 * Falls back to `defaultPlans` if table is empty or fails.
 */
export async function getPlans() {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.warn("⚠️ Supabase fetch error, using default plans:", error.message);
      return defaultPlans;
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No plans found in Supabase, using fallback defaults.");
      return defaultPlans;
    }

    return data;
  } catch (err) {
    console.error("Error loading plans:", err.message);
    return defaultPlans;
  }
}
