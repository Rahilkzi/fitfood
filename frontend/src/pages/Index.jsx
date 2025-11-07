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
import { subscriptionPlans, getCities } from "@/lib/store";
import { Apple, Clock, Truck, Shield, Check, MapPin } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const cities = getCities().filter((c) => c.available);

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50'>
      {/* Header */}
      <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Apple className='h-8 w-8 text-green-600' />
            <span className='text-2xl font-bold text-green-600'>FitFood</span>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className='bg-green-600 hover:bg-green-700'
          >
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <Badge className='mb-4 bg-green-100 text-green-700 hover:bg-green-100'>
          Fresh & Healthy
        </Badge>
        <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
          Fresh Fruits
          <br />
          <span className='text-green-600'>Delivered Daily</span>
        </h1>
        <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
          Subscribe to daily fresh fruit deliveries at your preferred time.
          Healthy living made easy.
        </p>
        <Button
          size='lg'
          onClick={() => navigate("/login")}
          className='bg-green-600 hover:bg-green-700 text-lg px-8 py-6'
        >
          Get Started Today
        </Button>
      </section>

      {/* Features */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          Why Choose FitFood?
        </h2>
        <div className='grid md:grid-cols-4 gap-8'>
          {[
            {
              icon: <Apple />,
              title: "Fresh Daily",
              text: "Handpicked fresh fruits delivered every day to your doorstep",
            },
            {
              icon: <Clock />,
              title: "Flexible Timing",
              text: "Choose morning, afternoon, or evening delivery slots",
            },
            {
              icon: <Truck />,
              title: "Fast Delivery",
              text: "Quick and reliable delivery from our local dark stores",
            },
            {
              icon: <Shield />,
              title: "Quality Assured",
              text: "100% quality guarantee on all our fresh produce",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className='border-2 hover:border-green-500 transition-colors'
            >
              <CardHeader>
                <div className='h-12 w-12 text-green-600 mb-4 mx-auto'>
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Subscription Plans */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-3xl font-bold text-center mb-4'>
          Choose Your Plan
        </h2>
        <p className='text-center text-gray-600 mb-12'>
          Select the perfect subscription for your lifestyle
        </p>
        <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className='border-2 hover:border-green-500 transition-all hover:shadow-lg'
            >
              <CardHeader>
                <CardTitle className='text-2xl'>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className='mt-4'>
                  <span className='text-4xl font-bold text-green-600'>
                    ${plan.price}
                  </span>
                  <span className='text-gray-600'>
                    /
                    {plan.id === "daily"
                      ? "week"
                      : plan.id === "weekly"
                      ? "week"
                      : "month"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3'>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className='flex items-center gap-2'>
                      <Check className='h-5 w-5 text-green-600 flex-shrink-0' />
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className='w-full mt-6 bg-green-600 hover:bg-green-700'
                  onClick={() => navigate("/login")}
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-3xl font-bold text-center mb-4'>
          Available in Your City
        </h2>
        <p className='text-center text-gray-600 mb-8'>
          We're serving fresh fruits in these cities
        </p>
        <div className='flex flex-wrap justify-center gap-4 max-w-3xl mx-auto'>
          {cities.map((city) => (
            <Badge
              key={city.id}
              variant='outline'
              className='px-4 py-2 text-base border-green-600 text-green-700'
            >
              <MapPin className='h-4 w-4 mr-2' />
              {city.name}
            </Badge>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className='container mx-auto px-4 py-16 bg-white rounded-lg my-8'>
        <h2 className='text-3xl font-bold text-center mb-12'>How It Works</h2>
        <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
          {[
            {
              step: 1,
              title: "Choose Your Plan",
              desc: "Select a subscription plan that fits your needs",
            },
            {
              step: 2,
              title: "Set Your Preferences",
              desc: "Pick your delivery time and location",
            },
            {
              step: 3,
              title: "Enjoy Fresh Fruits",
              desc: "Receive fresh fruits at your doorstep daily",
            },
          ].map((item) => (
            <div key={item.step} className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-green-600'>
                  {item.step}
                </span>
              </div>
              <h3 className='font-semibold text-xl mb-2'>{item.title}</h3>
              <p className='text-gray-600'>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <h2 className='text-4xl font-bold mb-6'>
          Ready to Start Your Healthy Journey?
        </h2>
        <p className='text-xl text-gray-600 mb-8'>
          Join thousands of happy customers enjoying fresh fruits daily
        </p>
        <Button
          size='lg'
          onClick={() => navigate("/login")}
          className='bg-green-600 hover:bg-green-700 text-lg px-8 py-6'
        >
          Subscribe Now
        </Button>
      </section>

      {/* Footer */}
      <footer className='border-t bg-white py-8'>
        <div className='container mx-auto px-4 text-center text-gray-600'>
          <p>
            &copy; 2024 FitFood. All rights reserved. Fresh fruits delivered
            with love.
          </p>
        </div>
      </footer>
    </div>
  );
}
