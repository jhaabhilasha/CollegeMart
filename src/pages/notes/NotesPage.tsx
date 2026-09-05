import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  FolderPlus,
  PlusCircle,
  Plus,
  Upload,
  X,
  CheckCircle2,
  Menu,
  Sparkles,
  Search,
} from 'lucide-react';

interface NoteItem {
  id: string;
  semester: string;
  title: string;
  description: string;
  category: 'theoretical' | 'practical';
  icon: string;
  downloadUrl: string;
  previewUrl: string;
}

const NOTES_DATA: NoteItem[] = [
  // SEM 1 - Theoretical
  {
    id: 'sem1-math',
    semester: 'Sem 1',
    title: 'Engineering Mathematics I',
    description: 'Differential calculus, matrices, eigenvalues, Taylor series expansion & vector calculus.',
    category: 'theoretical',
    icon: '📐',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=16P3776rHIr92EaMdL4PKVS-Bey_i50l1',
    previewUrl: 'https://drive.google.com/file/d/16P3776rHIr92EaMdL4PKVS-Bey_i50l1/view',
  },
  {
    id: 'sem1-physics',
    semester: 'Sem 1',
    title: 'Engineering Physics',
    description: 'Wave optics, interference, diffraction, lasers, fiber optics & quantum mechanics.',
    category: 'theoretical',
    icon: '🔬',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1mtri0x8ca04TKpehV65Rlnsh7ExscTWh',
    previewUrl: 'https://drive.google.com/file/d/1mtri0x8ca04TKpehV65Rlnsh7ExscTWh/view',
  },
  {
    id: 'sem1-beee',
    semester: 'Sem 1',
    title: 'Basic Electrical & Electronics Engineering',
    description: 'DC circuit theorems, AC fundamentals, single-phase transformers, diodes, BJTs & operational amplifiers.',
    category: 'theoretical',
    icon: '⚡',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },
  {
    id: 'sem1-c-prog',
    semester: 'Sem 1',
    title: 'Problem Solving & Programming in C',
    description: 'Algorithms, pseudocode, data types, loops, arrays, strings, functions, structures & pointer concepts.',
    category: 'theoretical',
    icon: '💻',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva',
    previewUrl: 'https://drive.google.com/file/d/15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva/view',
  },
  // SEM 1 - Practical / Lab
  {
    id: 'sem1-physics-lab',
    semester: 'Sem 1',
    title: 'Engineering Physics Laboratory Manual',
    description: 'Spectrometer, Newton rings, laser wavelength, hall effect & optical fiber attenuation experiments.',
    category: 'practical',
    icon: '🔬',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1mtri0x8ca04TKpehV65Rlnsh7ExscTWh',
    previewUrl: 'https://drive.google.com/file/d/1mtri0x8ca04TKpehV65Rlnsh7ExscTWh/view',
  },
  {
    id: 'sem1-c-lab',
    semester: 'Sem 1',
    title: 'C Programming Practical Lab Records',
    description: 'Complete hands-on C programs for recursion, array searching, string manipulation & file structures.',
    category: 'practical',
    icon: '💻',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva',
    previewUrl: 'https://drive.google.com/file/d/15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva/view',
  },

  // SEM 2 - Theoretical
  {
    id: 'sem2-math',
    semester: 'Sem 2',
    title: 'Engineering Mathematics II',
    description: 'Multivariable calculus, double/triple integrals, Laplace transforms, Fourier series & partial differential equations.',
    category: 'theoretical',
    icon: '📊',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B',
    previewUrl: 'https://drive.google.com/file/d/1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B/view',
  },
  {
    id: 'sem2-chemistry',
    semester: 'Sem 2',
    title: 'Engineering Chemistry',
    description: 'Water technology, electrochemistry, corrosion science, polymer materials, fuels & spectroscopic techniques.',
    category: 'theoretical',
    icon: '🧪',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq',
    previewUrl: 'https://drive.google.com/file/d/1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq/view',
  },
  {
    id: 'sem2-mech-civil',
    semester: 'Sem 2',
    title: 'Basic Mechanical & Civil Engineering',
    description: 'Thermodynamic laws, internal combustion engines, power plants, surveying, building materials & structures.',
    category: 'theoretical',
    icon: '🏗️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG',
    previewUrl: 'https://drive.google.com/file/d/1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG/view',
  },
  {
    id: 'sem2-comm-ethics',
    semester: 'Sem 2',
    title: 'Technical Communication & Professional Ethics',
    description: 'Business correspondence, technical report drafting, presentation skills & professional ethics for engineers.',
    category: 'theoretical',
    icon: '📝',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  // SEM 2 - Practical / Lab
  {
    id: 'sem2-chem-lab',
    semester: 'Sem 2',
    title: 'Engineering Chemistry Laboratory Manual',
    description: 'Conductometric titrations, water hardness testing via EDTA, viscosity of lubricants & pH measurements.',
    category: 'practical',
    icon: '🧪',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq',
    previewUrl: 'https://drive.google.com/file/d/1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq/view',
  },
  {
    id: 'sem2-cad-lab',
    semester: 'Sem 2',
    title: 'CAD Modeling & Workshop Practice Manual',
    description: '2D & 3D AutoCAD design drawings, isometric views, welding, carpentry & sheet metal workshop exercises.',
    category: 'practical',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG',
    previewUrl: 'https://drive.google.com/file/d/1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG/view',
  },

  // SEM 3 - Theoretical
  {
    id: 'sem3-math',
    semester: 'Sem 3',
    title: 'Mathematics III',
    description: 'Complete comprehensive notes covering all modules for semester exams.',
    category: 'theoretical',
    icon: '📐',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=16P3776rHIr92EaMdL4PKVS-Bey_i50l1',
    previewUrl: 'https://drive.google.com/file/d/16P3776rHIr92EaMdL4PKVS-Bey_i50l1/view',
  },
  {
    id: 'sem3-de',
    semester: 'Sem 3',
    title: 'Digital Electronics',
    description: 'Logic gates, Boolean algebra, flip-flops, counters & sequential circuits.',
    category: 'theoretical',
    icon: '⚡',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1mtri0x8ca04TKpehV65Rlnsh7ExscTWh',
    previewUrl: 'https://drive.google.com/file/d/1mtri0x8ca04TKpehV65Rlnsh7ExscTWh/view',
  },
  {
    id: 'sem3-dsa',
    semester: 'Sem 3',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, linked lists, trees, graphs, sorting, searching & algorithmic complexity.',
    category: 'theoretical',
    icon: '🌳',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva',
    previewUrl: 'https://drive.google.com/file/d/15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva/view',
  },
  {
    id: 'sem3-co',
    semester: 'Sem 3',
    title: 'Computer Organization & Architecture',
    description: 'Instruction sets, memory hierarchy, cache, ALU, pipelining and I/O organization.',
    category: 'theoretical',
    icon: '💻',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },
  // SEM 3 - Practical / Lab
  {
    id: 'sem3-dsa-lab',
    semester: 'Sem 3',
    title: 'DSA & Algorithms Lab Manual',
    description: 'Complete C/C++ lab codes for trees, graphs, sorting algorithms, queues & linked lists.',
    category: 'practical',
    icon: '💻',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva',
    previewUrl: 'https://drive.google.com/file/d/15T7UVIiUZsmMEEkanp-5ZZ1c3w8RONva/view',
  },
  {
    id: 'sem3-de-lab',
    semester: 'Sem 3',
    title: 'Digital Electronics Practical Simulator Lab',
    description: 'Breadboard circuit simulations, IC pinouts, adder/subtractor & flip-flop verification records.',
    category: 'practical',
    icon: '⚡',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1mtri0x8ca04TKpehV65Rlnsh7ExscTWh',
    previewUrl: 'https://drive.google.com/file/d/1mtri0x8ca04TKpehV65Rlnsh7ExscTWh/view',
  },

  // SEM 4 - Theoretical
  {
    id: 'sem4-oops',
    semester: 'Sem 4',
    title: 'Object Oriented Programming (C++ / Java)',
    description: 'Classes, inheritance, polymorphism, templates, exception handling & design patterns.',
    category: 'theoretical',
    icon: '☕',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  {
    id: 'sem4-gt',
    semester: 'Sem 4',
    title: 'Graph Theory & Combinatorics',
    description: 'Trees, Eulerian & Hamiltonian graphs, planar graphs, coloring and matching.',
    category: 'theoretical',
    icon: '🕸️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq',
    previewUrl: 'https://drive.google.com/file/d/1iVATOMlIxOk1sXm5KSbq6GvAjPFNrkiq/view',
  },
  {
    id: 'sem4-math4',
    semester: 'Sem 4',
    title: 'Discrete Mathematics & Numerical Methods',
    description: 'Probability distributions, numerical methods, recurrence relations & set theory.',
    category: 'theoretical',
    icon: '📊',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B',
    previewUrl: 'https://drive.google.com/file/d/1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B/view',
  },
  {
    id: 'sem4-micro',
    semester: 'Sem 4',
    title: 'Microprocessors & Microcontrollers (8085/8086)',
    description: 'Architecture, assembly language programming, pin diagrams & peripheral interfacing.',
    category: 'theoretical',
    icon: '🔌',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG',
    previewUrl: 'https://drive.google.com/file/d/1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG/view',
  },
  // SEM 4 - Practical / Lab
  {
    id: 'sem4-oops-lab',
    semester: 'Sem 4',
    title: 'OOPs (C++ & Java) Lab Manual & Programs',
    description: 'Operator overloading, virtual functions, multithreading, GUI swing codes & file I/O programs.',
    category: 'practical',
    icon: '☕',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  {
    id: 'sem4-micro-lab',
    semester: 'Sem 4',
    title: 'Microprocessor 8085/8086 Assembly Lab Codes',
    description: 'Assembly routines for arithmetic operations, block transfers, string reversals & simulator exercises.',
    category: 'practical',
    icon: '🔌',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG',
    previewUrl: 'https://drive.google.com/file/d/1qvZF-mwUT7pnww6uqlsXnbHnFuJkBIbG/view',
  },

  // SEM 5 - Theoretical
  {
    id: 'sem5-os',
    semester: 'Sem 5',
    title: 'Operating Systems',
    description: 'Process management, CPU scheduling, synchronization, deadlocks & virtual memory.',
    category: 'theoretical',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem5-dbms',
    semester: 'Sem 5',
    title: 'Database Management Systems (DBMS)',
    description: 'ER modeling, SQL queries, relational algebra, normalization & transaction processing.',
    category: 'theoretical',
    icon: '🗄️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },
  {
    id: 'sem5-automata',
    semester: 'Sem 5',
    title: 'Automata Theory & Formal Languages (TOC)',
    description: 'Finite automata, regular expressions, context-free grammars & Turing machines.',
    category: 'theoretical',
    icon: '🤖',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW',
    previewUrl: 'https://drive.google.com/file/d/14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW/view',
  },
  {
    id: 'sem5-ip',
    semester: 'Sem 5',
    title: 'Digital Image Processing',
    description: 'Image enhancement, filtering in spatial & frequency domain, segmentation & compression.',
    category: 'theoretical',
    icon: '🖼️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV',
    previewUrl: 'https://drive.google.com/file/d/1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV/view',
  },
  // SEM 5 - Practical / Lab
  {
    id: 'sem5-os-lab',
    semester: 'Sem 5',
    title: 'Operating Systems & Linux Shell Lab',
    description: 'Shell scripting (Bash), Linux system calls (fork, exec, wait), CPU scheduling simulator algorithms.',
    category: 'practical',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem5-dbms-lab',
    semester: 'Sem 5',
    title: 'DBMS SQL & PL/SQL Query Lab Manual',
    description: 'DDL/DML queries, nested subqueries, views, triggers, stored procedures & normalization exercises.',
    category: 'practical',
    icon: '🗄️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },

  // SEM 6 - Theoretical
  {
    id: 'sem6-cd',
    semester: 'Sem 6',
    title: 'Compiler Design',
    description: 'Lexical analysis, LL/LR parsing, syntax-directed translation, intermediate code generation & optimization.',
    category: 'theoretical',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem6-cn',
    semester: 'Sem 6',
    title: 'Computer Networks',
    description: 'OSI & TCP/IP layers, routing protocols (OSPF, BGP), IPv4/IPv6 subnetting, flow control & socket programming.',
    category: 'theoretical',
    icon: '🌐',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },
  {
    id: 'sem6-se',
    semester: 'Sem 6',
    title: 'Software Engineering & Agile Methodologies',
    description: 'SDLC models, Agile Scrum sprints, SRS specifications, UML diagrams, QA testing & CI/CD deployment.',
    category: 'theoretical',
    icon: '📋',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },
  {
    id: 'sem6-cc',
    semester: 'Sem 6',
    title: 'Cloud Computing & Distributed Systems',
    description: 'Cloud architecture (IaaS, PaaS, SaaS), virtualization, Docker containerization, Kubernetes & AWS/GCP essentials.',
    category: 'theoretical',
    icon: '☁️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV',
    previewUrl: 'https://drive.google.com/file/d/1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV/view',
  },
  {
    id: 'sem6-wt',
    semester: 'Sem 6',
    title: 'Web Technologies & Modern Frameworks',
    description: 'Full-stack web development, RESTful APIs, modern JavaScript (React, Node.js), token auth & web security.',
    category: 'theoretical',
    icon: '🚀',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  // SEM 6 - Practical / Lab
  {
    id: 'sem6-cd-lab',
    semester: 'Sem 6',
    title: 'Compiler Design (Lex & Yacc) Lab',
    description: 'Token recognition with Lex/Flex, grammar parser with Yacc/Bison, symbol tables & syntax trees.',
    category: 'practical',
    icon: '⚙️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem6-cn-lab',
    semester: 'Sem 6',
    title: 'Computer Networks Socket & Packet Tracer Lab',
    description: 'TCP/UDP client-server sockets, subnetting topology calculations & Cisco packet tracer experiments.',
    category: 'practical',
    icon: '🌐',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },
  {
    id: 'sem6-wt-lab',
    semester: 'Sem 6',
    title: 'Full-Stack Web Tech Project & Lab Manual',
    description: 'React components, Express REST endpoints, MongoDB models & JWT authentication lab exercises.',
    category: 'practical',
    icon: '🚀',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },

  // SEM 7 - Theoretical
  {
    id: 'sem7-aiml',
    semester: 'Sem 7',
    title: 'Artificial Intelligence & Machine Learning',
    description: 'State space search, heuristic algorithms, supervised & unsupervised learning, regression, SVM & neural networks.',
    category: 'theoretical',
    icon: '🤖',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW',
    previewUrl: 'https://drive.google.com/file/d/14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW/view',
  },
  {
    id: 'sem7-crypto',
    semester: 'Sem 7',
    title: 'Cryptography & Network Security',
    description: 'DES, AES symmetric ciphers, RSA public key cryptography, SHA-256 hashes, digital signatures & firewalls.',
    category: 'theoretical',
    icon: '🔒',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },
  {
    id: 'sem7-dwbi',
    semester: 'Sem 7',
    title: 'Data Warehousing & Data Mining',
    description: 'Multidimensional schemas, OLAP cubes, association rule mining (Apriori), decision trees, k-means clustering.',
    category: 'theoretical',
    icon: '📊',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B',
    previewUrl: 'https://drive.google.com/file/d/1OdZ6WhwUzqMoC9FEJ0TBGApuS5QRfm5B/view',
  },
  {
    id: 'sem7-iot',
    semester: 'Sem 7',
    title: 'Internet of Things (IoT) & Embedded Systems',
    description: 'IoT reference architecture, sensing & actuation, Raspberry Pi / ESP32 interfaces, MQTT protocol & cloud IoT portals.',
    category: 'theoretical',
    icon: '📡',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV',
    previewUrl: 'https://drive.google.com/file/d/1CHyz7dOq5AmNLAB-Y0cqMw4GNNqscxqV/view',
  },
  // SEM 7 - Practical / Lab
  {
    id: 'sem7-aiml-lab',
    semester: 'Sem 7',
    title: 'Machine Learning & Python Scikit-Learn Lab',
    description: 'Hands-on Python notebooks for data preprocessing, classification algorithms, confusion matrices & model evaluation.',
    category: 'practical',
    icon: '🤖',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW',
    previewUrl: 'https://drive.google.com/file/d/14aihTmYH0BThQ1ODPalUoPf9Z1LD2fHW/view',
  },
  {
    id: 'sem7-security-lab',
    semester: 'Sem 7',
    title: 'Network Security & Penetration Testing Lab',
    description: 'Wireshark packet sniffing, Nmap port scanning, Metasploit penetration testing & RSA encryption algorithms.',
    category: 'practical',
    icon: '🔒',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },

  // SEM 8 - Theoretical
  {
    id: 'sem8-deep-learning',
    semester: 'Sem 8',
    title: 'Deep Learning & Natural Language Processing',
    description: 'Convolutional neural networks, recurrent networks (LSTM), attention mechanism, Transformers & BERT architectures.',
    category: 'theoretical',
    icon: '🧠',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem8-blockchain',
    semester: 'Sem 8',
    title: 'Blockchain Technology & Distributed Ledgers',
    description: 'Cryptographic hashing, consensus algorithms (PoW, PoS), Ethereum EVM, Solidity smart contracts & Web3 DApps.',
    category: 'theoretical',
    icon: '⛓️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
  },
  {
    id: 'sem8-mobile-dev',
    semester: 'Sem 8',
    title: 'Mobile Application Development (Android / Flutter)',
    description: 'Mobile architecture, lifecycle, Jetpack Compose, state management, REST API integration & Google Play deployment.',
    category: 'theoretical',
    icon: '📱',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78',
    previewUrl: 'https://drive.google.com/file/d/1CA-77K7iTFoljdr9hwmRcgSpRpvB1X78/view',
  },
  {
    id: 'sem8-capstone',
    semester: 'Sem 8',
    title: 'Major Capstone Project & Viva Preparation',
    description: 'IEEE project report formatting, SRS documentation, UML system architecture diagrams & final project defense viva guide.',
    category: 'theoretical',
    icon: '🎓',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc',
    previewUrl: 'https://drive.google.com/file/d/1V9An-wvcLn-iqYvApWRF52C1a9lrzbpc/view',
  },
  // SEM 8 - Practical / Lab
  {
    id: 'sem8-dl-lab',
    semester: 'Sem 8',
    title: 'Deep Learning & Computer Vision Lab Manual',
    description: 'PyTorch / TensorFlow models for image classification, transfer learning with ResNet, and object detection.',
    category: 'practical',
    icon: '🧠',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
    previewUrl: 'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
  },
  {
    id: 'sem8-smart-contracts-lab',
    semester: 'Sem 8',
    title: 'Solidity & Smart Contract Development Lab',
    description: 'Remix IDE exercises, ERC-20 token contracts, MetaMask integration and deploying contracts on testnets.',
    category: 'practical',
    icon: '⛓️',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1J66V18u74IuPuXIMMYer0-R_NcWgVIE1',
    previewUrl: 'https://drive.google.com/file/d/1J66V18u74IuPuXIMMYer0-R_NcWgVIE1/view',
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

const SEMESTERS = [
  'Sem 1',
  'Sem 2',
  'Sem 3',
  'Sem 4',
  'Sem 5',
  'Sem 6',
  'Sem 7',
  'Sem 8',
] as const;
type SemesterTab = 'all' | (typeof SEMESTERS)[number] | 'lab';

const ALL_AVAILABLE_SEMS = [
  'Sem 1',
  'Sem 2',
  'Sem 3',
  'Sem 4',
  'Sem 5',
  'Sem 6',
  'Sem 7',
  'Sem 8',
];

const ICON_PRESETS = ['📚', '⚙️', '🌐', '📋', '☁️', '🚀', '💻', '⚡', '📐', '🤖', '🗄️', '☕', '💡'];

const CONTACT_PHONE = '8757313099';
const WHATSAPP_LINK = `https://wa.me/91${CONTACT_PHONE}?text=Hi%20Abhilasha,%20I%20have%20a%20query%20about%20college%20notes%20and%20study%20materials!`;

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<SemesterTab>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notes state with localStorage persistence
  const [notesList, setNotesList] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('collegeconnect_custom_notes');
      if (saved) {
        const custom = JSON.parse(saved);
        if (Array.isArray(custom) && custom.length > 0) {
          const normalized = custom.map((item: any) => ({
            ...item,
            category:
              item.category === 'lab' || item.category === 'practical'
                ? 'practical'
                : 'theoretical',
          }));
          return [...NOTES_DATA, ...normalized];
        }
      }
    } catch {
      // ignore parse error
    }
    return NOTES_DATA;
  });

  // URL search params sync
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const s = searchParams.get('search') || '';
    setSearchQuery(s);
  }, [searchParams]);

  const handleNotesSearchChange = (query: string) => {
    setSearchQuery(query);
    const params: Record<string, string> = {};
    if (query.trim()) params.search = query.trim();
    setSearchParams(params);
  };

  const handleClearNotesSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  // Category filter state ('all' | 'theoretical' | 'practical')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'theoretical' | 'practical'>('all');

  // Modal State for Adding Notes
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSemester, setNewSemester] = useState('Sem 6');
  const [newCategory, setNewCategory] = useState<'theoretical' | 'practical'>('theoretical');
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  const [successToast, setSuccessToast] = useState('');

  const filteredNotes = notesList.filter((note) => {
    const matchesSemester =
      selectedTab === 'all'
        ? true
        : selectedTab === 'lab'
        ? note.category === 'practical'
        : note.semester === selectedTab;

    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : note.category === categoryFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      note.title.toLowerCase().includes(q) ||
      note.description.toLowerCase().includes(q) ||
      note.semester.toLowerCase().includes(q);

    return matchesSemester && matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = (sem?: string) => {
    if (sem && ALL_AVAILABLE_SEMS.includes(sem)) {
      setNewSemester(sem);
    } else if (selectedTab.startsWith('Sem')) {
      setNewSemester(selectedTab);
    }
    setIsAddModalOpen(true);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const noteToAdd: NoteItem = {
      id: `note-${Date.now()}`,
      semester: newSemester,
      title: newTitle.trim(),
      description:
        newDescription.trim() ||
        'Comprehensive lecture notes, key formulas, and exam preparation material.',
      category: newCategory,
      icon: newIcon || '📚',
      downloadUrl:
        newLink.trim() ||
        'https://drive.google.com/uc?export=download&id=1n1dfKf6djrp8mU84JyUt3MRmHASCwlct',
      previewUrl:
        newLink.trim() ||
        'https://drive.google.com/file/d/1n1dfKf6djrp8mU84JyUt3MRmHASCwlct/view',
    };

    const updated = [noteToAdd, ...notesList];
    setNotesList(updated);

    // Save to localStorage
    try {
      const saved = localStorage.getItem('collegeconnect_custom_notes');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        'collegeconnect_custom_notes',
        JSON.stringify([noteToAdd, ...existing])
      );
    } catch (err) {
      console.error('Failed to save to local storage', err);
    }

    // Switch view to the semester of the added note
    if (SEMESTERS.includes(newSemester as any)) {
      setSelectedTab(newSemester as SemesterTab);
    } else {
      setSelectedTab('all');
    }

    setSuccessToast(`"${newTitle.trim()}" added successfully to ${newSemester}!`);
    setTimeout(() => setSuccessToast(''), 4000);

    // Reset form & close modal
    setNewTitle('');
    setNewDescription('');
    setNewLink('');
    setIsAddModalOpen(false);
  };

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

          {/* Semesters Section */}
          <div className="pt-3 pb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-red-200/90 flex items-center justify-between">
            <span>Semesters</span>
            <span className="text-[10px] bg-red-700/60 text-red-100 px-1.5 py-0.5 rounded font-bold">
              Sem 1 - 8
            </span>
          </div>

          <div className="space-y-1">
            {SEMESTERS.map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => {
                  setSelectedTab(sem);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition text-left cursor-pointer ${
                  selectedTab === sem
                    ? 'bg-white/25 text-white font-bold shadow-inner'
                    : 'text-red-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-red-100 shrink-0" />
                <span>{sem} Notes</span>
              </button>
            ))}
          </div>

          {/* Quick Add Notes Action in Sidebar */}
          <div className="pt-2 pb-1 px-1">
            <button
              type="button"
              onClick={() => {
                handleOpenAddModal('Sem 1');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/15 hover:bg-white/25 text-white transition border border-white/25 shadow-xs cursor-pointer group"
            >
              <FolderPlus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>+ Add Notes</span>
            </button>
          </div>

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
          <a
            href="https://wa.me/918757313099"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-100 hover:bg-white/10 hover:text-white transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Contact</span>
          </a>
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
              <span>Marketplace</span>
            </button>
            <span className="text-sm sm:text-base font-bold text-gray-800">
              Campus Notes & Study Materials
            </span>
          </div>

          {/* Top Bar Quick Search on Notes Page */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subjects, notes, topics..."
                value={searchQuery}
                onChange={(e) => handleNotesSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-full border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-xs transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearNotesSearch}
                  className="p-1 text-gray-400 hover:text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Add Notes Action Button in Navbar */}
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e53935] hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Notes</span>
              <span className="sm:hidden">+ Add</span>
            </button>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp: {CONTACT_PHONE}</span>
              <span className="md:hidden">{CONTACT_PHONE}</span>
            </a>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Toast Notification */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold">{successToast}</p>
              </div>
              <button
                onClick={() => setSuccessToast('')}
                className="text-emerald-600 hover:text-emerald-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-500 text-white p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome to Notes-Site
                </h2>
                <p className="text-red-100 text-xs sm:text-sm max-w-2xl leading-relaxed mt-1">
                  Download curated semester lecture notes, previous year question solutions, and lab manual codes for engineering students.
                </p>
              </div>
              <button
                onClick={() => handleOpenAddModal('Sem 6')}
                className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 hover:bg-red-50 font-extrabold text-xs shadow transition cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Upload Notes</span>
              </button>
            </div>

            {/* Banner Search Input */}
            <div className="relative w-full max-w-xl my-3.5">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-red-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search across all 8 semesters (e.g. Compiler, Math, Python, DSA, Physics)..."
                  value={searchQuery}
                  onChange={(e) => handleNotesSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs text-white placeholder-red-200 border border-white/30 focus:outline-hidden focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 shadow-inner text-xs sm:text-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearNotesSearch}
                    className="p-1 text-red-200 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/20">
              {(['all', ...SEMESTERS, 'lab'] as const).map((tab) => (
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
                    : `${tab} Notes`}
                </button>
              ))}

              <button
                onClick={() => handleOpenAddModal()}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer bg-white/20 hover:bg-white/30 text-white border border-white/40 flex items-center gap-1.5"
                title="Add new note"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>
          </div>

          {/* If Lab works tab is selected */}
          {selectedTab === 'lab' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-red-600" />
                  <span>Lab Works & Practical Assignments</span>
                </h3>
              </div>
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
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Request Lab Codes ({CONTACT_PHONE})</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Semester Notes Grid */
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
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

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[11px] font-semibold text-gray-500">Category:</span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        categoryFilter === 'all'
                          ? 'bg-gray-800 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('theoretical')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        categoryFilter === 'theoretical'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <span>📖 Theoretical</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('practical')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        categoryFilter === 'practical'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <span>🔬 Practical / Lab</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4 text-red-600" />
                  <span>+ Add Note {selectedTab.startsWith('Sem') ? `for ${selectedTab}` : ''}</span>
                </button>
              </div>

              {/* Active Search Results Indicator */}
              {searchQuery.trim() && (
                <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-red-600" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Showing notes matching <span className="font-bold text-gray-900">"{searchQuery}"</span>
                      <span className="ml-1 text-gray-500 font-medium">({filteredNotes.length} subjects found)</span>
                    </span>
                  </div>
                  <button
                    onClick={handleClearNotesSearch}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredNotes.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-white rounded-2xl border-2 border-dashed border-red-200">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">No study notes found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                      {searchQuery
                        ? `No notes match "${searchQuery}" in ${selectedTab === 'all' ? 'any semester' : selectedTab}. Try searching another keyword or clearing search.`
                        : `No notes found in this category or semester.`}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {searchQuery && (
                        <button
                          onClick={handleClearNotesSearch}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTab('all');
                          setCategoryFilter('all');
                          handleClearNotesSearch();
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition cursor-pointer"
                      >
                        View All Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
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
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                                  {note.semester}
                                </span>
                                <span className="text-gray-300 text-xs">•</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                    note.category === 'practical'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  <span>{note.category === 'practical' ? '🔬 Practical / Lab' : '📖 Theoretical'}</span>
                                </span>
                              </div>
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
                  ))
                )}

                {/* Clickable Add Note Card at the end of grid */}
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="p-6 bg-white/70 hover:bg-white rounded-2xl border-2 border-dashed border-red-300 hover:border-red-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer min-h-[190px]"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition">
                    + Add New Note
                  </h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1">
                    Upload lecture notes, solutions, or reference booklets for {selectedTab === 'all' ? 'any semester' : selectedTab}.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= ADD NOTES MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Add Semester Notes</h3>
                  <p className="text-xs text-gray-500">Publish study materials for college students</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-4 pt-4">
              {/* Semester & Category selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {ALL_AVAILABLE_SEMS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as 'theoretical' | 'practical')
                    }
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="theoretical">📖 Theoretical Notes</option>
                    <option value="practical">🔬 Practical / Lab</option>
                  </select>
                </div>
              </div>

              {/* Visual Category Selector Buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Note Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCategory('theoretical')}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      newCategory === 'theoretical'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">📖</span>
                      <span className={`text-xs font-extrabold ${newCategory === 'theoretical' ? 'text-blue-700' : 'text-gray-800'}`}>
                        Theoretical
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Class lectures, syllabus notes & exam question banks.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('practical')}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      newCategory === 'practical'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🔬</span>
                      <span className={`text-xs font-extrabold ${newCategory === 'practical' ? 'text-emerald-700' : 'text-gray-800'}`}>
                        Practical / Lab
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Lab manuals, code repositories & experiment records.
                    </p>
                  </button>
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compiler Design & Code Optimization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Subject Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_PRESETS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewIcon(ic)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base cursor-pointer transition ${
                        newIcon === ic
                          ? 'bg-red-600 text-white shadow-xs scale-110'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what chapters or concepts are included in this note..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {/* PDF or Drive Link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  PDF Download / Google Drive Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave empty to use default Google Drive preview & download template.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#e53935] hover:bg-red-700 shadow-sm transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
