import { supabase } from "@/lib/supabase";

// 🟢 Fetch the latest subscription for a user, regardless of status
export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}


// 🟠 Update subscription status (pause/resume/cancel)
export async function updateSubscriptionStatus(id, status) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// 🔴 Cancel subscription + cancel pending deliveries
export async function cancelSubscription(subscriptionId, userId) {
  // Step 1: Cancel subscription
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("id", subscriptionId);

  if (subError) throw subError;

//   // Step 2: Cancel all future deliveries
//   const today = new Date().toISOString().split("T")[0];
//   const { error: delError } = await supabase
//     .from("deliveries")
//     .update({ status: "cancelled" })
//     .eq("user_id", userId)
//     .gte("delivery_date", today);

  // Step 2: Delete all future deliveries
  const today = new Date().toISOString().split("T")[0];
  const { error: delError } = await supabase
    .from("deliveries")
    .delete()
    .eq("user_id", userId)
    .gte("delivery_date", today);


// const { error: delError } = await supabase
//   .from("deliveries")
//   .delete()
//   .eq("subscription_id", subscriptionId)
//   .gte("delivery_date", today);
    

  if (delError) throw delError;
}