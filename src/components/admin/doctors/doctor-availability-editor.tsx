"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Trash2 } from "lucide-react";
import {
  Availability,
  daysOfWeek,
  convertApiAvailabilitiesToSelections,
  convertSelectionsToUtcPayload,
} from "@/lib/doctor-utils";

type DoctorAvailabilityEditorProps = {
  profileId: number;
};

export function DoctorAvailabilityEditor({
  profileId,
}: DoctorAvailabilityEditorProps) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
        setIsLoading(false);
        return;
    };

    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/doctors/${profileId}/schedules`);
        if (res.ok) {
          const schedules = await res.json();
          const schedule =
            Array.isArray(schedules) && schedules.length > 0
              ? schedules[0]
              : schedules;
          const apiAvailabilities = schedule?.availabilities ?? [];
          setAvailability(
            convertApiAvailabilitiesToSelections(apiAvailabilities)
          );
        } else {
          console.error("Failed to fetch schedules, starting with empty.");
          setAvailability([]);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setAvailability([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [profileId]);

  const addRange = (day: string) => {
    setAvailability((prev) => {
      const dayIndex = prev.findIndex((d) => d.day === day);
      const newRange = { start: "09:00", end: "17:00" };
      if (dayIndex > -1) {
        const updated = [...prev];
        updated[dayIndex].ranges.push(newRange);
        return updated;
      } else {
        return [...prev, { day, ranges: [newRange] }];
      }
    });
  };

  const updateRange = (
    day: string,
    rangeIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              ranges: d.ranges.map((r, i) =>
                i === rangeIndex ? { ...r, [field]: value } : r
              ),
            }
          : d
      )
    );
  };

  const removeRange = (day: string, rangeIndex: number) => {
    setAvailability((prev) =>
      prev
        .map((d) =>
          d.day === day
            ? { ...d, ranges: d.ranges.filter((_, i) => i !== rangeIndex) }
            : d
        )
        .filter((d) => d.ranges.length > 0)
    );
  };

  const handleSave = async () => {
    if (!profileId) {
      alert("Cannot save availability. Doctor profile not found.");
      return;
    }

    try {
      const payload = convertSelectionsToUtcPayload(availability);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const body = {
        schedule: {
          name: "Default Schedule",
          timezone,
          availabilities: payload,
        },
      };

      const res = await fetch(`/api/doctors/${profileId}/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      alert("Availability saved successfully!");
    } catch (error) {
      console.error("Failed to save availability:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading) {
    return <div>Loading availability...</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center">
        <Calendar className="mr-2 h-4 w-4" />
        <h3 className="text-lg font-medium">Set Weekly Availability</h3>
      </div>

      {daysOfWeek.map((day) => {
        const dayItem = availability.find((d) => d.day === day);
        return (
          <div key={day} className="space-y-2 border-b pb-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{day}</h4>
              <Button size="sm" variant="outline" onClick={() => addRange(day)}>
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
                  onChange={(e) => updateRange(day, idx, "start", e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-neutral-500">to</span>
                <Input
                  type="time"
                  value={range.end}
                  onChange={(e) => updateRange(day, idx, "end", e.target.value)}
                  className="w-32"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeRange(day, idx)}
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
        <Button onClick={handleSave}>Save Availability</Button>
      </div>
    </div>
  );
}
