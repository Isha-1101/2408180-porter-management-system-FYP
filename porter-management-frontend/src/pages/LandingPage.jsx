import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Package,
  BarChart3,
  Shield,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  Monitor
} from "lucide-react";
import Chatbot from "../components/common/ChatBox";

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Smart Porter Assignment",
      description: "AI-powered porter allocation based on location, availability, and expertise."
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Real-Time Tracking",
      description: "Live GPS tracking of deliveries with ETA predictions and status updates."
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Secure & Reliable",
      description: "End-to-end encrypted communications and secure payment processing."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into delivery performance and porter efficiency."
    }
  ];

  const faqs = [
    {
      question: "How do I book a porter?",
      answer: "Booking a porter is easy. Simply create an account, enter your pickup and drop-off locations, write the description, and confirm your booking. Our system will assign the nearest available porter."
    },
    {
      question: "Are my goods safe during transit?",
      answer: "Yes, we prioritize security. All our porters are verified, and you can track your delivery in real-time. We also offer secure payment processing."
    },
    {
      question: "How long does assignment take?",
      answer: "Our smart assignment system typically finds a porter within minutes, depending on your location and the time of day. Pre-booking feature can be used in case of team porter booking"
    },
    {
      question: "What areas do you cover?",
      answer: "We currently cover major metropolitan areas across Nepal, with plans to expand nationwide soon."
    }
  ];

  return (
    <div className="min-h-screen bg-[#EBECE1] font-sans text-gray-900 selection:bg-primary selection:text-white pb-12">
      
      <main className="px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mt-4 flex flex-col lg:flex-row gap-8 bg-white rounded-[2.5rem] p-8 lg:p-16 shadow-sm relative overflow-hidden">
          <div className="flex-1 flex flex-col justify-center max-w-xl z-10">
            <h1 className="text-5xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight mb-6">
              Secure & <br /> Easy-to-Use <br /> Porter App
            </h1>
            <p className="text-gray-500 text-lg mb-10 max-w-sm leading-relaxed font-medium">
              Book, Track & Manage Deliveries with Confidence.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/register"
                className="bg-[#e0f470] hover:bg-[#d4e86a] active:scale-95 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm transition-all inline-flex items-center gap-2 shadow-sm"
              >
                Get Started <ArrowUpRight className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-xs font-bold text-gray-600">
                  App Store
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-xs font-bold text-gray-600">
                  Google Play
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative min-h-[450px] bg-primary rounded-[2rem] overflow-hidden flex items-center justify-center p-8 mt-12 lg:mt-0">
            {/* Circle Text Graphic */}
            <div className="absolute top-1/2 -left-12 lg:-left-16 -translate-y-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center z-20 shadow-sm border-[6px] border-primary">
              <div className="w-24 h-24 relative animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                  <text className="text-[10px] font-bold tracking-widest uppercase text-gray-800">
                    <textPath href="#circlePath">
                      • Learn more • Learn more • Learn more 
                    </textPath>
                  </text>
                </svg>
                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rotate-45 text-gray-800" />
              </div>
            </div>


            {/* Book a Porter Dashboard Image */}
            <img 
              src="/images/herosection.png" 
              alt="herosection.png" 
              className="relative w-full max-w-[800px] rounded-xl shadow-2xl border-8 border-primary z-10" 
            />

          </div>
        </section>

        {/* Mission Section */}
        <section id="about" className="mt-24 text-center flex flex-col items-center">
          <div className="border border-gray-300 rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-8 text-gray-600 bg-white shadow-sm">
            Our Mission
          </div>
          <h2 className="text-3xl lg:text-[2.5rem] font-bold max-w-3xl leading-tight mb-6">
            We provide a secure, intuitive, <br className="hidden lg:block"/> and efficient platform
          </h2>
          <p className="text-gray-500 max-w-xl text-sm font-medium leading-relaxed">
            We believe in a modernized future where everyone <br className="hidden lg:block"/> has full control over their logistics operations.
          </p>
        </section>

        {/* Info Split Section (Fast & Low-Cost) */}
        <section className="mt-24 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 lg:max-w-md w-full relative">
            <div className="bg-white w-full aspect-[4/5] max-w-[360px] rounded-[2.5rem] mx-auto p-2 relative shadow-sm border border-gray-100">
               <div className="w-full h-full bg-gray-50 rounded-[2rem] overflow-hidden relative border border-gray-100">
                 <div className="absolute inset-0 flex flex-col">
                   <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-white rounded-full mx-auto shadow-sm flex items-center justify-center mb-4">
                          <MapPin className="w-5 h-5 text-gray-800" />
                        </div>
                        <div className="text-sm font-bold text-gray-800">Tracking Active</div>
                        <div className="text-xs text-gray-500">Live GPS Update</div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#e0f470] rounded-full shadow-md border-2 border-white"></div>
                        <div className="flex justify-between items-center pl-4">
                          <div>
                            <div className="text-xs text-gray-400 font-semibold mb-1">ETA</div>
                            <div className="text-2xl font-bold text-gray-800">15<span className="text-sm font-medium text-gray-400 ml-1">min</span></div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs text-gray-400 font-semibold mb-1">Distance</div>
                             <div className="text-sm font-bold text-gray-800">4.2 km</div>
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="h-1/3 bg-gray-900 p-6 flex flex-col justify-end rounded-t-[2rem]">
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="w-3/4 h-full bg-[#e0f470]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-white/50 font-semibold uppercase">
                        <span>Pickup</span>
                        <span>Dropoff</span>
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-6 inline-block text-gray-600 bg-white shadow-sm">
              Operations
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              Fast & Low-Cost <br /> Deliveries
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 max-w-md">
              Send and receive items with minimal hassle. Our advanced matching algorithm ensures your deliveries are processed swiftly, avoiding congestion and excessive costs.
            </p>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="mt-32 flex flex-col items-center">
          <div className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-8 text-gray-600 bg-white shadow-sm">
            Features
          </div>
          <h2 className="text-3xl lg:text-[2.5rem] font-bold max-w-2xl text-center leading-tight mb-6">
            We offer a safe, user-friendly, <br className="hidden lg:block"/> and efficient Porter App
          </h2>
          <p className="text-gray-500 max-w-lg text-center text-sm font-medium mb-16 leading-relaxed">
            We envision a streamlined future where individuals have complete control over their logistics needs.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-10 shadow-sm text-gray-800">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8 flex-1">
                  {feature.description}
                </p>
                <button className="bg-[#e0f470] hover:bg-[#d4e86a] active:scale-95 text-gray-900 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 w-max transition-all">
                  Learn more <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-32 max-w-4xl mx-auto flex flex-col items-center mb-12">
          <div className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-8 text-gray-600 bg-white shadow-sm">
            FAQs
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            Frequently <br /> asked questions
          </h2>
          <p className="text-gray-500 text-center text-sm font-medium mb-12">
            We have given answers to the most popular questions below
          </p>

          <div className="w-full bg-white rounded-[2rem] p-6 lg:p-10 shadow-sm border border-gray-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-6 text-left transition-colors group"
                >
                  <span className="flex items-center gap-6">
                    <span className="text-xs text-gray-400 font-bold w-4">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="font-bold text-[15px] text-gray-800 group-hover:text-gray-600 transition-colors">{faq.question}</span>
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${activeFaq === idx ? 'bg-[#e0f470] text-gray-900' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                    {activeFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pl-12 pr-16 pb-6 text-gray-500 text-sm font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Doko Namlo. All rights reserved.</p>
      </footer>

      <Chatbot />

      <style>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
