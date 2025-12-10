import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">🏢</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Porter Management System
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your porter and delivery operations with our
            comprehensive management system. Track deliveries, manage porters,
            and optimize your logistics effortlessly.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">
                Real-time analytics and insights about your operations
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-2">
                Porter Management
              </h3>
              <p className="text-sm text-gray-600">
                Manage, track, and optimize porter assignments
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-gray-900 mb-2">
                Delivery Tracking
              </h3>
              <p className="text-sm text-gray-600">
                Real-time tracking of all deliveries and orders
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6 text-center text-gray-600">
        <p>&copy; 2024 Porter Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
