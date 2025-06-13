import React from "react";
import MobileDamanInterface from "@/components/mobile/MobileDamanInterface";

export default function MobileDamanInterfaceStoryboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <MobileDamanInterface
        patientId="784-1990-1234567-1"
        serviceType="home_nursing"
        onSubmissionComplete={(submissionId) => {
          console.log("Submission completed:", submissionId);
        }}
      />
    </div>
  );
}
