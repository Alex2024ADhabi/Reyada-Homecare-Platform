import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManpowerCapacity } from "@/api/manpower.api";

interface ManpowerCapacityReportProps {
  data: ManpowerCapacity[];
}

export default function ManpowerCapacityReport({
  data,
}: ManpowerCapacityReportProps) {
  const [activeTab, setActiveTab] = useState("summary");

  // Calculate summary statistics
  const totalStaff = data.length;
  const availableStaff = data.filter(
    (staff) => staff.availability_status === "Available",
  ).length;
  const unavailableStaff = totalStaff - availableStaff;

  // Calculate capacity utilization
  const totalCapacity = data.reduce(
    (sum, staff) => sum + staff.max_daily_patients,
    0,
  );
  const usedCapacity = data.reduce(
    (sum, staff) => sum + staff.current_daily_patients,
    0,
  );
  const capacityUtilizationPercentage =
    totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

  // Calculate hours utilization
  const totalAvailableHours = data.reduce(
    (sum, staff) => sum + staff.available_hours_per_day,
    0,
  );
  const totalCommittedHours = data.reduce(
    (sum, staff) => sum + staff.committed_hours_per_day,
    0,
  );
  const hoursUtilizationPercentage =
    totalAvailableHours > 0
      ? (totalCommittedHours / totalAvailableHours) * 100
      : 0;

  // Group by role
  const staffByRole = data.reduce(
    (acc, staff) => {
      const role = staff.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push(staff);
      return acc;
    },
    {} as Record<string, ManpowerCapacity[]>,
  );

  // Group by zone
  const staffByZone = data.reduce(
    (acc, staff) => {
      const zone = staff.geographic_zones;
      if (!acc[zone]) acc[zone] = [];
      acc[zone].push(staff);
      return acc;
    },
    {} as Record<string, ManpowerCapacity[]>,
  );

  // Group by certification level
  const staffByCertification = data.reduce(
    (acc, staff) => {
      const cert = staff.certification_level;
      if (!acc[cert]) acc[cert] = [];
      acc[cert].push(staff);
      return acc;
    },
    {} as Record<string, ManpowerCapacity[]>,
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="byRole">By Role</TabsTrigger>
          <TabsTrigger value="byZone">By Zone</TabsTrigger>
          <TabsTrigger value="byCertification">By Certification</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Staff</CardTitle>
                <CardDescription>All registered staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalStaff}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Available Staff</CardTitle>
                <CardDescription>Staff currently available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {availableStaff}
                </div>
                <div className="text-sm text-gray-500">
                  {totalStaff > 0
                    ? ((availableStaff / totalStaff) * 100).toFixed(1)
                    : 0}
                  % of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Patient Capacity</CardTitle>
                <CardDescription>Current utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {usedCapacity} / {totalCapacity}
                </div>
                <div className="text-sm text-gray-500">
                  {capacityUtilizationPercentage.toFixed(1)}% utilized
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Hours Committed</CardTitle>
                <CardDescription>Of total available hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalCommittedHours} / {totalAvailableHours}
                </div>
                <div className="text-sm text-gray-500">
                  {hoursUtilizationPercentage.toFixed(1)}% utilized
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Staff Availability Overview</CardTitle>
              <CardDescription>
                Current staff availability status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="flex justify-between mb-2">
                      <span>Available</span>
                      <span>
                        {availableStaff} (
                        {totalStaff > 0
                          ? ((availableStaff / totalStaff) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{
                          width: `${totalStaff > 0 ? (availableStaff / totalStaff) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between mb-2 mt-4">
                      <span>Unavailable</span>
                      <span>
                        {unavailableStaff} (
                        {totalStaff > 0
                          ? ((unavailableStaff / totalStaff) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gray-500 h-4 rounded-full"
                        style={{
                          width: `${totalStaff > 0 ? (unavailableStaff / totalStaff) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between mb-2 mt-4">
                      <span>Patient Capacity Used</span>
                      <span>{capacityUtilizationPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${capacityUtilizationPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byRole">
          <Card>
            <CardHeader>
              <CardTitle>Staff Distribution by Role</CardTitle>
              <CardDescription>
                Number of staff members in each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(staffByRole).map(([role, staffList]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{role}</h3>
                      <span>{staffList.length} staff</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full"
                        style={{
                          width: `${(staffList.length / totalStaff) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Available:{" "}
                      {
                        staffList.filter(
                          (s) => s.availability_status === "Available",
                        ).length
                      }{" "}
                      | Patient Capacity:{" "}
                      {staffList.reduce(
                        (sum, s) => sum + s.current_daily_patients,
                        0,
                      )}{" "}
                      /{" "}
                      {staffList.reduce(
                        (sum, s) => sum + s.max_daily_patients,
                        0,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byZone">
          <Card>
            <CardHeader>
              <CardTitle>Staff Distribution by Geographic Zone</CardTitle>
              <CardDescription>
                Staff allocation across different zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(staffByZone).map(([zone, staffList]) => (
                  <div key={zone} className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{zone}</h3>
                      <span>{staffList.length} staff</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full"
                        style={{
                          width: `${(staffList.length / totalStaff) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Available:{" "}
                      {
                        staffList.filter(
                          (s) => s.availability_status === "Available",
                        ).length
                      }{" "}
                      | Patient Capacity:{" "}
                      {staffList.reduce(
                        (sum, s) => sum + s.current_daily_patients,
                        0,
                      )}{" "}
                      /{" "}
                      {staffList.reduce(
                        (sum, s) => sum + s.max_daily_patients,
                        0,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byCertification">
          <Card>
            <CardHeader>
              <CardTitle>Staff Distribution by Certification Level</CardTitle>
              <CardDescription>Staff qualification levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(staffByCertification).map(
                  ([cert, staffList]) => (
                    <div key={cert} className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{cert}</h3>
                        <span>{staffList.length} staff</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full"
                          style={{
                            width: `${(staffList.length / totalStaff) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Available:{" "}
                        {
                          staffList.filter(
                            (s) => s.availability_status === "Available",
                          ).length
                        }{" "}
                        | Roles:{" "}
                        {[...new Set(staffList.map((s) => s.role))].join(", ")}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
