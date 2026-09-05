import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Pencil,
  Phone,
  MessageCircle,
  Download,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Code2,
  Folder,
  X,
  CheckCircle2,
  Menu,
} from 'lucide-react';

interface NoteItem {
  id: string;
  semester: string;
  title: string;
  description: string;
  category: 'core' | 'lab' | 'math';
  icon: string;
  downloadUrl: string;
  previewUrl: string;
}

const NOTES_DATA: NoteItem[] = [
  // SEM 3
  {
    id: 'sem3-math',
    semester: 'Sem 3',
    title: 'Mathematics III',
    description: 'Complete comprehensive notes covering all modules for semester exams.',
    category: 'math',
    icon: '📐',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=16P3776rHIr92EaMdL4PKVS-Bey_i50l1',
    previewUrl: 'https://drive.google.com/file/d/16P3776rHIr92EaMdL4PKVS-Bey_i50l1/view',
  },
  {
    id: 'sem3-de',
    semester: 'Sem 3',
    title: 'Digital Electronics',
    description: 'Logic gates, Boolean algebra, flip-flops, counters & sequential circuits.',
    category: 'core',
    icon: '⚡',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1mtri0x8ca04TKpehV65Rlnsh7ExscTWh',
    previewUrl: 'https://drive.google.com/file/d/1mtri0x8ca04TKpehV65Rlnsh7ExscTWh/view',
  },
  {
    id: 'sem3-dsa',
    semester: 'Sem 3',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, linked lists, trees, graphs, sorting, searching & algorithmic complexity.',
    category: 'core',
    icon: '🌳',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva',
    previewUrl: 'https://drive.google.com/file/d/15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva/view',
  },
  {
    id: 'sem3-co',
    semester: 'Sem 3',
    title: 'Computer Organization & Architecture',
    description: 'Instruction sets, memory hierarchy, cache, ALU, pipelining and I/O organization.',
    category: 'core',
    icon: '💻',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },

  // SEM 4
  {
    id: 'sem4-oops',
    semester: 'Sem 4',
    title: 'Object Oriented Programming (C++ / Java)',
    description: 'Classes, inheritance, polymorphism, templates, exception handling & design patterns.',
    category: 'core',
    icon: '☕',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  {
    id: 'sem4-gt',
    semester: 'Sem 4',
    title: 'Graph Theory & Combinatorics',
    description: 'Trees, Eulerian & Hamiltonian graphs, planar graphs, coloring and matching.',
    category: 'math',
    icon: '🕸️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq',
    previewUrl: 'https://drive.google.com/file/d/1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq/view',
  },
  {
    id: 'sem4-math4',
    semester: 'Sem 4',
    title: 'Discrete Mathematics & Numerical Methods',
    description: 'Probability distributions, numerical methods, recurrence relations & set theory.',
    category: 'math',
    icon: '📊',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B',
    previewUrl: 'https://drive.google.com/file/d/1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B/view',
  },
  {
    id: 'sem4-micro',
    semester: 'Sem 4',
    title: 'Microprocessors & Microcontrollers (8085/8086)',
    description: 'Architecture, assembly language programming, pin diagrams & peripheral interfacing.',
    category: 'core',
    icon: '🔌',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG',
    previewUrl: 'https://drive.google.com/file/d/1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG/view',
  },

  // SEM 5
  {
    id: 'sem5-os',
    semester: 'Sem 5',
    title: 'Operating Systems',
    description: 'Process management, CPU scheduling, synchronization, deadlocks & virtual memory.',
    category: 'core',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem5-dbms',
    semester: 'Sem 5',
    title: 'Database Management Systems (DBMS)',
    description: 'ER modeling, SQL queries, relational algebra, normalization & transaction processing.',
    category: 'core',
    icon: '🗄️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },
  {
    id: 'sem5-automata',
    semester: 'Sem 5',
    title: 'Automata Theory & Formal Languages (TOC)',
    description: 'Finite automata, regular expressions, context-free grammars & Turing machines.',
    category: 'core',
    icon: '🤖',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW',
    previewUrl: 'https://drive.google.com/file/d/14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW/view',
  },
  {
    id: 'sem5-ip',
    semester: 'Sem 5',
    title: 'Digital Image Processing',
    description: 'Image enhancement, filtering in spatial & frequency domain, segmentation & compression.',
    category: 'core',
    icon: '🖼️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV',
    previewUrl: 'https://drive.google.com/file/d/1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV/view',
  },
];

const LAB_WORKS = [
  {
    title: 'Computer Architecture & Assembly Lab',
    desc: '8085/8086 microprocessor assembly code experiments and simulator files.',
    lang: 'Assembly',
  },
  {
    title: 'Object Oriented Programming (OOPs) Lab',
    desc: 'C++ & Java lab programs, file handling, and inheritance implementations.',
    lang: 'C++ / Java',
  },
  {
    title: 'Data Structures & Algorithms (DSA) Lab',
    desc: 'Standard implementations of trees, graphs, sorting, and dynamic programming.',
    lang: 'C / C++',
  },
  {
    title: 'Python Programming Material',
    desc: 'Complete Python syntax, data science basics, and practical exercises.',
    lang: 'Python',
  },
];

const CONTACT_PHONE = '8757313099';
const WHATSAPP_LINK = `https://wa.me/91${CONTACT_PHONE}?text=Hi%20Abhilasha,%20I%20have%20a%20query%20about%20college%20notes%20and%20study%20materials!`;

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'all' | 'Sem 3' | 'Sem 4' | 'Sem 5' | 'lab'>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleContactClick = () => {
    // Open WhatsApp in new tab and show contact modal
    window.open(WHATSAPP_LINK, '_blank');
    setShowContactModal(true);
  };

  const filteredNotes =
    selectedTab === 'all'
      ? NOTES_DATA
      : selectedTab === 'lab'
      ? []
      : NOTES_DATA.filter((n) => n.semester === selectedTab);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex flex-col md:flex-row relative">
      {/* ================= RED SIDEBAR ================= */}
      <aside
        className={`w-full md:w-64 bg-[#e53935] text-white flex flex-col shrink-0 select-none transition-all duration-300 z-30 ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b border-red-500/50 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Notes</h1>
            <p className="text-xs text-red-100 font-medium mt-0.5">College Study Portal</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white hover:text-red-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            type="button"
            onClick={() => {
              setSelectedTab('all');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition text-left cursor-pointer ${
              selectedTab === 'all'
                ? 'bg-white/20 text-white font-bold shadow-inner'
                : 'text-red-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          {/* Semesters */}
          <div className="pt-2 pb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-red-200/80">
            Semesters
          </div>

          {(['Sem 3', 'Sem 4', 'Sem 5'] as const).map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => {
                setSelectedTab(sem);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition text-left cursor-pointer ${
                selectedTab === sem
                  ? 'bg-white/20 text-white font-bold shadow-inner'
                  : 'text-red-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>{sem} Notes</span>
            </button>
          ))}

          {/* Lab works */}
          <div className="pt-2 pb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-red-200/80">
            Practical Work
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedTab('lab');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition text-left cursor-pointer ${
              selectedTab === 'lab'
                ? 'bg-white/20 text-white font-bold shadow-inner'
                : 'text-red-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Pencil className="w-5 h-5" />
            <span>Lab works</span>
          </button>

          {/* Contact (with WhatsApp icon) */}
          <div className="pt-3 pb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-red-200/80">
            Get in Touch
          </div>

          <button
            type="button"
            onClick={handleContactClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow transition hover:scale-102 cursor-pointer"
            title={`Contact: ${CONTACT_PHONE}`}
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5" />
              <span>Contact</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-mono">
              {CONTACT_PHONE}
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-red-500/40 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-red-100 hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar for mobile and navigation */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
            <span className="text-sm sm:text-base font-bold text-gray-800">
              Campus Notes & Lab Material
            </span>
          </div>

          <button
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp: {CONTACT_PHONE}</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-500 text-white p-6 sm:p-8 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">
              Welcome to Notes-Site
            </h2>
            <p className="text-red-100 text-sm sm:text-base max-w-2xl leading-relaxed mb-4">
              Download curated semester lecture notes, previous year question solutions, and lab manual codes for engineering students.
            </p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'Sem 3', 'Sem 4', 'Sem 5', 'lab'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedTab === tab
                      ? 'bg-white text-red-600 shadow'
                      : 'bg-red-700/60 hover:bg-red-700 text-white'
                  }`}
                >
                  {tab === 'all'
                    ? 'All Notes'
                    : tab === 'lab'
                    ? 'Lab Works'
                    : tab}
                </button>
              ))}
            </div>
          </div>

          {/* If Lab works tab is selected */}
          {selectedTab === 'lab' ? (
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-red-600" />
                <span>Lab Works & Practical Assignments</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LAB_WORKS.map((lab) => (
                  <div
                    key={lab.title}
                    className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          {lab.lang}
                        </span>
                        <Code2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-1">{lab.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{lab.desc}</p>
                    </div>
                    <button
                      onClick={handleContactClick}
                      className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Request Lab Codes ({CONTACT_PHONE})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Semester Notes Grid */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-red-600" />
                  <span>
                    {selectedTab === 'all'
                      ? 'Available Notes & Semester Booklets'
                      : `${selectedTab} Notes`}
                  </span>
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                    {filteredNotes.length} Subjects
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-red-50 border border-red-100">
                            {note.icon}
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                              {note.semester}
                            </span>
                            <h4 className="text-base font-bold text-gray-900 leading-tight">
                              {note.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-4">
                        {note.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <a
                        href={note.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                      <a
                        href={note.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Read Now</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= CONTACT MODAL ================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative border border-red-100 animate-slide-up text-center">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl p-1 leading-none cursor-pointer"
            >
              &times;
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <MessageCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Contact for Notes</h3>
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-4">
              Verified Campus Helpline
            </p>

            {/* Direct Contact Card */}
            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 text-left space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">WhatsApp / Mobile:</span>
                <span className="font-extrabold text-base text-gray-900 tracking-wide font-mono">
                  +91 {CONTACT_PHONE}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Contact Person:</span>
                <span className="font-bold text-sm text-gray-900">Abhilasha Jha</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active & Available
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (+91 {CONTACT_PHONE})</span>
              </a>

              <a
                href={`tel:+91${CONTACT_PHONE}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition"
              >
                <Phone className="w-4 h-4 text-gray-600" />
                <span>Direct Call ({CONTACT_PHONE})</span>
              </a>

              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
