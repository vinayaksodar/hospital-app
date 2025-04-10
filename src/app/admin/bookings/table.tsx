import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cookies } from "next/headers";

const cookieStore = await cookies();

export default async function BookingsTable({
  doctorId,
  startDate,
  endDate,
  page,
}: {
  doctorId: string;
  startDate: string;
  endDate: string;
  page: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  let apiEndpoint = `${baseUrl}/api/bookings`;

  // Create an object to hold query parameters
  const queryParams = new URLSearchParams();

  if (doctorId !== "") queryParams.append("doctorId", doctorId);
  if (startDate !== "") queryParams.append("startDate", startDate);
  if (endDate !== "") queryParams.append("endDate", endDate);
  if (page !== "") queryParams.append("page", page);

  // Add query string if there are any parameters
  if (Array.from(queryParams).length > 0) {
    apiEndpoint += `?${queryParams.toString()}`;
  }
  const response = await fetch(apiEndpoint, {
    headers: { Cookie: cookieStore.toString() },
  });
  const data = await response.json();
  const bookings = data.bookings;
  console.log(data);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Doctor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.inviteeEmail}</TableCell>
                <TableCell>{booking.startDateUTC}</TableCell>
                <TableCell>{booking.consultation.duration}</TableCell>
                <TableCell>{booking.doctor.user.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
