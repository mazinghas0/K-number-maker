"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TimeCapsuleItem, Translation, ThemeColors } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

const DEVICE_KEY = "k-device-id";

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function daysUntil(dateStr: string): number {
  const open = new Date(dateStr);
  const now = new Date();
  open.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((open.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface Props {
  numbers: number[];
  t: Translation;
  activeTheme: ThemeColors;
}

const DAY_OPTIONS = [7, 30, 100] as const;

export default function TimeCapsule({ numbers, t, activeTheme }: Props) {
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [days, setDays] = useState<7 | 30 | 100>(30);
  const [saving, setSaving] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const fetchCapsules = useCallback(async () => {
    const deviceId = getDeviceId();
    if (!deviceId) return;
    const { data } = await supabase
      .from("timecapsules")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setCapsules(data as TimeCapsuleItem[]);
  }, []);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const handleSeal = useCallback(async () => {
    if (!message.trim() || saving || numbers.length === 0) return;
    setSaving(true);
    const deviceId = getDeviceId();
    await supabase.from("timecapsules").insert([{
      device_id: deviceId,
      numbers,
      message: message.trim(),
      open_at: addDays(days),
    }]);
    setMessage("");
    setShowForm(false);
    setSaving(false);
    await fetchCapsules();
  }, [message, saving, numbers, days, fetchCapsules]);

  const handleOpen = useCallback(async (id: string) => {
    setOpeningId(id);
    await supabase.from("timecapsules").update({ is_opened: true }).eq("id", id);
    await fetchCapsules();
    setOpeningId(null);
  }, [fetchCapsules]);

  const DAY_LABELS: Record<number, string> = {
    7: t.tcDays7,
    30: t.tcDays30,
    100: t.tcDays100,
  };

  return (
    <div className={`mt-4 rounded-2xl border border-white/10 overflow-hidden ${activeTheme.card}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setShowForm((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">⏳</span>
          <span className="text-sm font-black text-white">{t.tcTitle}</span>
          {capsules.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {capsules.length}
            </span>
          )}
        </div>
        {numbers.length > 0 && (
          <span className="text-xs font-black text-amber-400 border border-amber-400/40 px-3 py-1 rounded-full bg-amber-400/10">
            {showForm ? "✕" : t.tcSealBtn}
          </span>
        )}
      </div>

      {/* Seal form */}
      {showForm && numbers.length > 0 && (
        <div className="px-5 pb-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          {/* Current numbers */}
          <div className="flex gap-2 flex-wrap">
            {numbers.map((n, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md ${getBallColor(n)}`}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Day selector */}
          <div className="flex gap-2">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                  days === d
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            placeholder={t.tcMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none resize-none"
          />

          {/* Submit */}
          <button
            onClick={handleSeal}
            disabled={saving || !message.trim()}
            className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all"
          >
            {saving ? "..." : `⏳ ${t.tcSealBtn}`}
          </button>
        </div>
      )}

      {/* Capsule list */}
      {capsules.length > 0 && (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div className="h-px bg-white/5 mb-1" />
          {capsules.map((cap) => {
            const remaining = daysUntil(cap.open_at);
            const canOpen = remaining <= 0 && !cap.is_opened;
            return (
              <div
                key={cap.id}
                className={`rounded-xl p-4 border transition-all ${
                  cap.is_opened
                    ? "bg-green-500/5 border-green-500/20"
                    : canOpen
                    ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : "bg-white/3 border-white/8"
                }`}
              >
                {/* Numbers */}
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {cap.numbers.map((n, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                        cap.is_opened ? getBallColor(n) : "bg-white/10 text-white/50"
                      }`}
                    >
                      {cap.is_opened ? n : "?"}
                    </div>
                  ))}
                </div>

                {/* Message (shown only if opened) */}
                {cap.is_opened && (
                  <p className="text-sm text-white/70 italic mb-2">&quot;{cap.message}&quot;</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-bold">
                    {cap.is_opened
                      ? new Date(cap.created_at).toLocaleDateString()
                      : canOpen
                      ? "✨ " + t.tcOpened
                      : `${t.tcOpenIn} ${remaining}${t.tcCountdown}`}
                  </span>
                  {canOpen && (
                    <button
                      onClick={() => handleOpen(cap.id)}
                      disabled={openingId === cap.id}
                      className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 active:scale-95 transition-all"
                    >
                      {t.tcOpened}
                    </button>
                  )}
                  {cap.is_opened && (
                    <span className="text-[10px] text-green-400 font-black">✓ 개봉완료</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {capsules.length === 0 && !showForm && (
        <p className="text-center text-[11px] text-white/30 font-bold pb-4">{t.tcEmpty}</p>
      )}
    </div>
  );
}
