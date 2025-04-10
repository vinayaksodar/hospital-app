"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Filter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleDocterId(docterId: string) {
    const params = new URLSearchParams(searchParams);
    if (docterId) {
      params.set("docterId", docterId);
    } else {
      params.delete("docterId");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }
  return (
    <Select onValueChange={(value) => handleDocterId(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="select something" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel> select label </SelectLabel>

          <SelectItem value="1"> 1</SelectItem>
          <SelectItem value="0"> 0</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
