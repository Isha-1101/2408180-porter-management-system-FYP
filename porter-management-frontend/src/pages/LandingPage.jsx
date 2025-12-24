import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Users,
  Package,
  BarChart3,
  Shield,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
  Truck,
  Smartphone,
} from "lucide-react";
import Chatbot from "../components/common/ChatBox";

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Smart Porter Assignment",
      description:
        "AI-powered porter allocation based on location, availability, and expertise",
      color: "from-blue-500 to-cyan-400",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-400",
    },
    {
      icon: <Package className="w-8 h-8 text-white" />,
      title: "Real-Time Tracking",
      description:
        "Live GPS tracking of deliveries with ETA predictions and status updates",
      color: "from-purple-500 to-pink-400",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-400",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights into delivery performance and porter efficiency",
      color: "from-green-500 to-emerald-400",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-400",
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Secure & Reliable",
      description:
        "End-to-end encrypted communications and secure payment processing",
      color: "from-orange-500 to-amber-400",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-400",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Book a Porter",
      description: "Select your requirements and schedule instantly",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
    },
    {
      number: "02",
      title: "Match & Assign",
      description:
        "Our system automatically assigns the nearest available porter",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      number: "03",
      title: "Track Live",
      description: "Monitor the delivery progress in real-time",
      icon: <MapPin className="w-6 h-6 text-primary" />,
    },
    {
      number: "04",
      title: "Receive & Rate",
      description: "Confirm delivery and provide feedback",
      icon: <Star className="w-6 h-6 text-primary" />,
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Shrestha",
      role: "Business Owner",
      content:
        "Doko Namlo transformed our delivery operations. Efficiency increased by 40%!",
      rating: 5,
      avatar: "RS",
    },
    {
      name: "Sunita Gurung",
      role: "Restaurant Manager",
      content:
        "The real-time tracking feature is a game-changer for our food deliveries.",
      rating: 5,
      avatar: "SG",
    },
    {
      name: "Amit Kumar",
      role: "E-commerce Entrepreneur",
      content: "Best porter management system in Nepal. Highly recommended!",
      rating: 4,
      avatar: "AK",
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      text: "24/7 Service Available",
    },
    {
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      text: "Affordable Pricing",
    },
    {
      icon: <Truck className="w-5 h-5 text-primary" />,
      text: "Nationwide Coverage",
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      text: "Safe & Secure",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-32 bg-[url('/images/background_image_porter.png')] bg-center bg-cover bg-no-repeat">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-8 relative"
            >
              <div className="relative">
                {/* <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trusted by 500+ Businesses
                </span> */}
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-br from-primary to-red-200 bg-clip-text text-8xl text-transparent">
                DOKO Namlo
              </span>
              <br />
              <span className="text-white">Revolutionizing Delivery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Nepal's premier porter management system. Streamline your delivery
              operations with intelligent porter allocation, real-time tracking,
              and comprehensive analytics.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="group relative bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 shadow-lg inline-flex items-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 inline-flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Existing User? Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                {
                  value: "10K+",
                  label: "Active Porters",
                  icon: <Users className="w-5 h-5 text-primary" />,
                },
                {
                  value: "250K+",
                  label: "Deliveries",
                  icon: <Package className="w-5 h-5 text-primary" />,
                },
                {
                  value: "99.8%",
                  label: "Success Rate",
                  icon: <CheckCircle className="w-5 h-5 text-primary" />,
                },
                {
                  value: "24/7",
                  label: "Support",
                  icon: <Clock className="w-5 h-5 text-primary" />,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-blue-600">{stat.icon}</div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-white/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                Seamless Operations
              </span>
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Everything you need to manage your porter operations efficiently
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative cursor-pointer transform transition-all duration-300`}
                >
                  <div
                    className={`${feature.gradient} p-6 rounded-2xl shadow-xl h-full`}
                  >
                    <div className="text-white mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative"
              >
                <div className="bg-primary rounded-3xl p-8 shadow-2xl">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">
                      {features[currentFeature].title}
                    </span>
                  </div>

                  {/* Preview Content */}
                  <div className="space-y-4 mb-6">
                    <div className="h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 w-full"></div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 w-3/4"></div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 w-5/6"></div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 w-2/3"></div>
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-white font-bold">95%</div>
                      <div className="text-gray-400 text-xs">Success Rate</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-white font-bold">15min</div>
                      <div className="text-gray-400 text-xs">Avg. Response</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-white font-bold">4.8★</div>
                      <div className="text-gray-400 text-xs">Rating</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-300 text-sm">
                      Experience the power of{" "}
                      {features[currentFeature].title.toLowerCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-4">
              Process
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple{" "}
              <span className="bg-primary bg-clip-text text-transparent">
                4-Step
              </span>{" "}
              Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book a porter in minutes and track everything in real-time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-5xl font-bold text-blue-100">
                      {step.number}
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-primary text-sm font-semibold mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our{" "}
              <span className="bg-primary bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied businesses already using Doko Namlo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-950 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  {renderStars(testimonial.rating)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 ">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl overflow-hidden"
          >
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div> */}

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Delivery Operations?
              </h3>
              <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of businesses across Nepal already using Doko
                Namlo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="bg-white text-secondary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center shadow-lg"
                  >
                    Start Free 14-Day Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/60 transition-all duration-300"
                  >
                    Schedule a Demo
                  </Link>
                </motion.div>
              </div>
              <p className="mt-8 text-blue-200 text-sm">
                No credit card required • Cancel anytime • 24/7 support
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Action Button */}

      <Chatbot />

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
