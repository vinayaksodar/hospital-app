"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { format, parseISO } from "date-fns";

interface Appointment {
  id: string;
  patientName: string;
  doctor: {
    id: number;
    name: string;
    specialty: string;
  };
  startDateUTC: string;
  endDateUTC: string;
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
}

interface ApiResponse {
  data: {
    bookings: {
      id: string;
      patientName: string;
      doctorId: number;
      consultationId: string;
      startDateUTC: string;
      endDateUTC: string;
      status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
      consultation: {
        id: string;
        type: string;
      };
      doctor: {
        id: number;
        userId: string;
        specialty: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      };
    }[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [doctorFilter, setDoctorFilter] = useState(
    searchParams.get("doctor") || "all"
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined
  );

  // State for data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
    total: 0,
    totalPages: 1,
  });

  // Fetch appointments and doctors
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Create query params
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (doctorFilter !== "all") params.set("doctorId", doctorFilter);
        if (startDate) params.set("startDate", startDate.toISOString());
        if (endDate) params.set("endDate", endDate.toISOString());
        params.set("page", pagination.page.toString());
        params.set("limit", pagination.limit.toString());

        // Fetch appointments
        const appointmentsRes = await fetch(
          `/api/appointments?${params.toString()}`
        );
        if (!appointmentsRes.ok)
          throw new Error("Failed to fetch appointments");
        const data: ApiResponse = await appointmentsRes.json();

        // Transform data to match our frontend structure
        const transformedAppointments = data.data.bookings.map((booking) => ({
          id: booking.id,
          patientName: booking.patientName,
          doctor: {
            id: booking.doctor.id,
            name: booking.doctor.user.name,
            specialty: booking.doctor.specialty,
          },
          startDateUTC: booking.startDateUTC,
          endDateUTC: booking.endDateUTC,
          status: booking.status,
        }));

        setAppointments(transformedAppointments);
        setPagination(data.pagination);

        // Fetch doctors list if not already done
        if (doctors.length === 0) {
          const doctorsRes = await fetch("/api/doctors");
          if (!doctorsRes.ok) throw new Error("Failed to fetch doctors");
          const doctorsData = await doctorsRes.json();
          setDoctors(
            doctorsData.map((d: any) => ({
              id: d.id,
              name: d.user.name,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Update URL with current filters
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (doctorFilter !== "all") params.set("doctor", doctorFilter);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());
    params.set("page", pagination.page.toString());

    router.replace(`${pathname}?${params.toString()}`);
  }, [
    searchTerm,
    statusFilter,
    doctorFilter,
    startDate,
    endDate,
    pagination.page,
    pagination.limit,
  ]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Status badge color mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "default";
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "yyyy-MM-dd");
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), "hh:mm a");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDoctorFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          View and manage all doctor appointments
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
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

          <Select
            value={doctorFilter}
            onValueChange={(value) => {
              setDoctorFilter(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Filter by doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Start date"
            />
            <span className="text-neutral-500">to</span>
            <DatePicker
              selected={endDate}
              onSelect={(date) => {
                setEndDate(date);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="End date"
              minDate={startDate}
            />
          </div>
          <Button variant="outline" onClick={resetFilters} className="ml-auto">
            Reset Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
          Error: {error}
        </div>
      )}

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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.id}
                  </TableCell>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.doctor.name}</TableCell>
                  <TableCell>{appointment.doctor.specialty}</TableCell>
                  <TableCell>{formatDate(appointment.startDateUTC)}</TableCell>
                  <TableCell>{formatTime(appointment.startDateUTC)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(appointment.status) as any}
                    >
                      {appointment.status}
                    </Badge>
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

      {!isLoading && appointments.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1)
                    handlePageChange(pagination.page - 1);
                }}
                className={
                  pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={pageNum === pagination.page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.totalPages)
                    handlePageChange(pagination.page + 1);
                }}
                className={
                  pagination.page === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
