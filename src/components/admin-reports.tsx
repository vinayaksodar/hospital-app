
"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Booking = {
  id: number;
  status: string;
  doctor: {
    user: {
      name: string;
    };
  };
};

type Doctor = {
  user: {
    name: string;
  };
};

export function AdminReports() {
  const [appointmentsPerDoctor, setAppointmentsPerDoctor] = useState<any[]>([])
  const [bookingStatusDistribution, setBookingStatusDistribution] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const bookingsRes = await fetch("/api/bookings")
      const bookingsData = await bookingsRes.json()
      const bookings: Booking[] = bookingsData.bookings

      // Process appointments per doctor
      const appointmentsCount = bookings.reduce((acc, booking) => {
        const doctorName = booking.doctor.user.name
        acc[doctorName] = (acc[doctorName] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const appointmentsChartData = Object.keys(appointmentsCount).map((doctorName) => ({
        name: doctorName,
        appointments: appointmentsCount[doctorName],
      }))
      setAppointmentsPerDoctor(appointmentsChartData)

      // Process booking status distribution
      const statusCount = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const statusChartData = Object.keys(statusCount).map((status) => ({
        name: status,
        value: statusCount[status],
      }))
      setBookingStatusDistribution(statusChartData)
    }

    fetchData()
  }, [])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1919"];

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments per Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentsPerDoctor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {bookingStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
