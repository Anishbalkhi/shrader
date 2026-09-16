"use client";

import React, { useState } from "react";
import { Project } from "@/lib/data/projects";
import { X, ExternalLink, Sparkles, ChevronLeft, ChevronRight, Layers, Calendar, User } from "lucide-react";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!project) return null;

  const currentMediaId =
    project.project_media[activeMediaIndex]?.mux_playback_id || project.mux_playback_id;

  const prevMedia = () => {
    setActiveMediaIndex((prev) =>
      prev === 0 ? project.project_media.length - 1 : prev - 1
    );
  };

  const nextMedia = () => {
    setActiveMediaIndex((prev) =>
      prev === project.project_media.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-[#0d0d11] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-gold-400">
              {project.subtitle}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50 font-mono">{project.year || "2024"}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            aria-label="Close project modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Title & Subtitle */}
          <div>
            <h2 className="font-stix text-3xl sm:text-5xl font-normal text-white">
              {project.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>

          {/* Video / Media Viewport */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
            <video
              key={currentMediaId}
              src={`https://stream.mux.com/${currentMediaId}/low.mp4`}
              poster={`https://image.mux.com/${currentMediaId}/thumbnail.webp?width=1280&height=720&fit_mode=smart`}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />

            {/* Media Navigation Controls if multiple items */}
            {project.project_media.length > 1 && (
              <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={prevMedia}
                  className="pointer-events-auto p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMedia}
                  className="pointer-events-auto p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-transform hover:scale-105"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Media index counter */}
            {project.project_media.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-mono text-white/80 border border-white/15">
                {activeMediaIndex + 1} / {project.project_media.length}
              </div>
            )}
          </div>

          {/* Media thumbnails strip */}
          {project.project_media.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {project.project_media.map((med, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden border transition-all ${
                    activeMediaIndex === idx
                      ? "border-gold-400 ring-2 ring-gold-400/40 scale-105"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://image.mux.com/${med.mux_playback_id}/thumbnail.webp?width=300&height=180&fit_mode=smart`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {project.collaborator && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                <User className="w-4 h-4 text-gold-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/40 font-mono">
                    Collaborator
                  </div>
                  <div className="text-sm font-medium text-white">{project.collaborator}</div>
                </div>
              </div>
            )}

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <Layers className="w-4 h-4 text-gold-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/40 font-mono">
                  Disciplines
                </div>
                <div className="text-sm font-medium text-white flex flex-wrap gap-1 mt-0.5">
                  {(project.tags || [project.subtitle]).map((t) => (
                    <span key={t} className="text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gold-400" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/40 font-mono">
                  Release
                </div>
                <div className="text-sm font-medium text-white">{project.year || "2024"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            Close
          </button>

          {project.site_link && (
            <a
              href={project.site_link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-gold-400 text-black font-medium text-xs tracking-wider transition-all duration-300 shadow-lg hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Launch Live Project</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
