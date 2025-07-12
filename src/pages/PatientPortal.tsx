import React from "react";

const PatientPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Portal</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Secure Patient Access</h2>
          <p className="text-gray-600 mb-6">
            Access your health information, care plans, and communicate with your healthcare team securely.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Health Records</h3>
              <p className="text-sm text-gray-600">View your complete medical history and assessments</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Care Plans</h3>
              <p className="text-sm text-gray-600">Track your personalized care plan progress</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Appointments</h3>
              <p className="text-sm text-gray-600">Schedule and manage your healthcare visits</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
              <p className="text-sm text-gray-600">Secure communication with your care team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;