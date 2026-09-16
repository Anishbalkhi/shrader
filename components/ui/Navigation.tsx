"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { sound } from "@/lib/sound";

interface NavigationProps {
  onOpenCal: () => void;
  activeSection?: string;
}

export function Navigation({ onOpenCal, activeSection }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>(activeSection || "home");

  useEffect(() => {
    const handleWindowScroll = () => {
      setIsScrolledDown(window.scrollY > 480);
    };
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll();
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // Scroll spy observer for single-page and multi-section scrolling
  useEffect(() => {
    if (activeSection) {
      setCurrentSection(activeSection);
      return;
    }

    if (pathname === "/work") {
      setCurrentSection("work");
      return;
    }
    if (pathname === "/contact") {
      setCurrentSection("contact");
      return;
    }
    if (pathname === "/about-us") {
      setCurrentSection("about-us");
      return;
    }

    // Scroll spy for sections on home page
    const sections = ["home", "work", "about-us", "contact"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (const sectionId of [...sections].reverse()) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPos) {
          setCurrentSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, activeSection]);

  const navItems = [
    { label: "Home",          href: "/",        id: "home",       key: "home" },
    { label: "Selected Work", href: "/work",    id: "work",       key: "work" },
    { label: "About Us",      href: "/about-us", id: "about-us", key: "about-us" },
    { label: "Contact",       href: "/contact", id: "contact",    key: "contact" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    sound.playClick();
    setMobileMenuOpen(false);
    if (item.href) {
      router.push(item.href);
    } else if (item.id) {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/#${item.id}`);
      }
    }
  };

  const isLight = (pathname === "/about-us" || currentSection === "about-us") && isScrolledDown;

  return (
    // Pure transparent header with NO background fill and NO backdrop blur,
    // so scrolling content cleanly bleeds through and double-exposes underneath the nav
    <header
      className={`fixed top-0 left-0 w-full z-50 pointer-events-auto select-none bg-transparent transition-colors duration-200 ${
        isLight ? "border-b border-black/[0.12]" : "border-b border-white/[0.14]"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6 sm:px-12 lg:px-16 py-4 sm:py-5 max-w-[1920px] mx-auto">
        {/* Left: Rainbow Capsule + SHADER Wordmark */}
        <button
          onClick={() => { sound.playClick(); router.push("/"); }}
          onMouseEnter={() => sound.playHover()}
          className="group flex items-center focus:outline-none select-none transition-opacity hover:opacity-85"
          aria-label="Shader logo, return to top"
        >
          <img
            src={isLight ? "/textures/logo_dark.svg" : "/textures/logo.svg"}
            alt="SHADER"
            width={164}
            height={22}
            className={`h-5 sm:h-[22px] w-auto object-contain pointer-events-none ${
              isLight
                ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
                : "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            }`}
            style={
              isLight
                ? undefined
                : {
                    filter:
                      "drop-shadow(-0.8px 0 0 rgba(255,30,70,0.5)) drop-shadow(0.8px 0 0 rgba(30,220,255,0.5))",
                  }
            }
          />
        </button>

        {/* Center: Navigation Links with Dynamic Underline Indicator */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive =
              currentSection === item.key ||
              (item.key === "contact" && pathname === "/contact") ||
              (item.key === "work" && pathname === "/work") ||
              (item.key === "about-us" && pathname === "/about-us");
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => sound.playHover()}
                className="flex flex-col items-center group relative cursor-pointer focus:outline-none select-none"
              >
                <span
                  className={`font-stix text-[20px] lg:text-[22px] font-medium transition-opacity duration-150 ${
                    isLight
                      ? isActive
                        ? "text-[#1f1e1a] opacity-100"
                        : "text-[#1f1e1a] opacity-75 group-hover:opacity-100"
                      : isActive
                      ? "text-[#FDFDF5] opacity-100"
                      : "text-[#dcd8cc] opacity-80 group-hover:opacity-100"
                  }`}
                  style={
                    isLight
                      ? undefined
                      : {
                          textShadow:
                            "-0.6px 0 rgba(255, 30, 60, 0.55), 0.6px 0 rgba(30, 220, 255, 0.55)",
                        }
                  }
                >
                  {item.label}
                </span>
                {/* Active Underline with Chromatic Glow */}
                <span
                  className={`w-full h-[1.8px] block mt-0.5 rounded-[0.5px] transition-all duration-300 ${
                    isLight ? "bg-[#1f1e1a]" : "bg-[#FDFDF5]"
                  } ${
                    isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                  }`}
                  style={
                    isLight
                      ? undefined
                      : {
                          boxShadow:
                            "0 1px 0 rgba(255, 30, 60, 0.75), 0 -0.5px 0 rgba(30, 220, 255, 0.55)",
                        }
                  }
                />
              </button>
            );
          })}
        </nav>

        {/* Right: Rotary Phone Icon + Book a call (underlined) */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCal();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-3 group cursor-pointer focus:outline-none select-none transition-opacity hover:opacity-85"
            aria-label="Book a call on Cal.com"
          >
            <img
              src="/textures/icons/old_phone.svg"
              alt=""
              width={24}
              height={24}
              className={`w-5 h-5 lg:w-[22px] lg:h-[22px] object-contain pointer-events-none ${
                isLight ? "brightness-0 opacity-85" : "drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              }`}
              style={
                isLight
                  ? undefined
                  : {
                      filter:
                        "drop-shadow(-0.8px 0 0 rgba(255,30,70,0.6)) drop-shadow(0.8px 0 0 rgba(30,220,255,0.6))",
                    }
              }
            />
            <div className="flex flex-col items-center">
              <span
                className={`font-stix text-[20px] lg:text-[22px] font-medium ${
                  isLight ? "text-[#1f1e1a]" : "text-[#FDFDF5]"
                }`}
                style={
                  isLight
                    ? undefined
                    : {
                        textShadow:
                          "-0.6px 0 rgba(255, 30, 60, 0.55), 0.6px 0 rgba(30, 220, 255, 0.55)",
                      }
                }
              >
                Book a call
              </span>
              <span
                className={`w-full h-[1.8px] block mt-0.5 rounded-[0.5px] ${
                  isLight ? "bg-[#1f1e1a]" : "bg-[#FDFDF5]"
                }`}
                style={
                  isLight
                    ? undefined
                    : {
                        boxShadow:
                          "0 1px 0 rgba(255, 30, 60, 0.75), 0 -0.5px 0 rgba(30, 220, 255, 0.55)",
                      }
                }
              />
            </div>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 focus:outline-none ${
            isLight ? "text-[#1f1e1a]" : "text-white"
          }`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-8 py-6 flex flex-col gap-4 ${
            isLight
              ? "bg-[#efe9d3] border-black/10 text-[#1f1e1a]"
              : "bg-black/95 border-white/10 text-white"
          }`}
        >
          {navItems.map((item) => {
            const isActive =
              currentSection === item.key ||
              (item.key === "contact" && pathname === "/contact") ||
              (item.key === "work" && pathname === "/work") ||
              (item.key === "about-us" && pathname === "/about-us");
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`text-left font-stix text-lg flex flex-col items-start gap-1 ${
                  isLight ? "text-[#1f1e1a]" : "text-white"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className={`w-16 h-[1.5px] block ${
                      isLight ? "bg-[#1f1e1a]" : "bg-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              sound.playClick();
              setMobileMenuOpen(false);
              onOpenCal();
            }}
            className={`text-left font-stix text-lg flex items-center gap-2 pt-2 ${
              isLight ? "text-[#1f1e1a]" : "text-white"
            }`}
          >
            <img
              src="/textures/icons/old_phone.svg"
              alt=""
              width={18}
              height={18}
              className={`w-4 h-4 ${isLight ? "brightness-0 opacity-80" : ""}`}
            />
            <span>Book a call</span>
          </button>
        </div>
      )}
    </header>
  );
}
