"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Doctor, extractDoctorProfileId } from "@/lib/doctor-utils";
import { DoctorsTable } from "@/components/admin/doctors/doctors-table";
import { DoctorDialog } from "@/components/admin/doctors/doctor-dialog";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.user.doctorProfiles?.[0]?.speciality &&
        doctor.user.doctorProfiles[0].speciality
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDialogToggle = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedDoctor(null);
      setDialogMode("add");
    }
  };

  const openDialog = (mode: "add" | "edit", doctor: Doctor | null = null) => {
    setDialogMode(mode);
    setSelectedDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleSaveDetails = async (data: any, doctorToUpdate: Doctor | null) => {
    try {
      if (dialogMode === "add") {
        const res = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, hospitalId: 1 }),
        });
        if (!res.ok) throw new Error(await res.text());

        const newDoctor = await res.json();
        setDoctors((prev) => [...prev, newDoctor]);
        // Switch to edit mode for the new doctor
        setSelectedDoctor(newDoctor);
        setDialogMode("edit");
        alert(
          "Doctor created successfully! You can now add availability and services."
        );
      } else if (dialogMode === "edit" && doctorToUpdate) {
        const profileId = extractDoctorProfileId(doctorToUpdate);
        if (!profileId) throw new Error("No profile ID found for this doctor.");

        const res = await fetch(`/api/doctors/${profileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());

        const updatedDoctor = await res.json();
        setDoctors((prev) =>
          prev.map((d) =>
            extractDoctorProfileId(d) === profileId ? updatedDoctor : d
          )
        );
        setSelectedDoctor(updatedDoctor);
        alert("Doctor details updated successfully.");
      }
    } catch (error) {
      console.error("Failed to save doctor details:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "An unknown error occurred."
        }`
      );
    }
  };

  const handleRemoveDoctor = async (doctor: Doctor) => {
    const profileId = extractDoctorProfileId(doctor);
    if (!profileId) {
      alert("Could not delete doctor: Invalid ID.");
      return;
    }
    try {
      const res = await fetch(`/api/doctors/${profileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDoctors((prev) =>
          prev.filter((d) => extractDoctorProfileId(d) !== profileId)
        );
        alert("Doctor removed successfully.");
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("Failed to remove doctor:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "An unknown error occurred."
        }`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage doctors and their availability
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <Input
            placeholder="Search doctors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={() => openDialog("add")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <DoctorsTable
        doctors={filteredDoctors}
        onEdit={(doctor) => openDialog("edit", doctor)}
        onDelete={handleRemoveDoctor}
      />

      <DoctorDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogToggle}
        mode={dialogMode}
        doctor={selectedDoctor}
        onSave={handleSaveDetails}
      />
    </div>
  );
}