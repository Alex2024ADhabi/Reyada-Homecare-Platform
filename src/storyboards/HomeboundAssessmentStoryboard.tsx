import HomeboundAssessment from "@/components/patient/HomeboundAssessment";

export default function HomeboundAssessmentStoryboard() {
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <HomeboundAssessment
        patientId="P12345"
        patientName="Ahmed Al Mansoori"
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
