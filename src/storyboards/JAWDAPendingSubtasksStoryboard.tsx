import React from "react";

export default function JAWDAPendingSubtasksStoryboard() {
  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            JAWDA Pending Subtasks
          </h1>
          <p className="text-gray-600">
            Monitor and manage pending JAWDA compliance subtasks
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              High Priority Tasks
            </h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• Documentation review pending</li>
              <li>• Quality metrics validation</li>
              <li>• Compliance audit preparation</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Medium Priority Tasks
            </h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Staff training updates</li>
              <li>• Process optimization</li>
              <li>• System integration testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
