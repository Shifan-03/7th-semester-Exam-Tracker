import { Exam } from '../types';

export function getInitialExams(): Exam[] {
  const now = new Date();
  
  const addDays = (days: number, hour = 9): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return [
    {
      id: 0,
      name: 'Advanced Physics III',
      subjectCode: 'PHY-301',
      date: addDays(2, 10), // in ~2.5 days (~60 hrs)
      targetScore: 95,
      color: '#38BDF8', // Cyan
      notes: 'Master Schrödinger wave equations, harmonic oscillator, and quantum tunneling formulas.',
      chapters: [
        { id: 'ch-1', title: '01. Wave-Particle Duality & De Broglie Waves', completed: true, revised: true, revisionCount: 2 },
        { id: 'ch-2', title: '02. Time-Independent Schrödinger Equation', completed: true, revised: true, revisionCount: 1 },
        { id: 'ch-3', title: '03. Quantum Wells & Barrier Tunneling', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-4', title: '04. Hydrogen Atom Angular Momentum & Orbitals', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-5', title: '05. Zeeman Effect & Electron Spin Matrix', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-6', title: '06. Perturbation Theory & Wavepacket Dynamics', completed: false, revised: false, revisionCount: 0 },
      ],
    },
    {
      id: 1,
      name: 'Organic Chemistry II',
      subjectCode: 'CHM-220',
      date: addDays(5, 14), // in 5 days
      targetScore: 90,
      color: '#FB7185', // Rose
      notes: 'Focus on nucleophilic acyl substitutions, aldol reactions, and aromatic retrosynthesis pathways.',
      chapters: [
        { id: 'ch-7', title: '01. Electrophilic Aromatic Substitution (EAS)', completed: true, revised: true, revisionCount: 3 },
        { id: 'ch-8', title: '02. Aldehydes & Ketones: Nucleophilic Addition', completed: true, revised: true, revisionCount: 2 },
        { id: 'ch-9', title: '03. Carboxylic Acid Derivatives & Enolates', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-10', title: '04. Aldol Condensation & Michael Addition', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-11', title: '05. Spectroscopy: NMR & Mass Spec Interpretation', completed: false, revised: false, revisionCount: 0 },
      ],
    },
    {
      id: 2,
      name: 'Calculus III & Diff Eq',
      subjectCode: 'MTH-240',
      date: addDays(9, 9), // in 9 days
      targetScore: 98,
      color: '#34D399', // Emerald
      notes: 'Review Green theorem, Stokes theorem, and Divergence theorem proofs with boundary integrals.',
      chapters: [
        { id: 'ch-12', title: '01. Vectors, Dot/Cross Products & Lines/Planes', completed: true, revised: true, revisionCount: 2 },
        { id: 'ch-13', title: '02. Partial Derivatives & Gradient Vector Fields', completed: true, revised: true, revisionCount: 2 },
        { id: 'ch-14', title: '03. Double & Triple Integrals in Spherical Coordinates', completed: true, revised: true, revisionCount: 1 },
        { id: 'ch-15', title: '04. Vector Calculus: Line Integrals & Circulation', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-16', title: '05. Green\'s Theorem & Curl in 2D', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-17', title: '06. Stokes\' & Divergence Theorems in 3D', completed: false, revised: false, revisionCount: 0 },
      ],
    },
    {
      id: 3,
      name: 'Computer Architecture & OS',
      subjectCode: 'CS-350',
      date: addDays(14, 13), // in 14 days
      targetScore: 92,
      color: '#A78BFA', // Violet
      notes: 'Understand pipeline hazard resolution, virtual memory paging tables, and deadlock prevention.',
      chapters: [
        { id: 'ch-18', title: '01. RISC-V Instruction Set Architecture (ISA)', completed: true, revised: true, revisionCount: 1 },
        { id: 'ch-19', title: '02. Pipelining: Data & Structural Hazards', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-20', title: '03. Cache Memory Hierarchies & Associativity', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-21', title: '04. Virtual Memory, TLB & Multi-Level Page Tables', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-22', title: '05. Concurrency: Semaphores & Mutex Locks', completed: false, revised: false, revisionCount: 0 },
      ],
    },
    {
      id: 4,
      name: 'Macroeconomics & Global Finance',
      subjectCode: 'ECO-205',
      date: addDays(20, 11), // in 20 days
      targetScore: 88,
      color: '#FBBF24', // Amber
      notes: 'IS-LM curve model, central bank open market operations, inflation target dynamics.',
      chapters: [
        { id: 'ch-23', title: '01. National Income Accounting & GDP Deflator', completed: true, revised: true, revisionCount: 1 },
        { id: 'ch-24', title: '02. Aggregate Demand & Supply Equilibrium', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-25', title: '03. Money Supply & Fractional Reserve Banking', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-26', title: '04. Fiscal Policy & Multiplier Effects', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-27', title: '05. Exchange Rates & Balance of Payments', completed: false, revised: false, revisionCount: 0 },
      ],
    },
    {
      id: 5,
      name: 'Molecular Cell Biology',
      subjectCode: 'BIO-310',
      date: addDays(27, 15), // in 27 days
      targetScore: 94,
      color: '#F472B6', // Pink
      notes: 'Signal transduction cascades (GPCR / RTK), mitochondrial ATP synthase, cell cycle checkpoints.',
      chapters: [
        { id: 'ch-28', title: '01. Membrane Structure & Active Ion Transport', completed: true, revised: false, revisionCount: 0 },
        { id: 'ch-29', title: '02. Cellular Respiration & Electron Transport Chain', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-30', title: '03. GPCR & Receptor Tyrosine Kinase Pathways', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-31', title: '04. Cell Cycle Regulation & Cyclin-CDK Complex', completed: false, revised: false, revisionCount: 0 },
        { id: 'ch-32', title: '05. Apoptosis Pathways & p53 Tumor Suppression', completed: false, revised: false, revisionCount: 0 },
      ],
    },
  ];
}
