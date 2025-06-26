import React from "react";
import SignatureWorkflowDashboard from "@/components/ui/signature-workflow-dashboard";

export default function SignatureWorkflowDashboardStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignatureWorkflowDashboard
        onDocumentSelect={(document) => {
          console.log("Document selected:", document);
        }}
        onDocumentCreate={() => {
          console.log("Create new document");
        }}
        onDocumentEdit={(documentId) => {
          console.log("Edit document:", documentId);
        }}
        onDocumentDelete={(documentId) => {
          console.log("Delete document:", documentId);
        }}
        onWorkflowStart={(documentId) => {
          console.log("Start workflow:", documentId);
        }}
        onWorkflowCancel={(documentId) => {
          console.log("Cancel workflow:", documentId);
        }}
        onBulkAction={(action, documentIds) => {
          console.log("Bulk action:", action, documentIds);
        }}
        onExport={(format) => {
          console.log("Export:", format);
        }}
        onRefresh={() => {
          console.log("Refresh dashboard");
        }}
      />
    </div>
  );
}
