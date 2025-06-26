import React from "react";
import IntelligentDocumentClassifier from "@/components/governance/IntelligentDocumentClassifier";

export default function IntelligentDocumentClassifierStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="mb-6 p-6 bg-white border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Intelligent Document Classifier - AI-Powered Governance
          </h1>
          <p className="text-gray-600 mb-4">
            Advanced AI-powered document classification system with machine
            learning, automated compliance validation, intelligent tagging, and
            comprehensive analytics for the Reyada Homecare Platform governance
            framework.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              AI Classification
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Machine Learning
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Compliance Automation
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Intelligent Tagging
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              DOH/JAWDA/Daman
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              Predictive Analytics
            </span>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
              Real-time Processing
            </span>
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
              Batch Classification
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-1">
                AI Classification Engine
              </h3>
              <p className="text-purple-700">
                Advanced NLP and machine learning models for automatic document
                categorization with 89% accuracy
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">
                Compliance Intelligence
              </h3>
              <p className="text-blue-700">
                Automated DOH, JAWDA, and Daman compliance framework detection
                and validation
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1">
                Smart Training System
              </h3>
              <p className="text-green-700">
                Continuous learning with human feedback integration and model
                performance optimization
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-1">
                Advanced Analytics
              </h3>
              <p className="text-orange-700">
                Comprehensive performance metrics, trend analysis, and
                predictive insights dashboard
              </p>
            </div>
          </div>
        </div>

        <IntelligentDocumentClassifier />
      </div>
    </div>
  );
}
