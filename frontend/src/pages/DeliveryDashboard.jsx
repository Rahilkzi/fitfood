import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getCurrentUser,
  logout,
  getDeliveryPartnerDeliveries,
  updateDeliveryStatus,
} from "@/lib/store";
import {
  Apple,
  Clock,
  MapPin,
  Package,
  LogOut,
  CheckCircle,
  XCircle,
  Loader,
  TrendingUp,
} from "lucide-react";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      navigate("/login");
      return;
    }
    loadDeliveries();
  }, [user, selectedDate, navigate]);

  const loadDeliveries = () => {
    if (!user) return;
    const dels = getDeliveryPartnerDeliveries(user.id, selectedDate);
    setDeliveries(dels);
  };

  const handleStatusUpdate = (deliveryId, status) => {
    updateDeliveryStatus(deliveryId, status);
    loadDeliveries();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "outline", icon: Clock },
      "in-transit": { variant: "default", icon: Loader },
      delivered: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className='capitalize flex items-center'>
        <Icon className='h-3 w-3 mr-1' />
        {status}
      </Badge>
    );
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "pending").length,
    inTransit: deliveries.filter((d) => d.status === "in-transit").length,
    completed: deliveries.filter((d) => d.status === "delivered").length,
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
              FitFood Delivery
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-gray-700'>Delivery Partner: {user.name}</span>
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
              <CardTitle className='text-sm font-medium'>
                Total Deliveries
              </CardTitle>
              <Package className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <Clock className='h-4 w-4 text-gray-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>In Transit</CardTitle>
              <Loader className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.inTransit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <TrendingUp className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Selector */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            />
          </CardContent>
        </Card>

        {/* Deliveries List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Deliveries</CardTitle>
            <CardDescription>
              Manage your delivery routes for{" "}
              {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveries.length > 0 ? (
              <div className='space-y-4'>
                {deliveries.map((delivery) => (
                  <Card key={delivery.id} className='border-2'>
                    <CardContent className='pt-6'>
                      <div className='flex items-start justify-between mb-4'>
                        <div className='space-y-2 flex-1'>
                          <div className='flex items-center gap-2'>
                            <Package className='h-5 w-5 text-green-600' />
                            <span className='font-semibold text-lg'>
                              {delivery.userName}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-gray-600'>
                            <Clock className='h-4 w-4' />
                            <span className='capitalize'>
                              {delivery.timeSlot} Delivery
                            </span>
                          </div>
                          <div className='flex items-start gap-2 text-gray-600'>
                            <MapPin className='h-4 w-4 mt-1 flex-shrink-0' />
                            <div>
                              <div>{delivery.address}</div>
                              <div className='text-sm'>{delivery.city}</div>
                            </div>
                          </div>
                        </div>
                        <div>{getStatusBadge(delivery.status)}</div>
                      </div>

                      <div className='flex gap-2 mt-4'>
                        {delivery.status === "pending" && (
                          <Button
                            size='sm'
                            className='bg-blue-600 hover:bg-blue-700'
                            onClick={() =>
                              handleStatusUpdate(delivery.id, "in-transit")
                            }
                          >
                            <Loader className='h-4 w-4 mr-2' />
                            Start Delivery
                          </Button>
                        )}
                        {delivery.status === "in-transit" && (
                          <>
                            <Button
                              size='sm'
                              className='bg-green-600 hover:bg-green-700'
                              onClick={() =>
                                handleStatusUpdate(delivery.id, "delivered")
                              }
                            >
                              <CheckCircle className='h-4 w-4 mr-2' />
                              Mark Delivered
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() =>
                                handleStatusUpdate(delivery.id, "failed")
                              }
                            >
                              <XCircle className='h-4 w-4 mr-2' />
                              Mark Failed
                            </Button>
                          </>
                        )}
                        {delivery.status === "delivered" && (
                          <Badge variant='default' className='bg-green-600'>
                            <CheckCircle className='h-4 w-4 mr-2' />
                            Completed
                          </Badge>
                        )}
                        {delivery.status === "failed" && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleStatusUpdate(delivery.id, "pending")
                            }
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='text-center py-12 text-gray-600'>
                <Package className='h-16 w-16 mx-auto mb-4 text-gray-400' />
                <p className='text-lg'>No deliveries scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
