"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/alert-dialog"
import { Calendar, Edit, Search, Trash2, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { ServicesCrud } from "@/components/services-crud"

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
]

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Time slots
const timeSlots = [
  "08:00 AM - 09:00",
  "09:00 AM - 10:00",
  "10:00 AM - 11:00",
  "11:00 AM - 12:00 PM",
  "01:00 PM - 02:00",
  "02:00 PM - 03:00",
  "03:00 PM - 04:00",
  "04:00 PM - 05:00",
  "05:00 PM - 06:00",
]

type Doctor = {
  userId: string;
  hospitalId: number;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    doctorProfiles: {
      id: number;
      speciality: string;
      aboutDetails: string;
    }[];
  };
};

type Availability = { day: string; slots: string[] }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<Availability[]>([])

  const form = useForm({
    defaultValues: {
      name: "",
      specialty: "",
      email: "",
      phone: "",
      status: "Active",
    },
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors")
      const data = await res.json()
      setDoctors(data)
    }
    fetchDoctors()
  }, [])

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.user.doctorProfiles[0]?.speciality &&
        doctor.user.doctorProfiles[0].speciality
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle adding a new doctor
  const handleAddDoctor = async (data: any) => {
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, hospitalId: 1 }), // Assuming hospitalId 1 for now
    })
    if (res.ok) {
      const newDoctor = await res.json()
      setDoctors([...doctors, newDoctor])
      setIsAddDialogOpen(false)
      form.reset()
      setSelectedAvailability([])
    }
  }

  // Handle editing a doctor
  const handleEditDoctor = async (data: any) => {
    if (!selectedDoctor) return

    const res = await fetch(`/api/doctors/${selectedDoctor.user.doctorProfiles[0].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      const updatedDoctor = await res.json()
      const updatedDoctors = doctors.map((doctor) =>
        doctor.user.doctorProfiles[0].id === updatedDoctor.id
          ? { ...doctor, user: { ...doctor.user, doctorProfiles: [updatedDoctor] } }
          : doctor
      )
      setDoctors(updatedDoctors)
      setIsEditDialogOpen(false)
      setSelectedDoctor(null)
      setSelectedAvailability([])
    }
  }

  // Handle removing a doctor
  const handleRemoveDoctor = async (id: number) => {
    const res = await fetch(`/api/doctors/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setDoctors(doctors.filter((doctor) => doctor.user.doctorProfiles[0].id !== id))
    }
  }

  // Open edit dialog with doctor data
  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    form.reset({
      name: doctor.user.name,
      specialty: doctor.user.doctorProfiles[0].speciality,
      email: doctor.user.email,
      phone: doctor.user.phone,
      status: "Active", // Status needs to be handled properly
    })
    // setSelectedAvailability(doctor.availability)
    setIsEditDialogOpen(true)
  }

  // Handle availability changes
  const toggleAvailabilitySlot = (day: string, slot: string) => {
    setSelectedAvailability((prev) => {
      // Find if day already exists in availability
      const dayIndex = prev.findIndex((item) => item.day === day)

      if (dayIndex === -1) {
        // Day doesn't exist, add new day with slot
        return [...prev, { day, slots: [slot] }]
      } else {
        // Day exists, check if slot exists
        const dayItem = prev[dayIndex]
        const slotIndex = dayItem.slots.indexOf(slot)

        if (slotIndex === -1) {
          // Slot doesn't exist, add it
          const updatedDay = { ...dayItem, slots: [...dayItem.slots, slot] }
          return [...prev.slice(0, dayIndex), updatedDay, ...prev.slice(dayIndex + 1)]
        } else {
          // Slot exists, remove it
          const updatedSlots = dayItem.slots.filter((s) => s !== slot)

          if (updatedSlots.length === 0) {
            // No slots left for this day, remove the day
            return prev.filter((item) => item.day !== day)
          } else {
            // Update slots for this day
            const updatedDay = { ...dayItem, slots: updatedSlots }
            return [...prev.slice(0, dayIndex), updatedDay, ...prev.slice(dayIndex + 1)]
          }
        }
      }
    })
  }

  // Check if a slot is selected
  const isSlotSelected = (day: string, slot: string) => {
    const dayItem = selectedAvailability.find((item) => item.day === day)
    return dayItem ? dayItem.slots.includes(slot) : false
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Manage doctors and their availability</p>
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>Add a new doctor to the system and set their availability.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Doctor Details</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. John Doe" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
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
                              <Input placeholder="doctor@hospital.com" {...field} />
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="On Leave">On Leave</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="availability" className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <h3 className="text-lg font-medium">Set Weekly Availability</h3>
                  </div>

                  <div className="space-y-6">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="space-y-2">
                        <h4 className="font-medium">{day}</h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {timeSlots.map((slot) => (
                            <div key={`${day}-${slot}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${day}-${slot}`}
                                checked={isSlotSelected(day, slot)}
                                onCheckedChange={() => toggleAvailabilitySlot(day, slot)}
                              />
                              <Label htmlFor={`${day}-${slot}`} className="text-sm">
                                {slot}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(handleAddDoctor)}>Add Doctor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <TableCell className="font-medium">{doctor.user.name}</TableCell>
                  <TableCell>{doctor.user.doctorProfiles[0]?.speciality}</TableCell>
                  <TableCell>{doctor.user.email}</TableCell>
                  <TableCell>{doctor.user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        "default"
                      }
                    >
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(doctor)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {doctor.user.name} from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveDoctor(doctor.user.doctorProfiles[0].id)}>Delete</AlertDialogAction>
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

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Update doctor information and availability.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Personal Info</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="availability" className="py-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <h3 className="text-lg font-medium">Set Weekly Availability</h3>
                </div>

                <div className="space-y-6">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="space-y-2">
                      <h4 className="font-medium">{day}</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {timeSlots.map((slot) => (
                          <div key={`${day}-${slot}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${day}-${slot}`}
                              checked={isSlotSelected(day, slot)}
                              onCheckedChange={() => toggleAvailabilitySlot(day, slot)}
                            />
                            <Label htmlFor={`edit-${day}-${slot}`} className="text-sm">
                              {slot}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="services" className="py-4">
              {selectedDoctor && <ServicesCrud doctorId={selectedDoctor.user.doctorProfiles[0].id} />}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleEditDoctor)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}