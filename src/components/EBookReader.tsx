import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  BookOpen, 
  Sparkles,
  ShoppingBag,
  Maximize2,
  FileText,
  Sidebar,
  Compass,
  Lock,
  RotateCcw,
  BookOpenCheck
} from "lucide-react";
import { Book } from "../types";

interface EBookReaderProps {
  book: Book;
  isUnlocked: boolean; // If purchased, unlimited. Otherwise, free preview (5 pages readable, 5 pages locked)
  onClose: () => void;
  onBuyBook?: () => void;
}

export const EBookReader: React.FC<EBookReaderProps> = ({
  book,
  isUnlocked,
  onClose,
  onBuyBook
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100); // percentage: 75, 90, 100, 110, 125, 150
  const [theme, setTheme] = useState<"light" | "parchment" | "sepia" | "night">("parchment");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDoublePage, setIsDoublePage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = 10;

  // Helper to generate a realistic academic book syllabus/sample chapters based on metadata
  const generatePageContent = (pageNum: number): { title: string; subtitle?: string; paragraphs: string[] } => {
    const titleUpper = book.title.toUpperCase();
    const author = book.author;
    const genre = book.genre;
    
    switch (pageNum) {
      case 1:
        return {
          title: book.title,
          subtitle: `A Comprehensive Exploration into modern ${genre}`,
          paragraphs: [
            `ACADEMIC EDITION FOR SCHOLASTIC RESERVES`,
            `Published by LibraManage Academic Press & Digital Distributions.`,
            `Author: ${author}`,
            `ISBN-13 Reference Identifier: ${book.isbn || "978-0-13-468599-1"}`,
            `This digital asset has been authorized for secure online examination under library catalog privileges. Unauthorized copying, reverse-engineering, or metadata scraping is strictly prohibited under federal digital copyright statutes.`,
            `LibraManage Campus Repository • 2026 Edition`
          ]
        };
      case 2:
        return {
          title: "Legal Notices & Cataloging Data",
          subtitle: "Digital Rights Management Framework",
          paragraphs: [
            `Copyright © 2026 by ${author}. All rights reserved.`,
            `No part of this digital publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.`,
            `Library of Congress Cataloging-in-Publication Data:`,
            `Title: ${book.title} / by ${author}.`,
            `Identifiers: LCCN 2025987123 | ISBN ${book.isbn || "978-3-16-148410-0"} (e-book)`,
            `Subjects: LCSH: ${genre} -- Computer-aided study. | ${genre} -- Academic Reference Manuals.`,
            `Typeset in Premium Georgia Editorial and JetBrains Mono.`
          ]
        };
      case 3:
        return {
          title: "Table of Contents",
          subtitle: "Syllabus Breakdown & Course Alignment",
          paragraphs: [
            `Chapter 1: Introductory Foundations & Historical Roots ........................ Page 4`,
            `Chapter 2: Structural Architecture & Methodologies ............................. Page 5`,
            `Chapter 3: Deep Technical Formulations & Core Mechanics ................. Page 6`,
            `Chapter 4: Real-world Implementation Case Studies .............................. Page 7`,
            `Chapter 5: Advanced Optimization & Scaling Paradigms ....................... Page 8`,
            `Chapter 6: Modern Research Horizons & Strategic Growth .................. Page 9`,
            `Index of Academic Citations & Peer Review Records ............................. Page 10`,
            `* Note: In free preview mode, reading access is restricted to the first 5 chapters to comply with publisher lending mandates.`
          ]
        };
      case 4:
        return {
          title: "Chapter 1: Introductory Foundations",
          subtitle: `Exploring ${genre} with ${author}`,
          paragraphs: [
            `To properly conceptualize the paradigm of ${book.title}, one must first analyze the fundamental assumptions that underpin modern ${genre}. For decades, students and researchers have wrestled with optimal resource deployment models, struggling to bridge the divide between theoretical limits and pragmatic constraints.`,
            `Historically, traditional frameworks operated on isolated nodes with highly static metadata properties. However, as the domain evolved rapidly, these legacy schemas failed to scale with modern user demands. This chapter aims to reconstruct those parameters and establish a robust, modern formula.`,
            `In subsequent sections, we will delve into concrete implementations, analyzing how ${book.author}'s theories apply to actual digital systems. We will observe the correlation between node density, lookup latency, and final computational throughput.`
          ]
        };
      case 5:
        return {
          title: "Chapter 2: Structural Architecture",
          subtitle: `Methodology Overview`,
          paragraphs: [
            `Having established the historical context in the previous chapter, we now turn our focus to the concrete architectural blueprints of modern digital systems. This analysis requires a rigorous understanding of systemic flowcharts, error boundaries, and state preservation layers.`,
            `We define a healthy node schema as one which handles concurrent lookups without memory leak thresholds. If lookups exceed 1500 concurrent loops per second, standard load distribution queues must step down to prevent system-wide degradation. This is where the core algorithms of ${book.title} offer unparalleled structural stability.`,
            `Below we detail the interface definition for state tracking:`,
            `interface SystemStateNode {\n  nodeId: string;\n  status: "ACTIVE" | "IDLE" | "MAINTENANCE";\n  loadFactor: number;\n  redundancySet: string[];\n}`,
            `By standardizing this interface, developers can deploy multi-tenant systems across disparate clouds while maintaining unified health reporting metrics.`
          ]
        };
      case 6:
        return {
          title: "Chapter 3: Deep Technical Formulations",
          subtitle: `Core Mathematical Mechanics`,
          paragraphs: [
            `At the heart of the architectural patterns described previously lies a set of elegant mathematical models. In this chapter, we outline the exact statistical algorithms and formulas used to compute optimal performance thresholds.`,
            `Let S represent the overall system capacity, and let C represent the concurrency modifier. We can model the total latency coefficient (L) using the following equation:`,
            `L = (C * log(S)) / (1 - (C / S)^2)`,
            `When analyzed closely, this function reveals that latency remains linear until capacity reaches approximately 85% of total physical saturation, at which point exponential bottlenecks emerge. The core focus of ${book.title} is to inject pre-emptive scheduling protocols, effectively smoothing out that curve.`
          ]
        };
      case 7:
        return {
          title: "Chapter 4: Real-world Implementation",
          subtitle: `In-depth Case Studies`,
          paragraphs: [
            `While mathematics provides an excellent logical foundation, empirical proof is required to justify capital allocation in commercial operations. In this chapter, we explore three unique case studies where the principles of ${book.title} were deployed at scale.`,
            `Case Study A: A high-volume academic repository deployed the scheduling algorithm to index 4.2 million research papers. The result was a 42% reduction in search indexing overhead and an immediate drop in API cold-starts.`,
            `Case Study B: A global logistics provider used these concepts to manage their container routing. By treating containers as independent nodes with dynamic priority weighting, they bypassed standard bottleneck hubs, saving an estimated $1.2M in monthly freight delays.`
          ]
        };
      case 8:
        return {
          title: "Chapter 5: Advanced Optimization",
          subtitle: `Scaling Paradigms & Distributed State`,
          paragraphs: [
            `When scaling systems beyond singular clusters, engineers encounter the challenge of distributed state. How do we ensure eventual consistency across geographic boundaries without introducing locking states?`,
            `The answer lies in CRDTs (Conflict-free Replicated Data Types) paired with specialized semantic timestamping. Rather than establishing a centralized leader database, nodes coordinate peer-to-peer, sharing delta updates periodically.`,
            `This optimization eliminates single-point-of-failure liabilities and allows the network to remain fully operational even during severe continental network partitions.`
          ]
        };
      case 9:
        return {
          title: "Chapter 6: Modern Research Horizons",
          subtitle: `Strategic Growth & Emerging Trends`,
          paragraphs: [
            `As we look to the next decade, the convergence of high-density edge computing and semantic AI models promises to rewrite the rules of ${genre}. This final chapter outlines the research frontiers that will define the next generation of academic inquiry.`,
            `Key areas of focus include quantum-resistant encryption handshakes, ultra-low-power IoT nodes, and natural language database querying interfaces. The foundations laid in this volume serve as a starting point for these exciting future explorations.`,
            `We invite students and scholars alike to build upon these theories, contributing to the open-source frameworks that power global educational accessibility.`
          ]
        };
      case 10:
        return {
          title: "Index of Academic Citations",
          subtitle: `Peer Review Records & References`,
          paragraphs: [
            `[1] Kleppmann, M. (2017). "Designing Data-Intensive Applications". O'Reilly Media.`,
            `[2] Lamport, L. (1978). "Time, Clocks, and the Ordering of Events in a Distributed System". Communications of the ACM.`,
            `[3] Feynman, R. P. (1985). "Surely You're Joking, Mr. Feynman!". W. W. Norton & Company.`,
            `[4] Campus Ledger of Digital Acquisitions (2026). "Authorized Academic Cataloging Indexes for ${book.title} (${book.isbn})".`,
            `[5] Academic Board of Computer Science, University of LibraManage. "Course Syllabus Guidelines for Semester 1 (2026)".`
          ]
        };
      default:
        return { title: "End of Preview", paragraphs: ["No additional content available."] };
    }
  };

  // Determine theme colors
  const getThemeClasses = () => {
    switch (theme) {
      case "light":
        return {
          bg: "bg-slate-50",
          paper: "bg-white text-slate-800 border-slate-250 shadow-md",
          sidebar: "bg-white border-slate-200 text-slate-700",
          toolbar: "bg-white border-slate-200 text-slate-850",
          accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
          sidebarHover: "hover:bg-slate-50 text-slate-800",
          sidebarActive: "bg-indigo-50 border-r-2 border-indigo-600 text-indigo-700 font-semibold"
        };
      case "night":
        return {
          bg: "bg-stone-950",
          paper: "bg-stone-900 text-stone-200 border-stone-850 shadow-2xl",
          sidebar: "bg-stone-900 border-stone-850 text-stone-400",
          toolbar: "bg-stone-900 border-stone-850 text-stone-200",
          accent: "text-indigo-400 bg-indigo-950/40 border-indigo-900/50",
          sidebarHover: "hover:bg-stone-800/50 text-stone-200",
          sidebarActive: "bg-stone-800 border-r-2 border-indigo-500 text-white font-semibold"
        };
      case "sepia":
        return {
          bg: "bg-[#eedfc4]",
          paper: "bg-[#f4eccf] text-[#5b4636] border-[#dfd4b7] shadow-md",
          sidebar: "bg-[#ebdcb9] border-[#d8caa6] text-[#6c5644]",
          toolbar: "bg-[#ebdcb9] border-[#d8caa6] text-[#5b4636]",
          accent: "text-[#825e3f] bg-[#eedfc4]/50 border-[#d8caa6]",
          sidebarHover: "hover:bg-[#eedfc4] text-[#5b4636]",
          sidebarActive: "bg-[#faf1dc] border-r-2 border-[#825e3f] text-[#5b4636] font-semibold"
        };
      case "parchment":
      default:
        return {
          bg: "bg-[#f2efe9]",
          paper: "bg-[#faf6f0] text-stone-850 border-stone-250 shadow-md",
          sidebar: "bg-[#f5eedf] border-stone-200 text-stone-700",
          toolbar: "bg-[#f5eedf] border-stone-200 text-stone-850",
          accent: "text-amber-800 bg-amber-50 border-amber-200",
          sidebarHover: "hover:bg-[#fcf8ef] text-stone-900",
          sidebarActive: "bg-[#faf6f0] border-r-2 border-amber-600 text-amber-900 font-semibold"
        };
    }
  };

  const colors = getThemeClasses();

  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    // If not unlocked and going beyond page 5, show purchase nudge or block
    if (!isUnlocked && currentPage === 5) {
      // Prompt buy or just go to locked screen
      setCurrentPage(6);
    } else if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const pageInfoLeft = generatePageContent(currentPage);
  const pageInfoRight = isDoublePage && currentPage + 1 <= totalPages ? generatePageContent(currentPage + 1) : null;

  // Outline/TOC structure
  const outline = [
    { page: 1, title: "Book Cover" },
    { page: 2, title: "Copyright & Licensing" },
    { page: 3, title: "Table of Contents" },
    { page: 4, title: "Chapter 1: Foundations" },
    { page: 5, title: "Chapter 2: Architecture" },
    { page: 6, title: "Chapter 3: Deep Technical Formulation", locked: !isUnlocked },
    { page: 7, title: "Chapter 4: Real-world Cases", locked: !isUnlocked },
    { page: 8, title: "Chapter 5: Advanced Optimization", locked: !isUnlocked },
    { page: 9, title: "Chapter 6: Modern Horizons", locked: !isUnlocked },
    { page: 10, title: "Index & Academic Citations", locked: !isUnlocked },
  ];

  const handleSelectPage = (page: number) => {
    if (!isUnlocked && page > 5) {
      setCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 z-55 flex flex-col ${isFullscreen ? "p-0" : "p-4 md:p-6"} ${colors.bg} transition-colors duration-250 select-none`} id="libramanage-academic-pdf-viewer">
      
      {/* 1. PDF MAIN TOP TOOLBAR */}
      <div className={`p-3 rounded-2xl md:rounded-3xl border ${colors.toolbar} flex flex-wrap items-center justify-between gap-4 mb-4 shadow-sm z-10 select-none transition-colors`}>
        
        {/* Left Section: Book metadata & Sidebar toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Toggle Outline Sidebar"
          >
            <Sidebar className="w-4 h-4" />
          </button>
          <div className="h-5 w-[1px] bg-slate-350 dark:bg-stone-750"></div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-indigo-500" />
            <div>
              <h4 className="font-extrabold text-[11px] md:text-xs tracking-tight line-clamp-1">{book.title}</h4>
              <p className="text-[9px] text-slate-400 dark:text-stone-450 block font-medium">By {book.author}</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Navigation & Page controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 dark:border-stone-800 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 border border-slate-200/50 dark:border-stone-850 rounded-lg font-mono text-[10px] font-bold">
            <span className="text-indigo-600 dark:text-indigo-400">{currentPage}</span>
            <span className="text-slate-400">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 dark:border-stone-800 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section: View preferences, Themes & Close */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Layout type */}
          <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-slate-250/20">
            <button
              onClick={() => setIsDoublePage(false)}
              className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${!isDoublePage ? "bg-white dark:bg-stone-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 dark:text-stone-450 hover:text-slate-800"}`}
            >
              1 Page
            </button>
            <button
              onClick={() => {
                setIsDoublePage(true);
                if (currentPage % 2 === 0 && currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${isDoublePage ? "bg-white dark:bg-stone-800 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 dark:text-stone-450 hover:text-slate-800"}`}
            >
              2 Pages
            </button>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold w-10 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-stone-750"></div>

          {/* Themes Selector */}
          <div className="flex items-center gap-1">
            {(["light", "parchment", "sepia", "night"] as const).map(t => {
              let btnColor = "bg-white border-slate-200 text-slate-800";
              if (t === "parchment") btnColor = "bg-[#faf6f0] border-stone-300 text-stone-850";
              if (t === "sepia") btnColor = "bg-[#f4eccf] border-[#dfd4b7] text-[#5b4636]";
              if (t === "night") btnColor = "bg-stone-900 border-stone-800 text-stone-250";
              
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-5 h-5 rounded-full border ${btnColor} flex items-center justify-center text-[8px] font-bold cursor-pointer hover:scale-110 transition-transform ${theme === t ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
                  title={`${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
                >
                  {t.charAt(0).toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-stone-750"></div>

          {/* Fullscreen & Close */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-slate-500"
            title="Simulate Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-rose-650 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Close Academic Reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PDF VIEWER CONTENT STAGE */}
      <div className="flex-1 flex gap-4 overflow-hidden relative" id="libramanage-pdf-canvas-container">
        
        {/* A. Outline / Chapters Sidebar (TOC) */}
        {isSidebarOpen && (
          <div className={`w-64 shrink-0 rounded-2xl border ${colors.sidebar} flex flex-col shadow-xs overflow-hidden select-none transition-all duration-200`}>
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Literature Outline</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/5 font-bold">10 PGS</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {outline.map((item) => {
                const isActive = currentPage === item.page || (isDoublePage && currentPage + 1 === item.page);
                return (
                  <button
                    key={item.page}
                    onClick={() => handleSelectPage(item.page)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                      isActive 
                        ? colors.sidebarActive 
                        : `text-slate-600 dark:text-stone-400 ${colors.sidebarHover}`
                    }`}
                  >
                    <span className="font-mono text-[9px] font-bold text-indigo-500 bg-indigo-500/5 px-1.5 py-0.5 rounded min-w-[20px] text-center">
                      P.{item.page}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold leading-tight line-clamp-1">{item.title}</p>
                      {item.locked && (
                        <span className="text-[8px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 mt-0.5">
                          <Lock className="w-2 h-2" /> Sample Limit
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Catalog Prompt Info in sidebar */}
            <div className="p-4 bg-black/5 border-t border-black/5 text-[10px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-500">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>Reader Watermark</span>
              </div>
              <p className="leading-relaxed">Clipped by student index ledger. Campus licensing active.</p>
            </div>
          </div>
        )}

        {/* B. PDF Canvas Page Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-start relative select-text">
          
          {/* Main Book Page Sheet */}
          <div 
            className="flex flex-col md:flex-row gap-6 justify-center items-stretch transition-all duration-300"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            {/* Left Page (Active Page) */}
            <div className="relative">
              {/* If page is restricted and user is not unlocked, show blur mask */}
              {!isUnlocked && currentPage > 5 ? (
                <div className={`w-[320px] xs:w-[420px] md:w-[480px] min-h-[580px] rounded-xl border p-8 md:p-12 flex flex-col justify-center items-center text-center ${colors.paper} relative overflow-hidden shadow-xl`}>
                  <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-md pointer-events-none z-0" />
                  
                  <div className="relative z-10 max-w-sm space-y-4 flex flex-col items-center justify-center">
                    <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200 shadow-xs animate-bounce">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Premium Content Restricted</h4>
                      <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed font-sans">
                        You are reading a restricted 5-page sample of <strong className="font-semibold text-slate-800 dark:text-white">&ldquo;{book.title}&rdquo;</strong>.
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed text-left font-sans">
                      Academic publisher regulations permit checking out books physically or purchasing full permanent digital licenses to unlock comprehensive literature catalogs.
                    </div>

                    {onBuyBook && (
                      <button
                        onClick={onBuyBook}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Acquire Permanent License ($14.99)
                      </button>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(5)}
                      className="text-[11px] font-bold text-slate-400 hover:text-indigo-650 cursor-pointer flex items-center gap-1 font-sans"
                    >
                      <RotateCcw className="w-3 h-3" /> Back to Page 5 Free Sample
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`w-[320px] xs:w-[420px] md:w-[480px] min-h-[580px] rounded-xl border p-8 md:p-12 flex flex-col justify-between ${colors.paper} relative shadow-xl`}>
                  {/* Page header watermark */}
                  <div className="border-b border-black/5 dark:border-white/5 pb-2 mb-4 flex justify-between items-center text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase select-none">
                    <span>LibraManage Reader</span>
                    <span>{book.genre}</span>
                  </div>

                  {/* Core layout */}
                  <div className="flex-1 flex flex-col justify-start space-y-4">
                    {/* Page specific title */}
                    <div>
                      <h3 className="font-serif font-extrabold text-base md:text-lg leading-tight tracking-tight">
                        {pageInfoLeft.title}
                      </h3>
                      {pageInfoLeft.subtitle && (
                        <p className="text-[10px] md:text-xs font-sans font-medium italic text-indigo-600 dark:text-indigo-400 mt-1">
                          {pageInfoLeft.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Paragraph blocks */}
                    <div className="space-y-4 font-serif text-xs md:text-[13px] leading-relaxed select-text pt-2">
                      {pageInfoLeft.paragraphs.map((para, i) => (
                        <p key={i} className="text-justify font-serif indent-4">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Page footer marker */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-6 flex justify-between items-center text-[9px] font-mono text-slate-400 select-none">
                    <span>Authorized License: Campus Account</span>
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Page (Double Page View on desktop) */}
            {isDoublePage && currentPage + 1 <= totalPages && (
              <div className="relative hidden md:block">
                {!isUnlocked && currentPage + 1 > 5 ? (
                  <div className={`w-[480px] min-h-[580px] rounded-xl border p-12 flex flex-col justify-center items-center text-center ${colors.paper} relative overflow-hidden shadow-xl`}>
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-md pointer-events-none z-0" />
                    
                    <div className="relative z-10 max-w-sm space-y-4 flex flex-col items-center justify-center">
                      <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200 shadow-xs">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Page Locked</h4>
                        <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed font-sans">
                          A license checkout or premium purchase is required to access pages 6 through 10.
                        </p>
                      </div>

                      {onBuyBook && (
                        <button
                          onClick={onBuyBook}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Buy Book Copy ($14.99)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  pageInfoRight && (
                    <div className={`w-[480px] min-h-[580px] rounded-xl border p-12 flex flex-col justify-between ${colors.paper} relative shadow-xl`}>
                      {/* Page header watermark */}
                      <div className="border-b border-black/5 dark:border-white/5 pb-2 mb-4 flex justify-between items-center text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase select-none">
                        <span>LibraManage Reader</span>
                        <span>{book.genre}</span>
                      </div>

                      {/* Core layout */}
                      <div className="flex-1 flex flex-col justify-start space-y-4">
                        {/* Page specific title */}
                        <div>
                          <h3 className="font-serif font-extrabold text-base md:text-lg leading-tight tracking-tight">
                            {pageInfoRight.title}
                          </h3>
                          {pageInfoRight.subtitle && (
                            <p className="text-[10px] md:text-xs font-sans font-medium italic text-indigo-600 dark:text-indigo-400 mt-1">
                              {pageInfoRight.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Paragraph blocks */}
                        <div className="space-y-4 font-serif text-xs md:text-[13px] leading-relaxed select-text pt-2">
                          {pageInfoRight.paragraphs.map((para, i) => (
                            <p key={i} className="text-justify font-serif indent-4">
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Page footer marker */}
                      <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-6 flex justify-between items-center text-[9px] font-mono text-slate-400 select-none">
                        <span>Authorized License: Campus Account</span>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick info help at bottom */}
          <div className="mt-8 text-[11px] text-slate-400 text-center font-medium max-w-md select-none font-sans bg-black/5 py-2 px-4 rounded-full border border-slate-200/40">
            Use the mouse scroll or top navigation arrows to advance catalog pages.
          </div>
        </div>

      </div>

    </div>
  );
};
