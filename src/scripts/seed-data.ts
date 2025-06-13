import { connectToDatabase, closeDatabase } from "../api/db";
import { ReferralData } from "../services/referral.service";

async function seedDatabase() {
  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if referrals collection already has data
    const count = await db.collection("referrals").countDocuments();

    if (count > 0) {
      console.log(
        `Database already has ${count} referrals. Skipping seed operation.`,
      );
      return;
    }

    // Sample referral data
    const referrals: Omit<ReferralData, "id">[] = [
      {
        referralDate: new Date("2023-06-01"),
        referralSource: "Abu Dhabi Health Services Company (SEHA)",
        referralSourceContact: "Dr. Ahmed Al Mansouri, +971 2 555 1234",
        patientName: "Mohammed Al Hashimi",
        patientContact: "+971 50 123 4567",
        preliminaryNeeds: "Post-surgical wound care and mobility assistance",
        insuranceInfo: "Daman Enhanced, Policy #: DAM-12345678",
        geographicLocation: "Al Reem Island, Abu Dhabi",
        acknowledgmentStatus: "Acknowledged",
        acknowledgmentDate: new Date("2023-06-02"),
        acknowledgedBy: "Fatima Nurse Supervisor",
        assignedNurseSupervisor: "Fatima Al Zaabi",
        assignedChargeNurse: "Sara Khan",
        assignedCaseCoordinator: "Omar Hassan",
        assessmentScheduledDate: new Date("2023-06-05"),
        initialContactCompleted: true,
        documentationPrepared: true,
        referralStatus: "In Progress",
        statusNotes:
          "Initial assessment scheduled, awaiting insurance approval",
        createdAt: new Date("2023-06-01T09:30:00"),
        updatedAt: new Date("2023-06-02T14:15:00"),
      },
      {
        referralDate: new Date("2023-06-03"),
        referralSource: "Cleveland Clinic Abu Dhabi",
        referralSourceContact: "Dr. Sarah Johnson, +971 2 659 9876",
        patientName: "Aisha Al Mazrouei",
        patientContact: "+971 55 987 6543",
        preliminaryNeeds: "Diabetes management and education",
        insuranceInfo: "Thiqa, Policy #: THQ-87654321",
        geographicLocation: "Al Bateen, Abu Dhabi",
        acknowledgmentStatus: "Pending",
        initialContactCompleted: false,
        documentationPrepared: false,
        referralStatus: "New",
        createdAt: new Date("2023-06-03T11:45:00"),
        updatedAt: new Date("2023-06-03T11:45:00"),
      },
      {
        referralDate: new Date("2023-05-28"),
        referralSource: "Burjeel Hospital",
        referralSourceContact: "Dr. Ravi Patel, +971 2 222 3333",
        patientName: "Khalid Al Suwaidi",
        patientContact: "+971 54 555 7777",
        preliminaryNeeds: "Physiotherapy and rehabilitation after stroke",
        insuranceInfo: "AXA, Policy #: AXA-55667788",
        geographicLocation: "Khalifa City, Abu Dhabi",
        acknowledgmentStatus: "Processed",
        acknowledgmentDate: new Date("2023-05-29"),
        acknowledgedBy: "Noura Team Lead",
        assignedNurseSupervisor: "Noura Al Shamsi",
        assignedChargeNurse: "John Smith",
        assignedCaseCoordinator: "Layla Ibrahim",
        assessmentScheduledDate: new Date("2023-05-31"),
        initialContactCompleted: true,
        documentationPrepared: true,
        referralStatus: "Accepted",
        statusNotes: "Care plan developed and approved",
        createdAt: new Date("2023-05-28T10:15:00"),
        updatedAt: new Date("2023-05-30T16:20:00"),
      },
      {
        referralDate: new Date("2023-06-04"),
        referralSource: "Mediclinic Al Noor Hospital",
        referralSourceContact: "Dr. Maria Rodriguez, +971 2 444 5555",
        patientName: "Hamad Al Nuaimi",
        patientContact: "+971 56 222 3333",
        preliminaryNeeds: "Palliative care for advanced cancer",
        insuranceInfo: "National Health Insurance, Policy #: NHI-99887766",
        geographicLocation: "Al Muroor, Abu Dhabi",
        acknowledgmentStatus: "Acknowledged",
        acknowledgmentDate: new Date("2023-06-04"),
        acknowledgedBy: "Ahmed Supervisor",
        initialContactCompleted: true,
        documentationPrepared: false,
        referralStatus: "In Progress",
        statusNotes: "Urgent case, expedited processing",
        createdAt: new Date("2023-06-04T08:30:00"),
        updatedAt: new Date("2023-06-04T09:45:00"),
      },
      {
        referralDate: new Date("2023-05-25"),
        referralSource: "Sheikh Khalifa Medical City",
        referralSourceContact: "Dr. Thomas Wilson, +971 2 819 1000",
        patientName: "Maryam Al Dhaheri",
        patientContact: "+971 50 444 9999",
        preliminaryNeeds: "Maternal and newborn care",
        insuranceInfo: "Daman Basic, Policy #: DAM-44332211",
        geographicLocation: "Al Nahyan, Abu Dhabi",
        acknowledgmentStatus: "Processed",
        acknowledgmentDate: new Date("2023-05-26"),
        acknowledgedBy: "Hessa Supervisor",
        assignedNurseSupervisor: "Hessa Al Falasi",
        assignedChargeNurse: "Michael Brown",
        assignedCaseCoordinator: "Amina Youssef",
        assessmentScheduledDate: new Date("2023-05-27"),
        initialContactCompleted: true,
        documentationPrepared: true,
        referralStatus: "Declined",
        statusNotes:
          "Patient decided to use hospital outpatient services instead",
        createdAt: new Date("2023-05-25T13:20:00"),
        updatedAt: new Date("2023-05-28T11:10:00"),
      },
    ];

    // Insert sample data
    const result = await db.collection("referrals").insertMany(referrals);

    console.log(
      `${result.insertedCount} referrals successfully seeded to database`,
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    await closeDatabase();
  }
}

// Run the seed function
seedDatabase();
