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
      icon: <Smartphone className="w-6 h-6 text-white" />,
    },
    {
      number: "02",
      title: "Match & Assign",
      description:
        "Our system automatically assigns the nearest available porter",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    {
      number: "03",
      title: "Track Live",
      description: "Monitor the delivery progress in real-time",
      icon: <MapPin className="w-6 h-6 text-white" />,
    },
    {
      number: "04",
      title: "Receive & Rate",
      description: "Confirm delivery and provide feedback",
      icon: <Star className="w-6 h-6 text-white" />,
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



  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FFFEE9] overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-32 bg-[#e0f470]">

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left relative"
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
              <span className="text-8xl text-primary">
                DOKO Namlo
              </span>
              <br />
              <span className="text-primary">Reinventing Porter Hailing</span>
            </motion.h1>



            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-start items-center mb-16"
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
                    Book Porters
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-linear-to-r from-blue-700 to-indigo-700"
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

                  Sign In
                </Link>
              </motion.div>
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

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for{" "}
              <span className="text-primary">
                Seamless Operations
              </span>
            </h2>

          </motion.div>

          <div className="flex justify-center w-full">
            <div className="flex flex-col md:flex-row flex-nowrap justify-center gap-4 lg:gap-8 w-full max-w-7xl px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.0, delay: index * 0.3, ease: "easeOut" }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="w-full md:flex-1"
                >
                  <div className="bg-primary p-8 rounded-3xl shadow-xl h-full flex flex-col min-h-[350px] relative overflow-hidden group border border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                    <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner relative z-10">
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                      {feature.title}
                    </h3>

                    <p className="text-white/80 leading-relaxed text-sm relative z-10">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-[#FFFEE9]"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple{" "}
              <span className="bg-primary bg-clip-text text-transparent">
                4-Step
              </span>{" "}
              Process
            </h2>
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
                <div className="relative bg-primary rounded-3xl p-8 shadow-xl h-full overflow-hidden group border border-white/10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="text-5xl font-bold text-white">
                      {step.number}
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-white">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-white/80 relative z-10">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-20">
                    <ChevronRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 bg-[#FFFEE9]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our{" "}
              <span className="bg-primary bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
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
                className="bg-linear-to-r from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
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
                    className="bg-[#e0f470] text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#d9ec6d] transition-all duration-300 inline-flex items-center shadow-lg"
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
                    className="bg-transparent border-2 border-[#e0f470] text-[#e0f470] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e0f470] hover:text-primary transition-all duration-300 inline-flex items-center"
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
