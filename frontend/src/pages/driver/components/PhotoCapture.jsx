import React, { useState } from "react";
import { Camera } from "lucide-react";
import { compressImage } from "../lib/media";
export default function PhotoCapture({ value, onChange }) {
  const [err, setErr] = useState("");
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setErr(""); onChange(await compressImage(f)); } catch (x) { setErr(x.message); }
  };
  return (
    <div>
      <label className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 cursor-pointer">
        {value ? <img src={value} alt="Delivery proof" className="w-20 h-20 rounded-xl object-cover" /> : <span className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Camera className="w-7 h-7 text-gray-400" /></span>}
        <span className="text-sm font-bold">{value ? "Retake photo" : "Take delivery photo"}<span className="block text-xs font-normal text-gray-500">Goods at the outlet, required</span></span>
        <input data-testid="photo-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
      </label>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
    </div>
  );
}
