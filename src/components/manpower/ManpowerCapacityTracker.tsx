import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getAllManpowerCapacity,
  deleteManpowerCapacity,
  ManpowerCapacity,
} from "@/api/manpower.api";
import ManpowerCapacityForm from "./ManpowerCapacityForm";
import ManpowerCapacityReport from "./ManpowerCapacityReport";

export default function ManpowerCapacityTracker() {
  const [manpowerData, setManpowerData] = useState<ManpowerCapacity[]>([]);
  const [filteredData, setFilteredData] = useState<ManpowerCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all-roles");
  const [zoneFilter, setZoneFilter] = useState("all-zones");
  const [availabilityFilter, setAvailabilityFilter] = useState("all-statuses");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ManpowerCapacity | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("list");

  // Get unique values for filters
  const roles = [...new Set(manpowerData.map((item) => item.role))];
  const zones = [...new Set(manpowerData.map((item) => item.geographic_zones))];
  const statuses = [
    ...new Set(manpowerData.map((item) => item.availability_status)),
  ];

  useEffect(() => {
    fetchManpowerData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, zoneFilter, availabilityFilter, manpowerData]);

  async function fetchManpowerData() {
    setIsLoading(true);
    try {
      const data = await getAllManpowerCapacity();
      setManpowerData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching manpower data:", error);
      toast({
        title: "Error",
        description: "Failed to load manpower capacity data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...manpowerData];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.staff_member.toLowerCase().includes(lowerSearchTerm) ||
          item.specializations.toLowerCase().includes(lowerSearchTerm) ||
          item.equipment_certifications.toLowerCase().includes(lowerSearchTerm),
      );
    }

    if (roleFilter && roleFilter !== "all-roles") {
      filtered = filtered.filter((item) => item.role === roleFilter);
    }

    if (zoneFilter && zoneFilter !== "all-zones") {
      filtered = filtered.filter(
        (item) => item.geographic_zones === zoneFilter,
      );
    }

    if (availabilityFilter && availabilityFilter !== "all-statuses") {
      filtered = filtered.filter(
        (item) => item.availability_status === availabilityFilter,
      );
    }

    setFilteredData(filtered);
  }

  function resetFilters() {
    setSearchTerm("");
    setRoleFilter("all-roles");
    setZoneFilter("all-zones");
    setAvailabilityFilter("all-statuses");
  }

  async function handleDelete(id: string) {
    try {
      await deleteManpowerCapacity(id);
      toast({
        title: "Record deleted",
        description: "The staff record has been deleted successfully.",
      });
      fetchManpowerData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "Failed to delete the record. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleFormSuccess() {
    setShowAddForm(false);
    setEditingRecord(null);
    fetchManpowerData();
  }

  function handleEditClick(record: ManpowerCapacity) {
    setEditingRecord(record);
  }

  function handleCancelEdit() {
    setEditingRecord(null);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manpower Capacity Tracker</h1>
          <p className="text-gray-500">
            Manage staff allocation and capacity planning
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            onClick={() => fetchManpowerData()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <ManpowerCapacityForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Staff List</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter staff by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search staff or specializations"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-zones">All Zones</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={availabilityFilter}
                  onValueChange={setAvailabilityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading staff data...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium">
                  No staff records found
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm ||
                  (roleFilter && roleFilter !== "all-roles") ||
                  (zoneFilter && zoneFilter !== "all-zones") ||
                  (availabilityFilter && availabilityFilter !== "all-statuses")
                    ? "Try adjusting your filters"
                    : "Add staff members to get started"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((staff) => (
                <Card key={staff._id?.toString()}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{staff.staff_member}</CardTitle>
                        <CardDescription>{staff.role}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowDeleteConfirm(staff._id?.toString() || "")
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Certification:
                        </span>
                        <span className="text-sm">
                          {staff.certification_level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Zone:</span>
                        <span className="text-sm">
                          {staff.geographic_zones}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm">{staff.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Shift:</span>
                        <span className="text-sm">{staff.shift}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge
                          variant={
                            staff.availability_status === "Available"
                              ? "default"
                              : staff.availability_status === "Unavailable"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {staff.availability_status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Patient Capacity:</span>
                          <span>
                            {staff.current_daily_patients} /{" "}
                            {staff.max_daily_patients}
                          </span>
                        </div>
                        <Progress
                          value={
                            (staff.current_daily_patients /
                              staff.max_daily_patients) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Hours Committed:</span>
                          <span>
                            {staff.committed_hours_per_day} /{" "}
                            {staff.available_hours_per_day}
                          </span>
                        </div>
                        <Progress
                          value={
                            (staff.committed_hours_per_day /
                              staff.available_hours_per_day) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          Specializations:
                        </span>
                        <p className="text-sm mt-1">{staff.specializations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <ManpowerCapacityReport data={manpowerData} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingRecord && (
        <Dialog
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        >
          <DialogContent className="max-w-4xl">
            <ManpowerCapacityForm
              initialData={editingRecord}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog
          open={!!showDeleteConfirm}
          onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        >
          <DialogContent>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-6">
                Are you sure you want to delete this staff record? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
