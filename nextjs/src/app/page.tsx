import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  ListFilter,
  Mail,
  Star,
  Home as HomeIcon, // Renamed to avoid conflict with component name
} from "lucide-react";
import AuthAwareButtons from "@/components/AuthAwareButtons";

export default function Home() {
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  const featuredProperties = [
    {
      name: "Modern Downtown Apartment",
      description: "Luxurious 2-bedroom apartment in the heart of downtown",
      tags: ["Residential", "Apartment", "Downtown"],
      rating: "4.8",
      image: "/stock-photos/apartment_1.jpg",
    },
    {
      name: "Hillside Family Home",
      description:
        "Spacious 4-bedroom home with amazing views and private yard",
      tags: ["Residential", "House", "Suburban"],
      rating: "4.7",
      image: "/stock-photos/apartment_2.jpg",
    },
    {
      name: "Waterfront Condo",
      description: "Beautiful 1-bedroom condo with waterfront views",
      tags: ["Residential", "Condo", "Waterfront"],
      rating: "4.9",
      image: "/stock-photos/apartment_3.jpg",
    },
  ];

  const features = [
    {
      icon: CalendarDays,
      title: "Schedule Your Way",
      description:
        "Set your own property viewing schedule and receive notifications at the time that works best for you.",
      color: "text-primary-600",
    },
    {
      icon: ListFilter,
      title: "Personalized Results",
      description:
        "Get property recommendations tailored to your specific needs and preferences.",
      color: "text-secondary-600",
    },
    {
      icon: Mail,
      title: "Seamless Communication",
      description:
        "Stay connected with property owners and tenants through our secure messaging system.",
      color: "text-primary-700",
    },
  ];

  const testimonials = [
    {
      text: "This platform has completely transformed how I manage my rental properties. Highly recommended!",
      author: "Sarah Johnson",
      role: "Property Owner",
    },
    {
      text: "I found my dream apartment in just a few days. The search filters are incredibly helpful.",
      author: "Michael Chen",
      role: "Tenant",
    },
    {
      text: "The best property management tool I've used in years. Worth every penny.",
      author: "David Rodriguez",
      role: "Property Manager",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {productName}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#how-it-works"
                className="font-semibold text-gray-500 hover:text-gray-900"
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className="font-semibold text-gray-500 hover:text-gray-900"
              >
                About
              </Link>
              <AuthAwareButtons variant="nav" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-headline">
              Never Miss the Perfect Property
              <span className="block text-primary-600 mt-2">
                Find Your Dream Home Today
              </span>
            </h1>
            <p className="mt-6 text-xl text-subhead max-w-3xl mx-auto">
              Your personalized property search assistant. Find, manage, and
              secure your ideal property with ease.
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-6 py-3 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="px-6 py-3 text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-lg font-medium transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Preview Section */}
      <section className="py-16 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-primary-50">
              <h2 className="text-xl font-semibold text-primary-800">
                Your Daily Property Recommendations
              </h2>
              <p className="text-sm text-gray-500">Today at 9:00 AM</p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Featured Properties
              </h3>
              <div className="space-y-4">
                {featuredProperties.map((property, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-16 w-16 flex-shrink-0 relative rounded-md overflow-hidden">
                      <Image
                        src={property.image}
                        alt={property.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-900">
                        {property.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {property.description}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="ml-1 text-sm text-gray-600">
                          {property.rating} rating
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary-700 flex items-center">
              <Star className="mr-2 h-5 w-5" />
              New to Property Management?
            </h2>
            <p className="mt-4 text-gray-600">
              No worries — we've got you covered. Property management can be
              complex, but our platform simplifies everything from listing
              properties to managing tenants and maintenance requests. Think of
              it as your all-in-one solution for property management, updated
              with the latest tools and technologies.
            </p>
            <p className="mt-4 text-gray-600">
              At {productName}, we handle all aspects of property management for
              you — and deliver exactly what you need, when you need it.
            </p>
            <p className="mt-4 text-primary-700 font-medium flex items-center">
              <HomeIcon className="mr-2 h-5 w-5" /> No stress. No complexity.
              Just results.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-headline">
              Make Property Management Work for You
            </h2>
            <p className="mt-4 text-xl text-subhead">
              {productName} delivers a comprehensive property management
              solution, customized exactly how you like it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <feature.icon className={`h-10 w-10 ${feature.color}`} />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Highlights Section */}
      <section
        id="about"
        className="py-20 bg-gradient-to-b from-white to-primary-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-headline">
              Discover Amazing Properties
            </h2>
            <p className="mt-4 text-xl text-subhead">
              Browse through our selection of high-quality properties
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="h-48 w-full relative">
                  <Image
                    src={property.image}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {property.name}
                  </h3>
                  <p className="mt-2 text-gray-600">{property.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="ml-1 text-gray-700">
                        {property.rating} rating
                      </span>
                    </div>
                    <Link
                      href={`/properties/${index + 1}`}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Try {productName}?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Join now and get full access to all features - completely free for
            14 days.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            Get Started - It's Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-headline">Wall of Love</h2>
            <p className="mt-4 text-xl text-subhead">
              See what our users are saying about {productName}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <p className="text-gray-600 italic">{testimonial.text}</p>
                <div className="mt-4">
                  <p className="font-medium text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {productName}
              </span>
              <p className="mt-2 text-sm text-gray-600">
                {productName} delivers your personalized property management
                experience exactly when and how you want it.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Product</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/legal"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/legal/privacy"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} {productName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
