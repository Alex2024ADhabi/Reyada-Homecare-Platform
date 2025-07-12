import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Reyada Homecare Platform - Dashboard
        </h1>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Patients</h3>
            <p className="text-3xl font-bold text-blue-600">247</p>
            <p className="text-sm text-gray-600">+12 this week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Assessments</h3>
            <p className="text-3xl font-bold text-orange-600">18</p>
            <p className="text-sm text-gray-600">Due today</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Care Plans</h3>
            <p className="text-3xl font-bold text-green-600">156</p>
            <p className="text-sm text-gray-600">Active plans</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DOH Compliance</h3>
            <p className="text-3xl font-bold text-purple-600">98%</p>
            <p className="text-sm text-gray-600">Above target</p>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Emirates ID Integration</h4>
                  <p className="text-sm text-gray-600">Automated patient verification</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Insurance Verification</h4>
                  <p className="text-sm text-gray-600">Real-time coverage check</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Episode Tracking</h4>
                  <p className="text-sm text-gray-600">Care episode management</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Ready</span>
              </div>
            </div>
          </div>

          {/* Clinical Documentation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Clinical Documentation</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-medium">16 Clinical Forms</h4>
                  <p className="text-sm text-gray-600">Mobile-optimized assessments</p>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Available</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Electronic Signatures</h4>
                  <p className="text-sm text-gray-600">DOH-compliant signing</p>
                </div>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div>
                  <h4 className="font-medium">9-Domain Assessment</h4>
                  <p className="text-sm text-gray-600">Comprehensive evaluation</p>
                </div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* DOH Compliance Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">DOH Regulatory Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
              <h4 className="font-medium">Documentation Standards</h4>
              <p className="text-sm text-gray-600">Real-time monitoring active</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">🛡️</div>
              <h4 className="font-medium">Patient Safety</h4>
              <p className="text-sm text-gray-600">Taxonomy compliance verified</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">📊</div>
              <h4 className="font-medium">Audit Trail</h4>
              <p className="text-sm text-gray-600">Complete activity logging</p>
            </div>
          </div>
        </div>

        {/* Mobile Features */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mobile-First Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-xl mb-2">📱</div>
              <h4 className="font-medium">Offline Capable</h4>
              <p className="text-sm text-gray-600">Works without internet</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-xl mb-2">🎤</div>
              <h4 className="font-medium">Voice-to-Text</h4>
              <p className="text-sm text-gray-600">Medical terminology support</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-xl mb-2">📷</div>
              <h4 className="font-medium">Camera Integration</h4>
              <p className="text-sm text-gray-600">Wound documentation</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-xl mb-2">🔒</div>
              <h4 className="font-medium">Secure Auth</h4>
              <p className="text-sm text-gray-600">Multi-factor protection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;