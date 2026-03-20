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

  // Sync internal state with props if they change externally (e.g., when editing a survey)
  useEffect(() => {
    if (defaultDistrict !== district) {
      setDistrict(defaultDistrict);
    }
    if (defaultTaluka !== taluka) {
      setTaluka(defaultTaluka);
    }
  }, [defaultDistrict, defaultTaluka]);

  useEffect(() => {
    if (district) {
      setTalukas(MAHARASHTRA_LOCATIONS[district] || []);
    } else {
      setTalukas([]);
    }
  }, [district]);

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setTaluka("");
    onLocationChange(val, "");
  };

  const handleTalukaChange = (val: string) => {
    setTaluka(val);
    onLocationChange(district, val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="form-label-mr font-bold">तुमचा जिल्हा निवडा</Label>
        <Select value={district} onValueChange={handleDistrictChange}>
          <SelectTrigger className="h-10 border-primary/20">
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
        <Label className="form-label-mr font-bold">तुमचा तालुका निवडा</Label>
        <Select value={taluka} onValueChange={handleTalukaChange} disabled={!district}>
          <SelectTrigger className="h-10 border-primary/20">
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
