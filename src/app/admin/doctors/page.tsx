"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { add } from "date-fns";

export default function DoctorsPage() {
  return (
    <div>
      hello
      <div>world</div>
      <Card>
        <CardContent>
          <form>
            <div>
              <WeeklyAvailability></WeeklyAvailability>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DayAvailabilty() {
  const [arr, setArr] = useState([1]);

  function removeAvailability(i: number) {
    if (i == 0) {
      return; // Keep atleast one availability always
    }
    const newarr = arr.filter((value, index) => index !== i);

    setArr(() => newarr);
  }

  function addAvailability() {
    const newarr = arr.slice();
    newarr.push(2);
    console.log(newarr);
    setArr(() => newarr);
  }

  return (
    <>
      {arr.map((value, index) => (
        <div key={index} className="flex flex-row space-x-2">
          <TimeSlotsDropdown />
          <div className="items-center"> - </div>
          <TimeSlotsDropdown />
          {index == 0 ? (
            <button type="button" onClick={addAvailability}>
              +
            </button>
          ) : (
            <button type="button" onClick={() => removeAvailability(index)}>
              -
            </button>
          )}
        </div>
      ))}
    </>
  );
}

function TimeSlotsDropdown() {
  function getTimeSlots() {
    const slots = [];
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 60; j += 15) {
        let timestring =
          String(i == 0 ? "12" : i) + ":" + String(j == 0 ? "00" : j) + " am";

        slots.push(
          <SelectItem key={timestring} value={timestring}>
            {timestring}
          </SelectItem>
        );
      }
    }

    return slots;
  }

  return (
    <Select>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>{...getTimeSlots()}</SelectContent>
    </Select>
  );
}

function WeeklyAvailability() {
  type Day =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  const days: Day[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const daysEnabledDefault = {
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true,
  };
  const [daysEnabled, setDaysEnabled] = useState(daysEnabledDefault);

  function toggleDayAvailability(day: Day) {
    setDaysEnabled((prevState) => ({
      ...prevState,
      [day]: !prevState[day],
    }));
  }

  return (
    <div className="space-y-2">
      {days.map((day) => (
        <div key={day} className="flex items-center justify-between space-x-5">
          <div className="flex space-x-4">
            <Switch
              id={day}
              checked={daysEnabled[day]}
              onCheckedChange={() => toggleDayAvailability(day)}
            />
            <Label htmlFor={day}>{day} </Label>
          </div>
          <div>{daysEnabled[day] && <DayAvailabilty></DayAvailabilty>}</div>
        </div>
      ))}
    </div>
  );
}
