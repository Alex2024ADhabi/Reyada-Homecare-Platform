import React from "react";
import MobileSignaturePad from "@/components/ui/mobile-signature-pad";

export default function MobileSignaturePadStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <MobileSignaturePad
        onSignatureComplete={(signature) => {
          console.log("Mobile signature completed:", signature);
        }}
        onSignatureChange={(signature) => {
          console.log("Mobile signature changed:", signature);
        }}
        onOfflineSave={(signature) => {
          console.log("Mobile signature saved offline:", signature);
        }}
        validationRules={{
          minStrokes: 3,
          minDuration: 500,
          minPressure: 0.2,
          requireGesture: true,
        }}
        autoSave={true}
        offlineMode={false}
        fullscreen={false}
      />
    </div>
  );
}
