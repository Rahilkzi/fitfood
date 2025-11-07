import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Adjusted imports — no TypeScript, no path aliases
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CardContent from "../components/ui/CardContent";
// import CardDescription from "../components/ui/CardDescription";
// import CardHeader from "../components/ui/CardHeader";
// import CardTitle from "../components/ui/CardTitle";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
// import TabsContent from "../components/ui/TabsContent";
// import TabsList from "../components/ui/TabsList";
// import TabsTrigger from "../components/ui/TabsTrigger";
import Table from "../components/ui/Table";
// import TableBody from "../components/ui/TableBody";
// import TableCell from "../components/ui/TableCell";
// import TableHead from "../components/ui/TableHead";
// import TableHeader from "../components/ui/TableHeader";
// import TableRow from "../components/ui/TableRow";

// ✅ Fake store functions (replace with static JS later)
import {
  getCurrentUser,
  logout,
  getUsers,
  getSubscriptions,
  getDeliveries,
  getAnalytics,
  updateSubscriptionStatus,
} from "../lib/store";

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
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [analytics, setAnalytics] = useState(getAnalytics());
  const [users, setUsers] = useState(
    getUsers().filter((u) => u.role === "user")
  );
  const [subscriptions, setSubscriptions] = useState(getSubscriptions());
  const [deliveries, setDeliveries] = useState(getDeliveries());

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    setAnalytics(getAnalytics());
    setUsers(getUsers().filter((u) => u.role === "user"));
    setSubscriptions(getSubscriptions());
    setDeliveries(getDeliveries());
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubscriptionAction = (id, action) => {
    updateSubscriptionStatus(id, action);
    loadData();
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: "default", icon: CheckCircle },
      paused: { variant: "secondary", icon: Pause },
      cancelled: { variant: "destructive", icon: XCircle },
      pending: { variant: "outline", icon: CheckCircle },
      "in-transit": { variant: "default", icon: CheckCircle },
      delivered: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
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

  if (!user) return null;

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
            <span className='text-gray-700'>Admin: {user.name}</span>
            <Button variant='outline' size='sm' onClick={handleLogout}>
              <LogOut className='h-4 w-4 mr-2' />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        {/* Stats */}
        <div className='grid md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{analytics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Subscriptions
              </CardTitle>
              <Package className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.activeSubscriptions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <DollarSign className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${analytics.totalRevenue}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                Completed Deliveries
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.completedDeliveries}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue='users' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='users'>Users</TabsTrigger>
            <TabsTrigger value='subscriptions'>Subscriptions</TabsTrigger>
            <TabsTrigger value='deliveries'>Deliveries</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value='users'>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className='font-medium'>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.city}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value='subscriptions'>
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage all user subscriptions</CardDescription>
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
                      const subUser = users.find((u) => u.id === sub.userId);
                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            {subUser ? subUser.name : "Unknown"}
                          </TableCell>
                          <TableCell>{sub.plan}</TableCell>
                          <TableCell>{sub.timeSlot}</TableCell>
                          <TableCell>${sub.price}</TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              {sub.status === "paused" && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleSubscriptionAction(sub.id, "active")
                                  }
                                >
                                  Activate
                                </Button>
                              )}
                              {sub.status === "active" && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleSubscriptionAction(sub.id, "paused")
                                  }
                                >
                                  Pause
                                </Button>
                              )}
                              {sub.status !== "cancelled" && (
                                <Button
                                  size='sm'
                                  variant='destructive'
                                  onClick={() =>
                                    handleSubscriptionAction(
                                      sub.id,
                                      "cancelled"
                                    )
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliveries */}
          <TabsContent value='deliveries'>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Schedule</CardTitle>
                <CardDescription>
                  View all scheduled and completed deliveries
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
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.slice(0, 20).map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>{delivery.userName}</TableCell>
                        <TableCell>
                          {new Date(delivery.deliveryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{delivery.timeSlot}</TableCell>
                        <TableCell>{delivery.city}</TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {delivery.address}
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value='analytics'>
            <Card>
              <CardHeader>
                <CardTitle>City-wise Performance</CardTitle>
                <CardDescription>Performance metrics by city</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Total Users</TableHead>
                      <TableHead>Active Subscriptions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.cityStats.map((stat) => (
                      <TableRow key={stat.city}>
                        <TableCell>{stat.city}</TableCell>
                        <TableCell>{stat.users}</TableCell>
                        <TableCell>{stat.subscriptions}</TableCell>
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
