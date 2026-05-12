import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import {
  BookOpen, Brain, Award, ChevronDown, ChevronRight, Play, CheckCircle2,
  Lock, Clock, Star, Zap, Database, BarChart3, Video, Scan, Shield,
  Wifi, Link, Activity, Heart, Pill, Stethoscope, Syringe, Trophy,
  GraduationCap, Microscope, FlaskConical, Target, Users, Globe, Cpu,
} from "lucide-react";
import { TECHSKILLS_COURSES, ONCOAI_COURSES, CLINICAL_COURSES, type Course, type Module } from "@/data/courseData";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Database, BarChart3, Brain, Video, Scan, Shield, Wifi, Link,
  Activity, Heart, Pill, Stethoscope, Syringe, Trophy, Award,
  GraduationCap, Microscope, FlaskConical, Target, Users, Globe, Cpu,
  Radiation: Zap, ChartBar: BarChart3, Ambulance: Zap,
};

const COLOR_MAP: Record<string, string> = {
  cyan: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  blue: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  purple: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  green: "text-green-400 border-green-500/40 bg-green-500/10",
  orange: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  red: "text-red-400 border-red-500/40 bg-red-500/10",
  teal: "text-teal-400 border-teal-500/40 bg-teal-500/10",
  indigo: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
  pink: "text-pink-400 border-pink-500/40 bg-pink-500/10",
  yellow: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  gold: "text-amber-400 border-amber-500/40 bg-amber-500/10",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-300 border-green-500/30",
  intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  advanced: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  expert: "bg-red-500/20 text-red-300 border-red-500/30",
};

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Play, reading: BookOpen, quiz: Target, simulation: Cpu,
  lab: FlaskConical, assessment: CheckCircle2,
};

