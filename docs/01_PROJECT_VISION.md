# KaamSetu — Project Vision

## Overview

**KaamSetu** (Hindi: "Job Bridge") is a hyperlocal labour marketplace that connects daily-wage and skilled blue-collar workers with local hirers across India. The platform is purpose-built for the informal labour market — the segment that employs the vast majority of India's working population but is historically underserved by mainstream job platforms.

The name itself defines the mission: _setu_ means bridge. KaamSetu bridges the gap between workers who need work today and hirers who need workers today.

---

## The Problem

India's informal labour market is enormous but fragmented. Workers — masons, electricians, cooks, drivers, agricultural labourers — find work primarily through word-of-mouth, middlemen, and physical "nakas" (street corners where workers gather). This system is:

- **Opaque**: Hirers have no way to verify a worker's skill level or reliability.
- **Geographically limited**: Both parties are constrained to their immediate social network.
- **Exploitative**: Middlemen extract margins from both sides.
- **Inaccessible to those without smartphones or Internet literacy**: Language barriers compound the problem.

---

## The Solution

KaamSetu provides a structured, digital meeting point that removes the middleman. The core value propositions are:

1. **Proximity-first discovery**: Workers and jobs are surfaced by distance, so everything on the platform is locally actionable.
2. **Dual-mode accounts**: A single account can toggle between "worker" and "hirer" modes, reflecting the reality that many informal workers also hire others for specific tasks.
3. **Trust through reviews**: After a job is filled, hirers can leave verified reviews that build a worker's reputation over time.
4. **Direct messaging**: Once a hiring interaction exists (job application or direct contact), both parties can communicate without sharing personal numbers.
5. **Multilingual interface**: The app ships with English, Hindi, Bengali, Punjabi, and Tamil to reach workers and hirers in their own language.
6. **Portfolio evidence**: Workers can upload photos of past work to demonstrate skill, replacing verbal references.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| **Worker** | Daily-wage or skilled labour seeking short-term, local employment. Uses the app to post availability, set wage expectations, and apply to open jobs. |
| **Hirer** | An individual or small business that needs labour for a specific task or period. Uses the app to post jobs, browse available workers, and manage applications. |
| **Admin** | Platform operator who monitors listings, manages users, and ensures compliance. |

---

## Design Principles

- **Mobile-first**: The target demographic is primarily smartphone users with limited desktop access.
- **Low-friction onboarding**: Google OAuth enables immediate access without password creation.
- **Locality over scale**: Relevance is defined by distance, not volume. A plumber 2 km away beats a highly-rated one 50 km away.
- **Trust is earned, not assumed**: Messaging is gated behind a real hiring interaction; reviews require verified job completion.
- **Accessibility**: Language switching, dark mode, and simple UI patterns reduce the learning curve for first-time users.

---

## Success Metrics (Intended)

- Number of successful job-worker matches (application accepted)
- Average distance between matched hirer and worker
- Time from job posting to first application
- Worker profile completeness rate
- Monthly active users per city

---

## Scope of Phase 2

This codebase represents **Phase 2** of the platform, which extends the initial proof-of-concept with:

- Worker availability scheduling (days of week + notes)
- Years-of-experience field on worker profiles
- Direct worker contact by hirers (without a job posting)
- Real-time notifications via Socket.IO
- Rate limiting and security hardening
- Multi-language support (i18n)
- Portfolio image uploads to Cloudinary
