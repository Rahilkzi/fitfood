import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";


import {
  Apple,
  Calendar,
  Clock,
  MapPin,
  Package,
  Play,
  Pause,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import {
  logout
} from "@/lib/store";

import { getUserDeliveries, createDeliveriesForSubscription } from "@/lib/delivery";
import { getUserSubscription, updateSubscriptionStatus, cancelSubscription  } from "@/lib/subscription";
// import { subscriptionPlans } from "@/lib/plans";

import { getPlans } from "@/lib/plans";
import { supabase } from "@/lib/supabase";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("morning");
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", phone: "", address: "" });

  // 🧠 Helper: Load subscription & delivery data from store
  const loadData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const [deliveries, sub] = await Promise.all([
        getUserDeliveries(currentUser.id),
        getUserSubscription(currentUser.id),
      ]);

      setDeliveries(deliveries);
      setSubscription(sub);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, []);

  // 🧠 Helper: Fetch subscription plans

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
    };
    fetchPlans();
  }, []);




  // 🟢 Check Supabase session on mount
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      setLoading(true);

      // ✅ 1. Get the current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
        if (mounted) navigate("/login", { replace: true });
        return;
      }

      if (!session) {
        // ✅ 2. No session → go to login
        if (mounted) {
          setLoading(false);
          navigate("/login", { replace: true });
        }
        return;
      }

      // ✅ 3. Fetch user profile only once we have a session
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch failed:", profileError);
        await supabase.auth.signOut(); // logout broken session
        if (mounted) navigate("/login", { replace: true });
        return;
      }

      const userData = { ...profile, email: session.user.email };
      if (mounted) {
        setUser(userData);
        setProfileData({
          name: profile.name || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
        await loadData(userData);
        setLoading(false);
      }
    };

    checkSession();

    // ✅ 4. Subscribe to auth state changes — no flicker
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadData]);

  // 🟢 Subscribe to plan
  const handleSubscribe = async () => {
    if (!user) return;

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      alert("Invalid plan selected.");
      return;
    }

    try {
      // Step 1: Create new subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            plan: plan.id,
            time_slot: selectedTimeSlot,
            status: "active",
            start_date: new Date().toISOString(),
            price: plan.price,
          },
        ])
        .select()
        .single();

      if (subError) throw subError;

      // Step 2: Schedule deliveries
      await createDeliveriesForSubscription(subData, user);

      // Step 3: Update local state
      setShowSubscribe(false);
      await loadData(user);

      alert("🎉 Subscription created successfully! Deliveries scheduled.");
    } catch (err) {
      console.error("❌ Error creating subscription:", err.message);
      alert(`Failed to subscribe: ${err.message}`);
    }
  };


  // ⏯ Pause / Resume subscription
  const handlePauseResume = async () => {
    if (!subscription) return;

    const newStatus = subscription.status === "active" ? "paused" : "active";

    try {
      // Step 1: Update subscription in Supabase
      await updateSubscriptionStatus(subscription.id, newStatus);

      // Step 2: Optional — pause/resume deliveries for realism
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("deliveries")
        .update({ status: newStatus === "paused" ? "paused" : "pending" })
        .eq("user_id", user.id)
        .gte("delivery_date", today);

      // Step 3: Fetch updated subscription
      const { data: updatedSub, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscription.id)
        .single();

      if (error) throw error;

      // Step 4: Update local states immediately
      setSubscription(updatedSub);
      await loadData(user);

      // Step 5: Confirmation alert
      // alert(
      //   `Subscription ${newStatus === "paused" ? "paused" : "resumed"} successfully`
      // );
    } catch (err) {
      console.error(err);
      alert("Failed to update subscription status");
    }
  };




  // ❌ Cancel subscription
  const handleCancel = async () => {
    if (!subscription) return;
    const confirmCancel = confirm("Are you sure you want to cancel your subscription?");
    if (!confirmCancel) return;

    try {
      await cancelSubscription(subscription.id, user.id);
      alert("Subscription cancelled successfully.");
      await loadData(user);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel subscription. Please try again.");
    }
  };


  // 🧾 Update profile info
  const handleUpdateProfile = () => {
    if (!user) return;
    updateUser(user.id, profileData);
    setUser({ ...user, ...profileData });
    setEditProfile(false);
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/", { replace: true });
  };

  // 🏷️ Badge helper
  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: "default", icon: CheckCircle },
      paused: { variant: "secondary", icon: Pause },
      cancelled: { variant: "destructive", icon: XCircle },
      pending: { variant: "outline", icon: Clock },
      "in-transit": { variant: "default", icon: Loader },
      delivered: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-green-700">
        <Loader className="h-8 w-8 animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Apple className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">FitFood</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* 🧺 Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {subscription && subscription.status !== "cancelled" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Subscription</CardTitle>
                      <CardDescription>
                        Manage your active subscription
                      </CardDescription>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Plan Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                         <span className="capitalize font-medium">
                          {(() => {
                            const planInfo = plans.find((p) => p.id === subscription.plan);
                            return planInfo ? planInfo.name : "Unknown Plan";
                          })()}{" "}
                          Plan
                        </span>

                        </div>


                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span className="capitalize">
                            {subscription.time_slot} Delivery
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <span>
                            Next:{" "}
                            {(() => {
                                const nextDelivery = deliveries
                                  ?.filter((d) => d.status === "pending")
                                  ?.sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date))[0];

                                if (!nextDelivery) return "Not Scheduled";
                                return new Date(nextDelivery.delivery_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                });
                              })()}

                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                        ₹{subscription.price}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Actions</h3>
                      <div className="space-y-3">
                        {subscription.status === "active" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handlePauseResume}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Subscription
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={handlePauseResume}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume Subscription
                        </Button>
                      )}

                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleCancel}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Subscription</CardTitle>
                  <CardDescription>
                    Choose a plan to start receiving fresh fruits daily
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showSubscribe ? (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setShowSubscribe(true)}
                    >
                      Subscribe Now
                    </Button>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label className="mb-3 block">Select Plan</Label>
                        <div className="grid md:grid-cols-3 gap-4">
                          {plans.map((plan) => (
                            <Card
                              key={plan.id}
                              className={`cursor-pointer transition-all ${
                                selectedPlan === plan.id
                                  ? "border-green-600 border-2"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedPlan(plan.id)}
                            >
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                  {plan.name}
                                </CardTitle>
                                <CardDescription className="text-gray-600 mb-2">
                                  {plan.description}
                                </CardDescription>
                                <div className="text-2xl font-bold text-green-600 mb-2">
                                  ₹{plan.price}
                                </div>
                                <div className="text-sm text-gray-700 mb-3">
                                  Deliveries per week: <b>{plan.deliveries_per_week}</b>
                                </div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <span>✅</span> {feature}
                                    </li>
                                  ))}
                                </ul>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Delivery Time</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {["morning", "afternoon", "evening"].map((slot) => (
                            <Button
                              key={slot}
                              variant={
                                selectedTimeSlot === slot
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={
                                selectedTimeSlot === slot
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                            >
                              {slot.charAt(0).toUpperCase() + slot.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleSubscribe}
                        >
                          Confirm Subscription
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowSubscribe(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 🚚 Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>
                  Track your past and upcoming deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveries.length > 0 ? (
                  <div className="space-y-4">
                    {deliveries.map((delivery) => (
                      <Card key={delivery.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">
                                 {new Date(delivery.delivery_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",})}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="capitalize text-gray-600">
                                  {delivery.time_slot}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-600" />
                                <span className="text-gray-600">
                                  {delivery.address}
                                </span>
                              </div>
                            </div>
                            <div>{getStatusBadge(delivery.status)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No deliveries yet. Subscribe to a plan to get started!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 👤 Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editProfile ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Name:</span>
                        <span>{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">City:</span>
                        <span>{user.city}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Address:</span>
                        <span>{user.address}</span>
                      </div>
                    </div>
                    <Button onClick={() => setEditProfile(true)}>
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {["name", "phone", "address"].map((field) => (
                      <div key={field}>
                        <Label>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </Label>
                        <Input
                          value={profileData[field]}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              [field]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleUpdateProfile}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
