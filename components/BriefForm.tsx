"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BriefInput } from "@/lib/types";

export default function BriefForm() {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BriefInput>({
    eventName: "",
    audience: "",
    vibe: "",
    cta: "",
    description: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vibeOptions = [
    "futuristic",
    "energetic",
    "minimal",
    "bold",
    "playful",
    "elegant",
    "retro",
    "dark",
  ];

  function handleChange(field: keyof BriefInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "qr"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setQrFile(file);
        setQrPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.eventName || !form.audience || !form.vibe || !form.cta) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      let logoPath: string | undefined;
      let qrCodePath: string | undefined;

      if (logoFile || qrFile) {
        const formData = new FormData();
        if (logoFile) formData.append("logo", logoFile);
        if (qrFile) formData.append("qrCode", qrFile);
        const uploadRes = await fetch("/api/upload-logo", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        logoPath = uploadData.logoPath;
        qrCodePath = uploadData.qrCodePath;
      }

      const briefPayload: BriefInput = { ...form, logoPath, qrCodePath };

      const planRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefPayload),
      });

      if (!planRes.ok) throw new Error("Failed to generate creative plan");

      const { jobId } = await planRes.json();
      router.push(`/results/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4.5">
      {/* File uploads */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
            Logo
          </label>
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border border-dashed border-white/[0.12] hover:border-indigo-300/50 bg-white/[0.015] rounded-xl p-3 cursor-pointer transition-colors h-[72px] flex items-center justify-center"
          >
            {logoPreview ? (
              <div className="flex items-center gap-2">
                <img src={logoPreview} alt="Logo" className="w-7 h-7 object-contain rounded" />
                <span className="text-[11px] text-zinc-400 truncate max-w-[80px]">
                  {logoFile?.name}
                </span>
              </div>
            ) : (
              <span className="text-[12px] text-zinc-500">Upload logo</span>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "logo")} className="hidden" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
            QR code
          </label>
          <div
            onClick={() => qrInputRef.current?.click()}
            className="border border-dashed border-white/[0.12] hover:border-indigo-300/50 bg-white/[0.015] rounded-xl p-3 cursor-pointer transition-colors h-[72px] flex items-center justify-center"
          >
            {qrPreview ? (
              <div className="flex items-center gap-2">
                <img src={qrPreview} alt="QR" className="w-7 h-7 object-contain rounded" />
                <span className="text-[11px] text-zinc-400 truncate max-w-[80px]">
                  {qrFile?.name}
                </span>
              </div>
            ) : (
              <span className="text-[12px] text-zinc-500">Upload QR code</span>
            )}
            <input ref={qrInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, "qr")} className="hidden" />
          </div>
        </div>
      </div>

      {/* Event name */}
      <div>
        <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
          Event name <span className="text-zinc-600">*</span>
        </label>
        <input
          type="text"
          value={form.eventName}
          onChange={(e) => handleChange("eventName", e.target.value)}
          placeholder="LA Google DeepMind Hackathon"
          className="form-input"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
            Start date
          </label>
          <input type="date" value={form.eventDate || ""} onChange={(e) => handleChange("eventDate", e.target.value)} className="form-input [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
            End date
          </label>
          <input type="date" value={form.eventEndDate || ""} onChange={(e) => handleChange("eventEndDate", e.target.value)} className="form-input [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
            Time
          </label>
          <input type="time" value={form.eventTime || ""} onChange={(e) => handleChange("eventTime", e.target.value)} className="form-input [color-scheme:dark]" />
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
          Target audience <span className="text-zinc-600">*</span>
        </label>
        <input
          type="text"
          value={form.audience}
          onChange={(e) => handleChange("audience", e.target.value)}
          placeholder="College students interested in AI"
          className="form-input"
        />
      </div>

      {/* Vibe */}
      <div>
        <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
          Vibe <span className="text-zinc-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {vibeOptions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChange("vibe", v)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
                form.vibe === v
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)]"
                  : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200 border border-white/[0.08]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div>
        <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
          Call to action <span className="text-zinc-600">*</span>
        </label>
        <input
          type="text"
          value={form.cta}
          onChange={(e) => handleChange("cta", e.target.value)}
          placeholder="Register now"
          className="form-input"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] tracking-wide uppercase text-zinc-500 mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="A student hackathon focused on generative media tools"
          rows={2}
          className="form-input resize-none"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 px-3 py-2.5 text-red-300 text-[13px]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl py-3 px-4 font-semibold text-[14px] text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          "Generate promo kit"
        )}
      </button>
    </form>
  );
}
