import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Porters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Deliveries</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">🚚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,284</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$24,560</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Charts & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Order #12345 Delivered</p>
                <p className="text-sm text-gray-500">10 minutes ago</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Completed</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Porter John Assigned to Order #12344</p>
                <p className="text-sm text-gray-500">25 minutes ago</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Assigned</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New Order Placed #12343</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">Pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Porters</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">J</div>
              <div>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">95 deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
              <div>
                <p className="font-medium text-gray-900">Sarah Smith</p>
                <p className="text-xs text-gray-500">87 deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
              <div>
                <p className="font-medium text-gray-900">Mike Johnson</p>
                <p className="text-xs text-gray-500">76 deliveries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
