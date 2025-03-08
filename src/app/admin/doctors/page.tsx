"use client"

import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, Clock, Edit, Search, Trash2, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"

// Mock data for doctors
const initialDoctors = [
  {
    id: "DOC001",
    name: "Dr. Sarah Smith",
    specialty: "Cardiology",
    email: "sarah.smith@hospital.com",
    phone: "(555) 123-4567",
    status: "Active",
    availability: [
      { day: "Monday", slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00"] },
      { day: "Wednesday", slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00"] },
      { day: "Friday", slots: ["09:00 AM - 12:00 PM"] },
    ],
  },
  {
    id: "DOC002",
    name: "Dr. Michael Johnson",
    specialty: "Neurology",
    email: "michael.johnson@hospital.com",
    phone: "(555) 234-5678",
    status: "Active",
    availability: [
      { day: "Tuesday", slots: ["10:00 AM - 01:00 PM", "03:00 PM - 06:00"] },
      { day: "Thursday", slots: ["10:00 AM - 01:00 PM", "03:00 PM - 06:00"] },
    ],
  },
  {
    id: "DOC003",
    name: "Dr. Emily Davis",
    specialty: "Pediatrics",
    email: "emily.davis@hospital.com",
    phone: "(555) 345-6789",
    status: "On Leave",
    availability: [
      { day: "Monday", slots: ["08:00 AM - 12:00 PM"] },
      { day: "Wednesday", slots: ["08:00 AM - 12:00 PM"] },
      { day: "Friday", slots: ["08:00 AM - 12:00 PM"] },
    ],
  },
  {
    id: "DOC004",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    email: "james.wilson@hospital.com",
    phone: "(555) 456-7890",
    status: "Active",
    availability: [
      { day: "Monday", slots: ["01:00 PM - 05:00"] },
      { day: "Tuesday", slots: ["01:00 PM - 05:00"] },
      { day: "Thursday", slots: ["01:00 PM - 05:00"] },
      { day: "Friday", slots: ["01:00 PM - 05:00"] },
    ],
  },
]

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

type Doctor = (typeof initialDoctors)[0]
type Availability = { day: string; slots: string[] }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(initialDoctors)
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

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle adding a new doctor
  const handleAddDoctor = (data: any) => {
    const newDoctor = {
      id: `DOC${(doctors.length + 1).toString().padStart(3, "0")}`,
      name: data.name,
      specialty: data.specialty,
      email: data.email,
      phone: data.phone,
      status: data.status,
      availability: selectedAvailability,
    }

    setDoctors([...doctors, newDoctor])
    setIsAddDialogOpen(false)
    form.reset()
    setSelectedAvailability([])
  }

  // Handle editing a doctor
  const handleEditDoctor = (data: any) => {
    if (!selectedDoctor) return

    const updatedDoctors = doctors.map((doctor) =>
      doctor.id === selectedDoctor.id
        ? {
            ...doctor,
            name: data.name,
            specialty: data.specialty,
            email: data.email,
            phone: data.phone,
            status: data.status,
            availability: selectedAvailability,
          }
        : doctor,
    )

    setDoctors(updatedDoctors)
    setIsEditDialogOpen(false)
    setSelectedDoctor(null)
    setSelectedAvailability([])
  }

  // Handle removing a doctor
  const handleRemoveDoctor = (id: string) => {
    setDoctors(doctors.filter((doctor) => doctor.id !== id))
  }

  // Open edit dialog with doctor data
  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    form.reset({
      name: doctor.name,
      specialty: doctor.specialty,
      email: doctor.email,
      phone: doctor.phone,
      status: doctor.status,
    })
    setSelectedAvailability(doctor.availability)
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
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        doctor.status === "Active" ? "default" : doctor.status === "On Leave" ? "secondary" : "outline"
                      }
                    >
                      {doctor.status}
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
                              This will permanently remove {doctor.name} from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveDoctor(doctor.id)}>Delete</AlertDialogAction>
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
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleEditDoctor)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Availability Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Doctor Availability</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {doctor.availability.length > 0 ? (
                    doctor.availability.map((avail) => (
                      <div key={`${doctor.id}-${avail.day}`} className="space-y-1">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                          <span className="font-medium">{avail.day}</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {avail.slots.map((slot) => (
                            <div key={`${doctor.id}-${avail.day}-${slot}`} className="flex items-center text-sm">
                              <Clock className="mr-2 h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                              {slot}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">No availability set</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

