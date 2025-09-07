"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Edit, Search, Trash2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { ServicesCrud } from "@/components/services-crud";

/* ---------------------------
   Config / helpers
   --------------------------- */

// Specialties list
const specialties = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Ophthalmology",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Gynecology",
];

// Days of the week (MON..SUN) — kept for UI order
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- Types ---
type Doctor = {
  userId?: string;
  hospitalId?: number;
  role?: string;
  user: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    doctorProfiles?: {
      id: number;
      speciality?: string;
      aboutDetails?: string;
    }[];
  };
};

type Availability = {
  day: string;
  ranges: { start: string; end: string }[]; // local times "HH:mm"
};

/* ------------- small helpers ------------- */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ------------- utility: get local date for a weekday ------------- */
// targetWeekday is JS weekday number 0=Sunday ... 6=Saturday
function getNextLocalDateForWeekday(targetWeekday: number) {
  const today = new Date();
  const todayWeekday = today.getDay(); // 0=Sun
  const diff = (targetWeekday - todayWeekday + 7) % 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/* ---------------------------
   UTC <-> Local conversion helpers
   --------------------------- */

/**
 * Convert API availabilities (UTC times + days[] where days are 0=Sun..6=Sat)
 * into UI selections where times are local and grouped by day name (Monday..Sunday).
 *
 * Input apiAvailabilities example:
 * [
 *  { days: [1,2,3,4,5], startTime: "09:00:00", endTime: "12:00:00" }
 * ]
 */
function convertApiAvailabilitiesToSelections(
  apiAvailabilities: any[]
): Availability[] {
  const map = new Map<string, Set<string>>(); // dayName -> set of "HH:mm-HH:mm"

  for (const a of apiAvailabilities || []) {
    const startParts = (a.startTime || "00:00:00").split(":").map(Number);
    const endParts = (a.endTime || "00:00:00").split(":").map(Number);

    for (const utcDay of a.days || []) {
      // Build a UTC Date at the correct upcoming weekday + UTC start time
      const todayUtc = new Date();
      const todayUtcDay = todayUtc.getUTCDay();
      const diff = (utcDay - todayUtcDay + 7) % 7;

      const utcStartTimestamp = Date.UTC(
        todayUtc.getUTCFullYear(),
        todayUtc.getUTCMonth(),
        todayUtc.getUTCDate() + diff,
        startParts[0] || 0,
        startParts[1] || 0,
        startParts[2] || 0
      );
      const utcStartDate = new Date(utcStartTimestamp);

      // UTC end (may be same day or next day)
      let utcEndTimestamp = Date.UTC(
        utcStartDate.getUTCFullYear(),
        utcStartDate.getUTCMonth(),
        utcStartDate.getUTCDate(),
        endParts[0] || 0,
        endParts[1] || 0,
        endParts[2] || 0
      );
      if (utcEndTimestamp <= utcStartTimestamp) {
        // assume end is next day
        utcEndTimestamp += 24 * 60 * 60 * 1000;
      }
      const utcEndDate = new Date(utcEndTimestamp);

      // Convert to local Date objects (same timestamps)
      const localStart = new Date(utcStartDate.getTime());
      const localEnd = new Date(utcEndDate.getTime());

      const localStartKey = `${pad(localStart.getHours())}:${pad(
        localStart.getMinutes()
      )}`;
      const localEndKey = `${pad(localEnd.getHours())}:${pad(
        localEnd.getMinutes()
      )}`;

      // daysOfWeek index 0 = Monday, so map JS getDay() (0=Sun) to this by (d + 6) % 7
      const localDayIndexForDaysOfWeek = (localStart.getDay() + 6) % 7;
      const localDayName = daysOfWeek[localDayIndexForDaysOfWeek];

      const rangeKey = `${localStartKey}-${localEndKey}`;
      if (!map.has(localDayName)) map.set(localDayName, new Set<string>());
      map.get(localDayName)!.add(rangeKey);
    }
  }

  const result: Availability[] = [];
  for (const dayName of daysOfWeek) {
    const set = map.get(dayName);
    if (set && set.size > 0) {
      const ranges = Array.from(set)
        .sort()
        .map((r) => {
          const [start, end] = r.split("-");
          return { start, end };
        });
      result.push({ day: dayName, ranges });
    }
  }
  return result;
}

/**
 * Convert UI selections (local day names + ranges "HH:mm") back to API payload
 * where times are in UTC "HH:MM:SS" and days are 0=Sun..6=Sat (UTC weekday numbers).
 *
 * Output format:
 * [
 *   { days: [1,2,3], startTime: "09:00:00", endTime: "12:00:00" },
 *   ...
 * ]
 */
function convertSelectionsToUtcPayload(selections: Availability[]) {
  const map = new Map<string, Set<number>>(); // key "HH:MM:SS-HH:MM:SS" -> set of utc weekday numbers

  for (const dayEntry of selections) {
    const localDayName = dayEntry.day;
    // Map local day name (Monday..Sunday) to JS weekday number (0=Sun..6=Sat)
    // daysOfWeek index 0 => Monday which is JS 1. So formula:
    const localWeekdayNumber = (daysOfWeek.indexOf(localDayName) + 1) % 7; // 0..6 (JS getDay)
    for (const range of dayEntry.ranges) {
      const [startLocal, endLocal] = [range.start, range.end]; // "HH:mm"
      const [sH, sM] = startLocal.split(":").map(Number);
      const [eH, eM] = endLocal.split(":").map(Number);

      const startLocalDate = getNextLocalDateForWeekday(localWeekdayNumber);
      startLocalDate.setHours(sH, sM, 0, 0);

      const endLocalDate = new Date(startLocalDate.getTime());
      endLocalDate.setHours(eH, eM, 0, 0);
      if (endLocalDate.getTime() <= startLocalDate.getTime()) {
        // if end <= start, assume end is next day
        endLocalDate.setDate(endLocalDate.getDate() + 1);
      }

      // Convert to UTC fields
      const utcStartTime = `${pad(startLocalDate.getUTCHours())}:${pad(
        startLocalDate.getUTCMinutes()
      )}:00`;
      const utcEndTime = `${pad(endLocalDate.getUTCHours())}:${pad(
        endLocalDate.getUTCMinutes()
      )}:00`;
      const utcStartDay = startLocalDate.getUTCDay(); // 0=Sun..6=Sat

      const key = `${utcStartTime}-${utcEndTime}`;
      if (!map.has(key)) map.set(key, new Set<number>());
      map.get(key)!.add(utcStartDay);
    }
  }

  const payload: { days: number[]; startTime: string; endTime: string }[] = [];
  for (const [k, setOfDays] of map.entries()) {
    const [startTime, endTime] = k.split("-");
    payload.push({
      days: Array.from(setOfDays).sort((a, b) => a - b),
      startTime,
      endTime,
    });
  }
  return payload;
}

/* ---------------------------
   Component
   --------------------------- */

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<
    Availability[]
  >([]);

  const form = useForm({
    defaultValues: {
      name: "",
      specialty: "",
      email: "",
      phone: "",
      status: "Active",
    },
  });

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

  const extractDoctorProfileId = (doctorObj: Doctor | null) => {
    return doctorObj?.user?.doctorProfiles?.[0]?.id ?? null;
  };

  /* ------------------ Dialog Management ------------------ */

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDoctor(null);
    setSelectedAvailability([]);
    form.reset();
  };

  const openDialog = async (
    mode: "add" | "edit",
    doctor: Doctor | null = null
  ) => {
    setDialogMode(mode);
    if (mode === "edit" && doctor) {
      setSelectedDoctor(doctor);
      form.reset({
        name: doctor.user.name,
        specialty: doctor.user.doctorProfiles?.[0]?.speciality || "",
        email: doctor.user.email,
        phone: doctor.user.phone || "",
        status: "Active",
      });

      const profileId = extractDoctorProfileId(doctor);
      if (profileId) {
        try {
          const res = await fetch(`/api/doctors/${profileId}/schedules`);
          if (res.ok) {
            const schedules = await res.json();
            const schedule =
              Array.isArray(schedules) && schedules.length > 0
                ? schedules[0]
                : schedules;
            const apiAvailabilities = schedule?.availabilities ?? [];
            setSelectedAvailability(
              convertApiAvailabilitiesToSelections(apiAvailabilities)
            );
          } else {
            console.error("Failed to fetch schedules, starting with empty.");
            setSelectedAvailability([]);
          }
        } catch (error) {
          console.error("Error fetching schedules:", error);
          setSelectedAvailability([]);
        }
      } else {
        setSelectedAvailability([]);
      }
    } else {
      // 'add' mode
      setSelectedDoctor(null);
      form.reset({
        name: "",
        specialty: "",
        email: "",
        phone: "",
        status: "Active",
      });
      setSelectedAvailability([]);
    }
    setIsDialogOpen(true);
  };

  /* ------------------ Availability State Management ------------------ */

  const addAvailabilityRange = (day: string) => {
    setSelectedAvailability((prev) => {
      const idx = prev.findIndex((d) => d.day === day);
      const defaultRange = { start: "09:00", end: "12:00" };
      if (idx === -1) {
        return [...prev, { day, ranges: [defaultRange] }];
      } else {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          ranges: [...copy[idx].ranges, defaultRange],
        };
        return copy;
      }
    });
  };

  const updateAvailabilityRange = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setSelectedAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              ranges: d.ranges.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
              ),
            }
          : d
      )
    );
  };

  const removeAvailabilityRange = (day: string, index: number) => {
    setSelectedAvailability((prev) =>
      prev
        .map((d) =>
          d.day === day
            ? { ...d, ranges: d.ranges.filter((_, i) => i !== index) }
            : d
        )
        .filter((d) => d.ranges.length > 0)
    );
  };

  /* ------------------ API Save Handlers ------------------ */

  const handleSaveDetails = async (data: any) => {
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
        setSelectedDoctor(newDoctor);
        setDialogMode("edit");
        alert(
          "Doctor created successfully! You can now add availability and services."
        );
      } else if (dialogMode === "edit" && selectedDoctor) {
        const profileId = extractDoctorProfileId(selectedDoctor);
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

  const handleSaveAvailability = async () => {
    const profileId = extractDoctorProfileId(selectedDoctor);
    if (!profileId) {
      alert(
        "Cannot save availability. No doctor selected or doctor not yet created."
      );
      return;
    }

    try {
      const availabilitiesPayload =
        convertSelectionsToUtcPayload(selectedAvailability);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const body = {
        schedule: {
          name: "Default Schedule",
          timezone,
          availabilities: availabilitiesPayload,
        },
      };

      const res = await fetch(`/api/doctors/${profileId}/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save availability");
      }

      alert("Availability saved successfully!");
    } catch (error) {
      console.error("Failed to save availability:", error);
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

  /* ------------------ UI ------------------ */

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.user.id}>
                  <TableCell className="font-medium">
                    {doctor.user.name}
                  </TableCell>
                  <TableCell>
                    {doctor.user.doctorProfiles?.[0]?.speciality}
                  </TableCell>
                  <TableCell>{doctor.user.email}</TableCell>
                  <TableCell>{doctor.user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={"default"}>Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDialog("edit", doctor)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {doctor.user.name}{" "}
                              from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveDoctor(doctor)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No doctors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Unified Add/Edit Doctor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Add New Doctor"
                : `Edit: ${selectedDoctor?.user.name}`}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "First, create the doctor. Then you can manage their schedule."
                : "Update doctor information, availability, and services."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Personal Info</TabsTrigger>
              <TabsTrigger value="availability" disabled={!selectedDoctor}>
                Availability
              </TabsTrigger>
              <TabsTrigger value="services" disabled={!selectedDoctor}>
                Services
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(handleSaveDetails)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="doctor@hospital.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit">
                      {dialogMode === "add" ? "Create Doctor" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Availability Tab (new simplified widget) */}
            <TabsContent value="availability" className="py-4">
              <div className="space-y-6">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <h3 className="text-lg font-medium">
                    Set Weekly Availability
                  </h3>
                </div>

                {daysOfWeek.map((day) => {
                  const dayItem = selectedAvailability.find(
                    (d) => d.day === day
                  );
                  return (
                    <div key={day} className="space-y-2 border-b pb-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{day}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addAvailabilityRange(day)}
                        >
                          + Add
                        </Button>
                      </div>

                      {dayItem?.ranges.map((range, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 sm:gap-4 pl-4 pt-2"
                        >
                          <Input
                            type="time"
                            value={range.start}
                            onChange={(e) =>
                              updateAvailabilityRange(
                                day,
                                idx,
                                "start",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <span className="text-sm text-neutral-500">to</span>
                          <Input
                            type="time"
                            value={range.end}
                            onChange={(e) =>
                              updateAvailabilityRange(
                                day,
                                idx,
                                "end",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAvailabilityRange(day, idx)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Remove range</span>
                          </Button>
                        </div>
                      ))}

                      {!dayItem && (
                        <div className="pl-4 text-sm text-neutral-500">
                          No availability set.
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveAvailability}>
                    Save Availability
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="py-4">
              {selectedDoctor && (
                <ServicesCrud
                  doctorId={extractDoctorProfileId(selectedDoctor) ?? 0}
                />
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
