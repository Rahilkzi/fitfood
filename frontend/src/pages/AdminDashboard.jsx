import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import AdminPlans from "./AdminPlans";

import {
  Apple,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  LogOut,
  CheckCircle,
  XCircle,
  Pause,
  Loader,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    completedDeliveries: 0,
    cityStats: [],
  });

  // 🟢 Check admin session
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      setLoading(true);

      // 1️⃣ Get current session safely
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
        if (mounted) navigate("/login", { replace: true });
        return;
      }

      // 2️⃣ No session = go to login
      if (!session) {
        if (mounted) {
          setLoading(false);
          navigate("/login", { replace: true });
        }
        return;
      }

      // 3️⃣ Validate admin role
      const role = session.user?.user_metadata?.role;
      if (role !== "admin") {
        if (mounted) navigate("/dashboard", { replace: true });
        return;
      }

      // 4️⃣ Session and admin OK
      if (mounted) {
        setUser(session.user);
        await loadData();
        setLoading(false);
      }
    };

    checkSession();

    // 5️⃣ Watch auth changes — no flicker on refresh
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
  }, [navigate]);

  // 🧠 Helper: Fetch subscription plans
  const [plans, setPlans] = useState([]);

  // 🧩 Load data from Supabase
  const loadData = async () => {
    try {
      const [
        { data: userData },
        { data: subData },
        { data: delData },
        { data: planData },
      ] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("deliveries").select("*"),
        supabase.from("plans").select("*"), // 👈 load plans too
      ]);

      setUsers(userData || []);
      setSubscriptions(subData || []);
      setDeliveries(delData || []);
      setPlans(planData || []);

      // Analytics summary
      const totalUsers = (userData || []).length;
      const activeSubs = (subData || []).filter(
        (s) => s.status === "active"
      ).length;
      const totalRevenue = (subData || [])
        .filter((s) => s.status === "active")
        .reduce((sum, s) => sum + (s.price || 0), 0);
      const completedDeliveries = (delData || []).filter(
        (d) => d.status === "delivered"
      ).length;

      const cities = [
        ...new Set((userData || []).map((u) => u.city).filter(Boolean)),
      ];
      const cityStats = cities.map((city) => ({
        city,
        users: userData.filter((u) => u.city === city).length,
        subscriptions: subData.filter((s) => {
          const user = userData.find((u) => u.id === s.user_id);
          return user?.city === city && s.status === "active";
        }).length,
      }));

      setAnalytics({
        totalUsers,
        activeSubscriptions: activeSubs,
        totalRevenue,
        completedDeliveries,
        cityStats,
      });
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  //plans
  <Link
    to='/admin/plans'
    className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition'
  >
    <PlusCircle className='h-5 w-5' />
    Manage Subscription Plans
  </Link>;

  // 🧭 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  // ⚙️ Update subscription status
  const handleSubscriptionAction = async (id, status, userId) => {
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({ status })
      .eq("id", id);

    if (subError) {
      alert("Failed to update subscription");
      return;
    }

    // If cancelled, delete future deliveries
    if (status === "cancelled") {
      const today = new Date().toISOString().split("T")[0];
      const { error: delError } = await supabase
        .from("deliveries")
        .delete()
        .eq("subscription_id", id)
        .gte("delivery_date", today);

      if (delError) console.error("Failed to delete deliveries:", delError);
    }

    loadData();
  };

  // 🎨 Badge helper
  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: "default", icon: CheckCircle },
      paused: { variant: "secondary", icon: Pause },
      cancelled: { variant: "destructive", icon: XCircle },
      delivered: { variant: "default", icon: CheckCircle },
      pending: { variant: "outline", icon: Loader },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className='capitalize'>
        <Icon className='h-3 w-3 mr-1' />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen text-green-700'>
        <Loader className='h-8 w-8 animate-spin mr-2' /> Loading admin
        dashboard...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50'>
      {/* Header */}
      <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Apple className='h-8 w-8 text-green-600' />
            <span className='text-2xl font-bold text-green-600'>
              FitFood Admin
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-gray-700'>
              {user?.email?.split("@")[0]} (Admin)
            </span>
            <Button variant='outline' size='sm' onClick={handleLogout}>
              <LogOut className='h-4 w-4 mr-2' />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8 space-y-8'>
        {/* Stats */}
        <div className='grid md:grid-cols-4 gap-6'>
          <StatCard
            title='Total Users'
            value={analytics.totalUsers}
            icon={Users}
          />
          <StatCard
            title='Active Subscriptions'
            value={analytics.activeSubscriptions}
            icon={Package}
          />
          <StatCard
            title='Total Revenue'
            value={`₹${analytics.totalRevenue}`}
            icon={DollarSign}
          />
          <StatCard
            title='Completed Deliveries'
            value={analytics.completedDeliveries}
            icon={TrendingUp}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue='users'>
          <TabsList>
            <TabsTrigger value='users'>Users</TabsTrigger>
            <TabsTrigger value='subscriptions'>Subscriptions</TabsTrigger>
            <TabsTrigger value='deliveries'>Deliveries</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          {/* Manage Plans Button */}
          <div className='flex justify-end'>
            <Link
              to='/admin/plans'
              className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition'
            >
              <PlusCircle className='h-5 w-5' />
              Manage Subscription Plans
            </Link>
          </div>

          {/* 👥 Users Tab */}
          <TabsContent value='users'>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered FitFood users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.city}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📦 Subscriptions Tab */}
          <TabsContent value='subscriptions'>
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Manage user subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const subUser = users.find((u) => u.id === sub.user_id);
                      const planInfo = plans.find((p) => p.id === sub.plan);

                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            {subUser?.name || subUser?.email || "Unknown"}
                          </TableCell>

                          <TableCell>
                            {planInfo?.name || "Unknown Plan"}
                          </TableCell>

                          <TableCell>{sub.time_slot}</TableCell>
                          <TableCell>₹{sub.price}</TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell className='flex gap-2'>
                            {sub.status === "active" ? (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleSubscriptionAction(sub.id, "paused")
                                }
                              >
                                Pause
                              </Button>
                            ) : sub.status === "paused" ? (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleSubscriptionAction(sub.id, "active")
                                }
                              >
                                Resume
                              </Button>
                            ) : null}
                            {sub.status !== "cancelled" && (
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() =>
                                  handleSubscriptionAction(
                                    sub.id,
                                    "cancelled",
                                    sub.user_id
                                  )
                                }
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 🚚 Deliveries Tab */}
          <TabsContent value='deliveries'>
            <Card>
              <CardHeader>
                <CardTitle>Deliveries</CardTitle>
                <CardDescription>
                  All scheduled and completed deliveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.slice(0, 30).map((d) => {
                      const delUser = users.find((u) => u.id === d.user_id);
                      return (
                        <TableRow key={d.id}>
                          <TableCell>{delUser?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {new Date(d.delivery_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{d.time_slot}</TableCell>
                          <TableCell>{d.city}</TableCell>
                          <TableCell>{getStatusBadge(d.status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📊 Analytics Tab */}
          <TabsContent value='analytics'>
            <Card>
              <CardHeader>
                <CardTitle>City Performance</CardTitle>
                <CardDescription>Users & subscriptions by city</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Active Subscriptions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.cityStats.map((c) => (
                      <TableRow key={c.city}>
                        <TableCell>{c.city}</TableCell>
                        <TableCell>{c.users}</TableCell>
                        <TableCell>{c.subscriptions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ✅ Small subcomponent for stat cards
function StatCard({ title, value, icon: Icon }) {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-green-600' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
      </CardContent>
    </Card>
  );
}
