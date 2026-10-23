import React from 'react';

import { Link } from 'react-router-dom';

import {

  Sparkles,

  FolderGit2,

  CheckSquare,

  Bug,

  FileText,

  Bot,

  Shield,

  ArrowRight,

  UserCheck,

  Zap,

  Layers,

  Activity,

  CheckCircle2,

} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const Landing = () => {

  const { isAuthenticated } = useAuth();

  return (

    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden overflow-y-auto scroll-smooth">

      {/* Background Glow Lights */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-600/25 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar: Matching Modern EcoTrack / SaaS Header Structure */}

      <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 backdrop-blur-md">

        {/* Left: Brand Identity */}

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-600/30">

            <Sparkles className="w-5 h-5 text-white" />

          </div>

          <div>

            <span className="font-extrabold text-xl tracking-tight text-white">

              DevPilot <span className="bg-gradient-to-r from-brand-400 to-cyan-300 bg-clip-text text-transparent">AI</span>

            </span>

          </div>

        </div>

        {/* Center: Quick Anchor Navigation */}

        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-8 text-[10px] sm:text-xs font-semibold text-slate-300">

          <a href="#about" className="hover:text-white transition-colors">

            About DevPilot

          </a>

          <a href="#how-it-works" className="hover:text-white transition-colors">

            How It Works

          </a>

          <a href="#features" className="hover:text-white transition-colors">

            Features & Roles

          </a>

          <a href="#ai-copilot" className="hover:text-white transition-colors">

            AI Assistant

          </a>

        </nav>

        {/* Right: Login & Register Buttons */}

        <div className="flex items-center gap-3">

          {isAuthenticated ? (

            <Link

              to="/dashboard"

              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-brand-600/25 flex items-center gap-2"

            >

              <span>Open Dashboard</span>

              <ArrowRight className="w-4 h-4" />

            </Link>

          ) : (

            <>

              <Link

                to="/login"

                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all shadow-sm"

              >

                Login

              </Link>

              <Link

                to="/register"

                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-brand-600/30 flex items-center gap-1.5"

              >

                <span>Register</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>

            </>

          )}

        </div>

      </header>

      {/* Hero Section */}

      <main id="about" className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-6 py-12 sm:py-20 flex flex-col items-center">

        {/* Badge */}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6 shadow-inner">

          <Sparkles className="w-3.5 h-3.5 text-brand-400" />

          <span>Next-Generation Jira-Inspired Developer Workspace</span>

        </div>

        {/* Hero Title */}

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl text-center leading-tight">

          Smart Project Management for a{' '}

          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">

            High-Velocity Team

          </span>

        </h1>

        {/* Hero Description */}

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-5 text-center leading-relaxed">

          DevPilot AI streamlines sprint execution. Project Managers organize backlogs and assign work to developers, while developers manage task workflows, triage critical bugs, write docs, and query live system data with our AI Copilot.

        </p>

        {/* Hero Action Buttons */}

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">

          <Link

            to="/login"

            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"

          >

            <span>Get Started • Login</span>

            <ArrowRight className="w-4 h-4" />

          </Link>

          <Link

            to="/register"

            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"

          >

            <span>Create Free Account</span>

          </Link>

        </div>

        {/* "How DevPilot Works" - 4 Step Process Cards (Inspired by Reference Flow) */}

        <section id="how-it-works" className="mt-24 w-full text-center scroll-mt-6">

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">

            How DevPilot AI Works

          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-2">

            Simple, transparent, and developer-first agile sprint execution

          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">

            {/* Step 1 */}

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">

              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">

                <FolderGit2 className="w-5 h-5" />

              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">Step 01</span>

              <h3 className="text-base font-bold text-white">Create Project</h3>

              <p className="text-xs text-slate-400 leading-relaxed">

                Admins and Project Managers create projects, establish date milestones, and assemble team members.

              </p>

            </div>

            {/* Step 2 */}

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">

              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">

                <UserCheck className="w-5 h-5" />

              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Step 02</span>

              <h3 className="text-base font-bold text-white">Assign Tasks</h3>

              <p className="text-xs text-slate-400 leading-relaxed">

                Break work into sprint tasks. Assign backlog items directly to Developers with priority tags and due dates.

              </p>

            </div>

            {/* Step 3 */}

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">

              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">

                <CheckSquare className="w-5 h-5" />

              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Step 03</span>

              <h3 className="text-base font-bold text-white">Track & Triage</h3>

              <p className="text-xs text-slate-400 leading-relaxed">

                Developers move tasks through TODO, In Progress, In Review to Done, and log critical bug defect reports.

              </p>

            </div>

            {/* Step 4 */}

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-3">

              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">

                <Bot className="w-5 h-5" />

              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">Step 04</span>

              <h3 className="text-base font-bold text-white">AI Copilot</h3>

              <p className="text-xs text-slate-400 leading-relaxed">

                Query system metrics, database counts, sprint velocity, and code debugging tips through Spring AI & Ollama.

              </p>

            </div>

          </div>

        </section>

        {/* Feature Grid: What DevPilot AI does */}

        <section id="features" className="mt-24 w-full scroll-mt-6">

          <div className="text-center mb-10">

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">

              Platform Features Built for Engineering Teams

            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-2">

              Everything you need for enterprise project delivery in one unified application

            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-brand-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">

                <FolderGit2 className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">Project & Sprint Backlog</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Plan and monitor projects across Planning, In-Progress, and Completed phases with date-constrained milestone tracking.

              </p>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">

                <CheckSquare className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">Task Workloads & Roles</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Jira-style task assignment. Project Managers assign backlog tasks directly to Developers, tracking progress across TODO to Done.

              </p>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-rose-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">

                <Bug className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">Bug Defect Management</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Capture detailed reproduction steps, expected vs actual behavior, and severity priorities to eliminate technical blockers quickly.

              </p>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">

                <FileText className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">Team Knowledge Docs</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Confluence-style repository documentation: store APIs, architecture guides, READMEs, and technical handbooks in one secure space.

              </p>

            </div>

            <div id="ai-copilot" className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">

                <Bot className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">Integrated AI Copilot</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Ask real-time database queries, feature guidance, and code debugging solutions directly powered by Spring AI and Ollama.

              </p>

            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all shadow-xl space-y-3">

              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">

                <Shield className="w-5 h-5" />

              </div>

              <h3 className="text-lg font-bold text-white">JWT Enterprise Security</h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">

                Granular role-based access control protecting Admin, Project Manager, and Developer workflows with BCrypt password hashing.

              </p>

            </div>

          </div>

        </section>

        {/* Bottom Banner (Inspired by Ready to Make an Impact) */}

        <section className="mt-20 w-full rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-900/50 to-brand-900/60 border border-brand-500/30 p-8 sm:p-12 text-center shadow-2xl">

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">

            Ready to Accelerate Your Development Sprints?

          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">

            Join DevPilot AI today and empower your team with intelligent project management and instant AI answers.

          </p>

          <div className="mt-6 flex justify-center">

            <Link

              to="/register"

              className="px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"

            >

              Get Started Now

            </Link>

          </div>

        </section>

      </main>

      {/* Footer */}

      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">

        DevPilot AI • AI-Powered Developer Project Management Platform • Built with Spring Boot & React

      </footer>

    </div>

  );

};

export default Landing;
