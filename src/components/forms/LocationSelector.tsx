"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS, MAHARASHTRA_LOCATIONS } from "@/lib/location-data";

interface LocationSelectorProps {
  onLocationChange: (district: string, taluka: string) => void;
  defaultDistrict?: string;
  defaultTaluka?: string;
}

export function LocationSelector({ onLocationChange, defaultDistrict = "", defaultTaluka = "" }: LocationSelectorProps) {
  const [district, setDistrict] = useState(defaultDistrict);
  const [taluka, setTaluka] = useState(defaultTaluka);
  const [talukas, setTalukas] = useState<string[]>([]);

  useEffect(() => {
    if (district) {
      setTalukas(MAHARASHTRA_LOCATIONS[district] || []);
    } else {
      setTalukas([]);
    }
  }, [district]);

  useEffect(() => {
    onLocationChange(district, taluka);
  }, [district, taluka]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="form-label-mr">जिल्हा (District)</Label>
        <Select value={district} onValueChange={(val) => { setDistrict(val); setTaluka(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="जिल्हा निवडा" />
          </SelectTrigger>
          <SelectContent>
            {DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="form-label-mr">तालुका (Taluka)</Label>
        <Select value={taluka} onValueChange={setTaluka} disabled={!district}>
          <SelectTrigger>
            <SelectValue placeholder="तालुका निवडा" />
          </SelectTrigger>
          <SelectContent>
            {talukas.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
