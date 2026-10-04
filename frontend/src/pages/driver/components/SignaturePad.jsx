import React, { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
export default function SignaturePad({ onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const [ink, setInk] = useState(false);
  useEffect(() => {
    const c = ref.current;
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
  }, []);
  const pt = (e) => { const r = ref.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const down = (e) => {
    ref.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const ctx = ref.current.getContext("2d");
    const [x, y] = pt(e);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y); ctx.stroke();
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext("2d");
    const [x, y] = pt(e);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const out = document.createElement("canvas");
    out.width = 420; out.height = 160;
    const o = out.getContext("2d");
    o.fillStyle = "#fff"; o.fillRect(0, 0, out.width, out.height);
    o.drawImage(ref.current, 0, 0, out.width, out.height);
    setInk(true);
    onChange(out.toDataURL("image/png"));
  };
  const clear = () => {
    const c = ref.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setInk(false);
    onChange(null);
  };
  return (
    <div>
      <div className="relative rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white overflow-hidden">
        <canvas ref={ref} data-testid="signature-pad" className="w-full h-36 block" style={{ touchAction: "none" }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        {!ink && <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">Sign here</span>}
      </div>
      <button type="button" onClick={clear} className="mt-1 text-xs text-gray-500 flex items-center gap-1"><Eraser className="w-3.5 h-3.5" /> Clear signature</button>
    </div>
  );
}
