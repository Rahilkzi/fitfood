import { supabase } from "@/lib/supabase";

// 🟢 Get all deliveries for a specific user
export async function getUserDeliveries(userId) {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", userId)
    .order("delivery_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

// 🟢 Create multiple deliveries (when user subscribes)
export async function createDeliveriesForSubscription(subscription, user) {
  const days = subscription.plan === "daily" ? 7 : 5;
  const deliveries = [];

  for (let i = 0; i < days; i++) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + i + 1);

    deliveries.push({
      user_id: user.id,
      subscription_id: subscription.id,
      delivery_date: deliveryDate.toISOString().split("T")[0],
      time_slot: subscription.time_slot,
      address: user.address,
      city: user.city,
      status: "pending",
    });
  }

  const { error } = await supabase.from("deliveries").insert(deliveries);
  if (error) throw error;
  return deliveries;
}

// 🟢 Update delivery status (for admin/delivery partner use)
export async function updateDeliveryStatus(id, status) {
  const { error } = await supabase
    .from("deliveries")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
