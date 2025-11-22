"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Book, User, Stethoscope, Wallet } from "lucide-react";

type DashboardMetrics = {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
};

type Appointment = {
  booking: {
    id: number;
    startDateUTC: string;
  };
  service: {
    name: string;
  };
  doctorUser: {
    name: string;
  };
  patientUser: {
    name: string;
  };
};

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch("/api/admin/dashboard-metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    };

    const fetchTodaysAppointments = async () => {
      const res = await fetch("/api/admin/todays-appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    };

    fetchMetrics();
    fetchTodaysAppointments();
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalDoctors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalAppointments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/admin/patients">Register New Patient</Link>
        </Button>
        <Button asChild>
          <Link href="/admin/doctors">Add New Doctor</Link>
        </Button>
        <Button asChild>
          <Link href="/admin/calendar">View Full Calendar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.booking.id}>
                  <TableCell>{appointment.patientUser.name}</TableCell>
                  <TableCell>{appointment.doctorUser.name}</TableCell>
                  <TableCell>{appointment.service.name}</TableCell>
                  <TableCell>
                    {new Date(
                      appointment.booking.startDateUTC
                    ).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
