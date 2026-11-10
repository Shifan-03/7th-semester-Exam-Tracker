import { Exam } from '../types';

export const getInitialExams = (): Exam[] => [
  {
    id: 0,
    name: 'Applied Database (Oracle)',
    subjectCode: 'MIS 4101',
    date: '2026-11-12T10:15',
    targetScore: 90,
    color: '#38BDF8',
    notes: 'Exam Centre: 505 & 506 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-0-1', title: 'Chapter 1: Introduction to Oracle & SQL', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-0-2', title: 'Chapter 2: PL/SQL Basics & Blocks', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-0-3', title: 'Chapter 3: Cursors, Triggers & Procedures', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-0-4', title: 'Chapter 4: Database Administration & Tuning', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  },
  {
    id: 1,
    name: 'IT Investment Management',
    subjectCode: 'MIS 4102',
    date: '2026-11-16T10:15',
    targetScore: 90,
    color: '#34D399',
    notes: 'Exam Centre: 504 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-1-1', title: 'Chapter 1: Evaluating IT Investments', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-1-2', title: 'Chapter 2: Financial Metrics & ROI for IT', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-1-3', title: 'Chapter 3: Risk Assessment in Tech Projects', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-1-4', title: 'Chapter 4: Portfolio Management & Alignment', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  },
  {
    id: 2,
    name: 'Project Management & Info Systems',
    subjectCode: 'MIS 4103',
    date: '2026-11-19T10:15',
    targetScore: 90,
    color: '#F472B6',
    notes: 'Exam Centre: 505 & 506 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-2-1', title: 'Chapter 1: Project Integration & Scope', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-2-2', title: 'Chapter 2: Scheduling & Critical Path Method', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-2-3', title: 'Chapter 3: Budgeting & Resource Allocation', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-2-4', title: 'Chapter 4: Risk & Quality Management', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  },
  {
    id: 3,
    name: 'Supply Chain Management',
    subjectCode: 'MIS 4104',
    date: '2026-12-01T10:15',
    targetScore: 90,
    color: '#FBBF24',
    notes: 'Exam Centre: 505 & 506 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-3-1', title: 'Chapter 1: SCM Strategy & Drivers', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-3-2', title: 'Chapter 2: Network Design & Logistics', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-3-3', title: 'Chapter 3: Inventory Management & Bullwhip Effect', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-3-4', title: 'Chapter 4: IT & E-Business in Supply Chain', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  },
  {
    id: 4,
    name: 'Enterprise Resource Planning (ERP)',
    subjectCode: 'MIS 4106',
    date: '2026-12-06T10:15',
    targetScore: 90,
    color: '#A78BFA',
    notes: 'Exam Centre: 505 & 506 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-4-1', title: 'Chapter 1: ERP Architecture & Core Modules', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-4-2', title: 'Chapter 2: Supply Chain Integration in ERP', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-4-3', title: 'Chapter 3: Implementation Life Cycle & Risk', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-4-4', title: 'Chapter 4: Future Trends (Cloud & AI ERP)', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  },
  {
    id: 5,
    name: 'Business Research',
    subjectCode: 'MIS 4105',
    date: '2026-12-10T10:15',
    targetScore: 90,
    color: '#FB7185',
    notes: 'Exam Centre: 505 & 506 (Time: 10:15 AM - 01:15 PM)',
    chapters: [
      { id: 'ch-5-1', title: 'Chapter 1: Research Process & Problem Definition', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-5-2', title: 'Chapter 2: Research Design & Hypothesis', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-5-3', title: 'Chapter 3: Sampling & Data Collection Methods', completed: false, revised: false, revisionCount: 0, pdfUrl: '' },
      { id: 'ch-5-4', title: 'Chapter 4: Data Analysis & Report Writing', completed: false, revised: false, revisionCount: 0, pdfUrl: '' }
    ]
  }
];
