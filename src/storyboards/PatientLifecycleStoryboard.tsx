import PatientLifecycleManager from "@/components/patient/PatientLifecycleManager";

export default function PatientLifecycleStoryboard() {
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <PatientLifecycleManager
        patientId="P12345"
        patientName="Ahmed Al Mansoori"
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
