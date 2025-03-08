"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

// Mock data for appointments
const appointments = [
  {
    id: "APP001",
    patient: "John Doe",
    doctor: "Dr. Sarah Smith",
    specialty: "Cardiology",
    date: "2025-03-10",
    time: "09:00 AM",
    status: "Confirmed",
  },
  {
    id: "APP002",
    patient: "Jane Smith",
    doctor: "Dr. Michael Johnson",
    specialty: "Neurology",
    date: "2025-03-10",
    time: "10:30 AM",
    status: "Completed",
  },
  {
    id: "APP003",
    patient: "Robert Brown",
    doctor: "Dr. Emily Davis",
    specialty: "Pediatrics",
    date: "2025-03-11",
    time: "02:00 PM",
    status: "Cancelled",
  },
  {
    id: "APP004",
    patient: "Maria Garcia",
    doctor: "Dr. James Wilson",
    specialty: "Orthopedics",
    date: "2025-03-12",
    time: "11:15 AM",
    status: "Confirmed",
  },
  {
    id: "APP005",
    patient: "William Johnson",
    doctor: "Dr. Sarah Smith",
    specialty: "Cardiology",
    date: "2025-03-12",
    time: "03:45 PM",
    status: "Pending",
  },
  {
    id: "APP006",
    patient: "Elizabeth Taylor",
    doctor: "Dr. Michael Johnson",
    specialty: "Neurology",
    date: "2025-03-13",
    time: "09:30 AM",
    status: "Confirmed",
  },
  {
    id: "APP007",
    patient: "David Miller",
    doctor: "Dr. Emily Davis",
    specialty: "Pediatrics",
    date: "2025-03-13",
    time: "01:00 PM",
    status: "Confirmed",
  },
  {
    id: "APP008",
    patient: "Jennifer Wilson",
    doctor: "Dr. James Wilson",
    specialty: "Orthopedics",
    date: "2025-03-14",
    time: "10:00 AM",
    status: "Pending",
  },
]

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")

  // Get unique doctors for filter
  const doctors = [...new Set(appointments.map((app) => app.doctor))]

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    const matchesDoctor = doctorFilter === "all" || appointment.doctor === doctorFilter

    return matchesSearch && matchesStatus && matchesDoctor
  })

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "default"
      case "Completed":
        return "success"
      case "Cancelled":
        return "destructive"
      case "Pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-neutral-500 dark:text-neutral-400">View and manage all doctor appointments</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <Input
            placeholder="Search appointments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Filter by doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor} value={doctor}>
                {doctor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id}</TableCell>
                  <TableCell>{appointment.patient}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{appointment.specialty}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appointment.status) as any}>{appointment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

