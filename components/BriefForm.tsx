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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Logo + QR uploads side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Club / Event Logo
          </label>
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-4 text-center cursor-pointer transition-colors group min-h-[120px] flex items-center justify-center"
          >
            {logoPreview ? (
              <div className="flex flex-col items-center gap-1.5">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-12 h-12 object-contain rounded-lg"
                />
                <span className="text-[11px] text-white/40 truncate max-w-full">
                  {logoFile?.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/30 group-hover:text-indigo-400 transition-colors"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                  Upload logo
                </span>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "logo")}
              className="hidden"
            />
          </div>
        </div>

        {/* QR Code upload */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            QR Code
          </label>
          <div
            onClick={() => qrInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl p-4 text-center cursor-pointer transition-colors group min-h-[120px] flex items-center justify-center"
          >
            {qrPreview ? (
              <div className="flex flex-col items-center gap-1.5">
                <img
                  src={qrPreview}
                  alt="QR code preview"
                  className="w-12 h-12 object-contain rounded-lg"
                />
                <span className="text-[11px] text-white/40 truncate max-w-full">
                  {qrFile?.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-purple-500/10 flex items-center justify-center transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/30 group-hover:text-purple-400 transition-colors"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="3" height="3" rx="0.5" />
                    <rect x="18" y="14" width="3" height="3" rx="0.5" />
                    <rect x="14" y="18" width="3" height="3" rx="0.5" />
                    <rect x="18" y="18" width="3" height="3" rx="0.5" />
                  </svg>
                </div>
                <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                  Upload QR code
                </span>
              </div>
            )}
            <input
              ref={qrInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "qr")}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Event name */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Event Name <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          value={form.eventName}
          onChange={(e) => handleChange("eventName", e.target.value)}
          placeholder="LA Google DeepMind Hackathon"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Event Date
          </label>
          <input
            type="date"
            value={form.eventDate || ""}
            onChange={(e) => handleChange("eventDate", e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Event Time
          </label>
          <input
            type="time"
            value={form.eventTime || ""}
            onChange={(e) => handleChange("eventTime", e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Target Audience <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          value={form.audience}
          onChange={(e) => handleChange("audience", e.target.value)}
          placeholder="College students interested in AI"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
        />
      </div>

      {/* Vibe */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Vibe <span className="text-indigo-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {vibeOptions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChange("vibe", v)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                form.vibe === v
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Call to Action <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          value={form.cta}
          onChange={(e) => handleChange("cta", e.target.value)}
          placeholder="Register now"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Short Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="A student hackathon focused on generative media tools and creative building"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full relative overflow-hidden rounded-xl py-3.5 px-6 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 text-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating your promo kit...
          </span>
        ) : (
          "Generate Promo Kit"
        )}
      </button>
    </form>
  );
}
