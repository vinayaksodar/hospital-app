"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Doctor, extractDoctorProfileId } from "@/lib/doctor-utils";
import { DoctorDetailsForm } from "./doctor-details-form";
import { DoctorAvailabilityEditor } from "./doctor-availability-editor";
import { ServicesCrud } from "@/components/services-crud";

type DoctorDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "add" | "edit";
  doctor: Doctor | null;
  onSave: (data: any, doctor: Doctor | null) => void;
};

export function DoctorDialog({
  isOpen,
  onOpenChange,
  mode,
  doctor,
  onSave,
}: DoctorDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      specialty: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && doctor) {
      form.reset({
        name: doctor.user.name,
        specialty: doctor.user.doctorProfiles?.[0]?.speciality || "",
        email: doctor.user.email,
        phone: doctor.user.phone || "",
      });
    } else {
      form.reset({
        name: "",
        specialty: "",
        email: "",
        phone: "",
      });
    }
  }, [doctor, mode, form, isOpen]);

  const profileId = extractDoctorProfileId(doctor);
  const isEditMode = mode === "edit" && !!doctor;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? `Edit: ${doctor?.user.name}` : "Add New Doctor"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update doctor information, availability, and services."
              : "First, create the doctor. Then you can manage their schedule."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Personal Info</TabsTrigger>
            <TabsTrigger value="availability" disabled={!isEditMode}>
              Availability
            </TabsTrigger>
            <TabsTrigger value="services" disabled={!isEditMode}>
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit((data) => onSave(data, doctor))}>
                <DoctorDetailsForm isEditMode={isEditMode} />
              </form>
            </FormProvider>
          </TabsContent>

          <TabsContent value="availability">
            {profileId && <DoctorAvailabilityEditor profileId={profileId} />}
          </TabsContent>

          <TabsContent value="services">
            {profileId && <ServicesCrud doctorId={profileId} />}
          </TabsContent>
        </Tabs>

        
      </DialogContent>
    </Dialog>
  );
}
