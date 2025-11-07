import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  authenticateUser,
  registerUser,
  setCurrentUser,
  getCities,
} from "@/lib/store";
import { Apple, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const cities = getCities().filter((c) => c.available);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const user = authenticateUser(loginData.email, loginData.password);
    if (user) {
      setCurrentUser(user);
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "delivery":
          navigate("/delivery");
          break;
        default:
          navigate("/dashboard");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.name ||
      !registerData.phone ||
      !registerData.address ||
      !registerData.city
    ) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const newUser = registerUser({
        ...registerData,
        role: "user",
      });
      setCurrentUser(newUser);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center gap-2 mb-4'>
            <Apple className='h-10 w-10 text-green-600' />
            <h1 className='text-4xl font-bold text-green-600'>FitFood</h1>
          </div>
          <p className='text-gray-600'>Fresh fruits delivered daily</p>
        </div>

        <Tabs defaultValue='login' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='register'>Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value='login'>
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login to manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className='space-y-4'>
                  {error && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='login-email'>Email</Label>
                    <Input
                      id='login-email'
                      type='email'
                      placeholder='your@email.com'
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='login-password'>Password</Label>
                    <Input
                      id='login-password'
                      type='password'
                      placeholder='••••••••'
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-green-600 hover:bg-green-700'
                  >
                    Login
                  </Button>

                  <div className='text-sm text-gray-600 space-y-1 mt-4 p-3 bg-gray-50 rounded'>
                    <p className='font-semibold'>Demo Accounts:</p>
                    <p>User: user@example.com / user123</p>
                    <p>Admin: admin@fitfood.com / admin123</p>
                    <p>Delivery: delivery@fitfood.com / delivery123</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value='register'>
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join FitFood and start your healthy journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className='space-y-4'>
                  {error && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='register-name'>Full Name</Label>
                    <Input
                      id='register-name'
                      placeholder='John Doe'
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='register-email'>Email</Label>
                    <Input
                      id='register-email'
                      type='email'
                      placeholder='your@email.com'
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='register-password'>Password</Label>
                    <Input
                      id='register-password'
                      type='password'
                      placeholder='••••••••'
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='register-phone'>Phone</Label>
                    <Input
                      id='register-phone'
                      type='tel'
                      placeholder='+1234567890'
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='register-city'>City</Label>
                    <select
                      id='register-city'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                      value={registerData.city}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          city: e.target.value,
                        })
                      }
                      required
                    >
                      <option value=''>Select your city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='register-address'>Delivery Address</Label>
                    <Input
                      id='register-address'
                      placeholder='123 Main St, Apt 4B'
                      value={registerData.address}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          address: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-green-600 hover:bg-green-700'
                  >
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='text-center mt-4'>
          <Button
            variant='link'
            onClick={() => navigate("/")}
            className='text-green-600'
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
