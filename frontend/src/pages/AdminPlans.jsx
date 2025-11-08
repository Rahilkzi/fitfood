import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Loader, Trash2, Edit3, PlusCircle } from "lucide-react";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_code: "",
    name: "",
    description: "",
    price: "",
    deliveries_per_week: "",
    features: "",
  });

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("plans").select("*").order("created_at", { ascending: true });
    if (!error) setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseInt(formData.price),
      deliveries_per_week: parseInt(formData.deliveries_per_week || 5),
      features: formData.features.split(",").map((f) => f.trim()),
    };

    let result;
    if (editingPlan) {
      result = await supabase.from("plans").update(payload).eq("id", editingPlan.id);
    } else {
      result = await supabase.from("plans").insert([payload]);
    }

    if (result.error) alert("Error saving plan: " + result.error.message);
    else {
      setFormData({ plan_code: "", name: "", description: "", price: "", deliveries_per_week: "", features: "" });
      setEditingPlan(null);
      fetchPlans();
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_code: plan.plan_code,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      deliveries_per_week: plan.deliveries_per_week,
      features: plan.features.join(", "),
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) alert("Error deleting plan");
      else fetchPlans();
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-green-600">
        <Loader className="h-6 w-6 animate-spin mr-2" /> Loading plans...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{editingPlan ? "Edit Plan" : "Add New Plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                placeholder="Plan Code (e.g. daily)"
                value={formData.plan_code}
                onChange={(e) => setFormData({ ...formData, plan_code: e.target.value })}
                required
              />
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Deliveries per week"
                value={formData.deliveries_per_week}
                onChange={(e) => setFormData({ ...formData, deliveries_per_week: e.target.value })}
              />
              <Textarea
                placeholder="Features (comma separated)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingPlan ? "Update Plan" : "Add Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <p className="text-gray-600">No plans available yet.</p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex justify-between items-center border p-3 rounded-lg bg-white/80"
                >
                  <div>
                    <p className="font-semibold text-green-700">{plan.name}</p>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    <p className="text-sm text-gray-500">
                      ₹{plan.price} • {plan.deliveries_per_week} days/week
                    </p>
                    <p className="text-xs text-gray-400">
                      Features: {plan.features.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
