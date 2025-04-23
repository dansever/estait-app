"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: string;
  iconOnly?: boolean;
  disabledDate?: (date: Date) => boolean;
};

export default function DatePicker({
  date,
  onChange,
  label,
  iconOnly = false,
  disabledDate,
}: DatePickerProps) {
  return (
    <div className="space-y-2">
      {label && !iconOnly && <p className="text-sm font-medium">{label}</p>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              iconOnly
                ? "h-8 w-8 p-0"
                : "w-[240px] justify-start text-left pl-3",
              !date && !iconOnly && "text-muted-foreground"
            )}
          >
            {iconOnly ? (
              <CalendarIcon className="h-4 w-4" />
            ) : (
              <>
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border shadow-lg bg-white dark:bg-gray-900"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            disabled={disabledDate}
            initialFocus
            className="border-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
