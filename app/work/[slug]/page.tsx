import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/data/projects";
import { ArrowLeft, ExternalLink, Sparkles, Layers, Calendar, User } from "lucide-react";

interface Props {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.uid,
  }));
}

export default function ProjectPage({ params }: Props) {
  const project = PROJECTS.find((p) => p.uid === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-foreground px-6 sm:px-12 py-20 max-w-6xl mx-auto">
      {/* Return Link */}
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Portfolio</span>
      </Link>

      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest font-mono text-gold-400">
            {project.subtitle} • {project.year || "2024"}
          </span>
          <h1 className="font-stix text-4xl sm:text-6xl md:text-7xl font-normal text-white">
            {project.title}
          </h1>
        </div>

        <p className="text-lg sm:text-xl text-white/75 font-light leading-relaxed max-w-3xl">
          {project.description}
        </p>

        {/* Video Player */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#0d0d12] border border-white/10 shadow-2xl">
          <video
            src={`https://stream.mux.com/${project.mux_playback_id}/low.mp4`}
            poster={`https://image.mux.com/${project.mux_playback_id}/thumbnail.webp?width=1280&height=720&fit_mode=smart`}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
          {project.collaborator && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-2">
                <User className="w-4 h-4 text-gold-400" />
                <span>Collaborator</span>
              </div>
              <div className="text-lg font-medium text-white">{project.collaborator}</div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-2">
              <Layers className="w-4 h-4 text-gold-400" />
              <span>Disciplines</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(project.tags || [project.subtitle]).map((tag) => (
                <span key={tag} className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase mb-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span>Release</span>
            </div>
            <div className="text-lg font-medium text-white">{project.year || "2024"}</div>
          </div>
        </div>

        {/* Action Link */}
        {project.site_link && (
          <div className="pt-8">
            <a
              href={project.site_link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white hover:bg-gold-400 text-black font-medium text-sm transition-all shadow-xl hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Launch Live Experience</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