// ─── Module Row ───────────────────────────────────────────────────────────────
function ModuleRow({ mod, index }: { mod: Module; index: number }) {
  const Icon = TYPE_ICON[mod.type] ?? BookOpen;
  const isLocked = index > 2;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      isLocked
        ? "border-slate-700/30 bg-slate-800/20 opacity-60"
        : "border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/40 cursor-pointer"
    }`}>
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700/60 flex items-center justify-center">
        {isLocked ? (
          <Lock className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <Icon className="h-3.5 w-3.5 text-cyan-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isLocked ? "text-slate-500" : "text-slate-200"}`}>
          {mod.index}. {mod.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{mod.type} · {mod.durationMinutes} min</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {mod.cpdPoints > 0 && (
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
            +{mod.cpdPoints} CPD
          </span>
        )}
        {!isLocked && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
            Start
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, progress }: { course: Course; progress: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showAllModules, setShowAllModules] = useState(false);
  const IconComp = ICON_MAP[course.icon] ?? BookOpen;
  const colorClass = COLOR_MAP[course.color] ?? COLOR_MAP.cyan;
  const displayedModules = showAllModules ? course.modules : course.modules.slice(0, 8);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden hover:border-slate-600/60 transition-all">
      {/* Header */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg border ${colorClass}`}>
              <IconComp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm leading-tight">{course.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`text-xs px-2 py-0.5 rounded border ${DIFFICULTY_BADGE[course.difficulty]}`}>
            {course.difficulty}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {course.totalModules} modules
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.estimatedHours}h
          </span>
          <span className="text-xs text-amber-300 flex items-center gap-1">
            <Award className="h-3 w-3" /> {course.cpdPoints} CPD pts
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-slate-700" />
        </div>
      </div>

      {/* Expanded module list */}
      {expanded && (
        <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Learning Modules ({course.totalModules} total)
          </h4>
          <div className="space-y-2">
            {displayedModules.map((mod) => (
              <ModuleRow key={mod.id} mod={mod} index={mod.index - 1} />
            ))}
          </div>
          {course.modules.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-xs text-slate-400 hover:text-slate-200"
              onClick={() => setShowAllModules(!showAllModules)}
            >
              {showAllModules ? "Show less" : `Show all ${course.totalModules} modules`}
            </Button>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs">
              <Play className="h-3 w-3 mr-1" /> Continue Course
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700">
              <Star className="h-3 w-3 mr-1" /> Bookmark
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CPD Summary Bar ──────────────────────────────────────────────────────────
function CpdSummaryBar({ courses }: { courses: Course[] }) {
  const totalCpd = courses.reduce((s, c) => s + c.cpdPoints, 0);
  const earnedCpd = Math.floor(totalCpd * 0.12); // demo: 12% earned
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
            <Award className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-300">CPD Points Tracker</p>
            <p className="text-xs text-slate-400">{earnedCpd} earned of {totalCpd} available in this section</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{earnedCpd}</p>
            <p className="text-xs text-slate-400">Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-300">{totalCpd}</p>
            <p className="text-xs text-slate-400">Available</p>
          </div>
          <div className="w-24">
            <Progress value={(earnedCpd / totalCpd) * 100} className="h-2 bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TechSkills Tab ───────────────────────────────────────────────────────────
function TechSkillsTab() {
  const mockProgress = [15, 32, 8, 45, 22, 60, 5, 18];
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 mb-1">TechSkills Campus</h2>
        <p className="text-slate-400 text-sm">8 comprehensive technology courses · 40 modules each · 160 total CPD points available</p>
      </div>
      <CpdSummaryBar courses={TECHSKILLS_COURSES} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TECHSKILLS_COURSES.map((course, i) => (
          <CourseCard key={course.id} course={course} progress={mockProgress[i] ?? 0} />
        ))}
      </div>
    </div>
  );
}

// ─── OncoAI Tab ───────────────────────────────────────────────────────────────
function OncoAITab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-pink-300 mb-1">OncoAI Coursework</h2>
        <p className="text-slate-400 text-sm">Radiology & oncology coursework powered by OncoAI platform · 20 modules · 15 CPD points</p>
      </div>

      {/* OncoAI Platform Banner */}
      <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <Zap className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <h3 className="font-bold text-pink-300 text-lg">OncoAI PWA v3 Integration</h3>
            <p className="text-slate-400 text-sm mt-1">
              This coursework is directly integrated with the OncoAI PWA v3 platform available in Triad Neuro.
              Complete modules to unlock advanced imaging analysis, pipeline processing, and treatment planning tools.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Imaging Sub-Module", "Pipeline Sub-Module", "Treatment Sub-Module"].map((tag) => (
                <span key={tag} className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CpdSummaryBar courses={ONCOAI_COURSES} />

      {/* Skills.md integration notice */}
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 mb-6">
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-cyan-300">Skills Repository Integration</p>
            <p className="text-xs text-slate-400 mt-1">
              Course content is sourced from the platform's skills.md repository and related health-AI files,
              incorporating real oncology protocols, radiology guidelines, and AI-assisted diagnostic workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ONCOAI_COURSES.map((course) => (
          <CourseCard key={course.id} course={course} progress={28} />
        ))}
      </div>

      {/* Module preview cards */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Featured Module Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "AI Tumor Detection", desc: "Deep learning algorithms for automated tumor identification in CT/MRI scans", icon: Scan, color: "pink" },
            { title: "Radiomics Pipeline", desc: "Quantitative feature extraction from medical images for predictive modeling", icon: FlaskConical, color: "purple" },
            { title: "Treatment Response", desc: "RECIST 1.1 criteria and AI-assisted response evaluation in oncology", icon: Target, color: "cyan" },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div key={item.title} className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
                <ItemIcon className="h-5 w-5 text-pink-400 mb-2" />
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Clinical Skills Tab ──────────────────────────────────────────────────────
function ClinicalSkillsTab() {
  const mockProgress = [5, 20, 12, 35, 8, 42, 15, 3];
  const cpdCourse = CLINICAL_COURSES.find((c) => c.slug === "cpd-generator-clinical");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-300 mb-1">Clinical Skills</h2>
        <p className="text-slate-400 text-sm">8 clinical certification courses · 40 modules each · Including CPD Generator (60 points)</p>
      </div>

      {/* CPD Generator Highlight */}
      {cpdCourse && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-amber-300 text-lg">CPD Generator — Clinical Medicine</h3>
                <span className="text-xs bg-amber-500/30 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                  60 CPD POINTS
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Earn 60 Continuing Professional Development points through structured reflective practice,
                clinical audit, quality improvement, ethics, leadership, and advanced life support recertification.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-400">60</p>
                  <p className="text-xs text-slate-400">CPD Points</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-300">40</p>
                  <p className="text-xs text-slate-400">Modules</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-300">80h</p>
                  <p className="text-xs text-slate-400">Est. Time</p>
                </div>
                <Button size="sm" className="ml-auto bg-amber-600 hover:bg-amber-500 text-white text-xs">
                  <Play className="h-3 w-3 mr-1" /> Start CPD Program
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CpdSummaryBar courses={CLINICAL_COURSES} />

      {/* Certification badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Insulin Certified", icon: Syringe, color: "yellow" },
          { label: "CNA Certified", icon: Heart, color: "pink" },
          { label: "EMT Certified", icon: Zap, color: "red" },
          { label: "Clinical Skills", icon: Stethoscope, color: "blue" },
        ].map((cert) => {
          const CertIcon = cert.icon;
          return (
            <div key={cert.label} className="p-3 rounded-lg border border-slate-700/40 bg-slate-800/30 text-center">
              <CertIcon className="h-5 w-5 mx-auto mb-1 text-slate-400" />
              <p className="text-xs text-slate-400">{cert.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">Not earned</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CLINICAL_COURSES.map((course, i) => (
          <CourseCard key={course.id} course={course} progress={mockProgress[i] ?? 0} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Skills Page ─────────────────────────────────────────────────────────
export default function Skills() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"techskills" | "oncoai" | "clinical">("techskills");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-cyan-300 mb-4">Skills & Learning Hub</h1>
          <p className="text-slate-300 mb-6">Please sign in to access courses, modules, and CPD tracking</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-cyan-600 hover:bg-cyan-500">
            Sign in with Manus
          </Button>
        </div>
      </div>
    );
  }

  const totalCourses = TECHSKILLS_COURSES.length + ONCOAI_COURSES.length + CLINICAL_COURSES.length;
  const totalModules = [...TECHSKILLS_COURSES, ...ONCOAI_COURSES, ...CLINICAL_COURSES].reduce((s, c) => s + c.totalModules, 0);
  const totalCpd = [...TECHSKILLS_COURSES, ...ONCOAI_COURSES, ...CLINICAL_COURSES].reduce((s, c) => s + c.cpdPoints, 0);

  return (
    <div className="min-h-screen p-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-glow-cyan">Skills & Learning Hub</h1>
              <p className="text-slate-400 text-sm">Jua Kali Clinical Intelligence — Continuous Professional Development</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "text-cyan-400" },
              { label: "Total Modules", value: totalModules, icon: Brain, color: "text-purple-400" },
              { label: "CPD Points Available", value: totalCpd, icon: Award, color: "text-amber-400" },
              { label: "Certifications", value: "8", icon: Trophy, color: "text-green-400" },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 flex items-center gap-3">
                  <StatIcon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-6 w-fit">
          {[
            { id: "techskills" as const, label: "TechSkills Campus", icon: Cpu, color: "text-cyan-400" },
            { id: "oncoai" as const, label: "OncoAI Coursework", icon: Zap, color: "text-pink-400" },
            { id: "clinical" as const, label: "Clinical Skills", icon: Stethoscope, color: "text-green-400" },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <TabIcon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "techskills" && <TechSkillsTab />}
          {activeTab === "oncoai" && <OncoAITab />}
          {activeTab === "clinical" && <ClinicalSkillsTab />}
        </div>
      </div>
    </div>
  );
}
