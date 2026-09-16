"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, Send, Sparkles, ExternalLink } from "lucide-react";

interface CalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalModal({ isOpen, onClose }: CalModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#0e0e14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-gold-400 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Shader Consultation</span>
        </div>

        <h3 className="font-stix text-3xl font-normal text-white">
          Book a Discovery Call
        </h3>
        <p className="mt-2 text-sm text-white/60 font-light flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold-400" />
          <span>30 Minutes • Filip Kantedal (Founder / Creative Director)</span>
        </p>

        {/* Direct Link Option */}
        <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
          <div className="text-xs text-white/80">
            Prefer direct Cal.com calendar selector?
          </div>
          <a
            href="https://cal.com/filip-kantedal-hd30xa/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-gold-400 transition-colors"
          >
            <span>Open Cal.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {submitted ? (
          <div className="my-8 py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-stix text-2xl text-white">Inquiry Received</h4>
            <p className="text-sm text-white/70 max-w-sm mx-auto font-light">
              Thank you, {name || "partner"}. We will interface with you at {email || "your email"} promptly with booking confirmation.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium hover:bg-gold-400"
            >
              Back to Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Linnea Berg"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold-400/80 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="linnea@agency.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold-400/80 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-1.5">
                Project Scope or Question
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us about your 3D, WebGPU, or AI vision..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold-400/80 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-white hover:bg-gold-400 text-black font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Confirm & Request Slot</span>
              <Send className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
