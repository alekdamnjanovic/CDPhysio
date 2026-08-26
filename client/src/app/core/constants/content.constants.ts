import { EducationItem, CredentialItem, AthleticItem } from '../models/content.model';

export const EDUCATION_ITEMS: readonly EducationItem[] = [
  {
    school: "Queen's University",
    degree: 'Physiotherapy',
    detail: 'BScPT — physiotherapy degree, Kingston, ON.',
    certificateUrl: 'certificates/education-queens/queens-degree.pdf',
    certificateImage: 'certificates/education-queens/queens-degree.webp'
  },
  {
    school: 'University of Western Ontario',
    degree: 'Kinesiology',
    detail: 'BA Kinesiology — specialization in Athletic Therapy, London, ON.',
    certificateUrl: 'certificates/education-western/western-degree.pdf',
    certificateImage: 'certificates/education-western/western-degree.webp'
  }
] as const;

export const CREDENTIAL_ITEMS: readonly CredentialItem[] = [
  {
    title: 'DNS® Certified Practitioner',
    description: 'Dynamic Neuromuscular Stabilization.',
    url: 'https://www.rehabps.com',
    urlLabel: 'rehabps.com',
    certificateUrl: 'certificates/dns/dns-practitioner.pdf',
    certificateImage: 'certificates/dns/dns-practitioner.webp'
  },
  {
    title: 'DNS® Certified Exercise Trainer',
    description: 'DNS exercise program training for functional stabilization.',
    certificateUrl: 'certificates/dns/dns-exercise-trainer.pdf',
    certificateImage: 'certificates/dns/dns-exercise-trainer.webp'
  },
  {
    title: 'DNS® Strength Training',
    description: 'Dynamic Neuromuscular Stabilization — functional core & strength training.',
    certificateUrl: 'certificates/dns/dns-strength-training-1.pdf',
    certificateImage: 'certificates/dns/dns-strength-training-1.webp'
  },
  {
    title: 'Gunn IMS Certified Practitioner',
    description: 'Intramuscular Stimulation for chronic pain.',
    url: 'https://www.gunnims.com',
    urlLabel: 'gunnims.com',
    certificateUrl: 'certificates/gunn-ims/gunn-ims.pdf',
    certificateImage: 'certificates/gunn-ims/gunn-ims.webp'
  },
  {
    title: 'Barral Institute',
    description: 'Visceral courses — abdomen, pelvis, and thorax.',
    url: 'https://www.barralinstitute.com',
    urlLabel: 'barralinstitute.com',
    certificates: [
      { title: 'Visceral Manipulation 1', pdfUrl: 'certificates/barral-institute/barral-institute-1.pdf', imageUrl: 'certificates/barral-institute/barral-institute-1.webp' },
      { title: 'Visceral Manipulation 2', pdfUrl: 'certificates/barral-institute/barral-institute-2.pdf', imageUrl: 'certificates/barral-institute/barral-institute-2.webp' },
      { title: 'Visceral Manipulation 3', pdfUrl: 'certificates/barral-institute/barral-institute-3.pdf', imageUrl: 'certificates/barral-institute/barral-institute-3.webp' }
    ]
  },
  {
    title: 'ART®',
    description: 'Active Release Techniques — full body and nerve entrapment courses.',
    url: 'https://www.activerelease.com',
    urlLabel: 'activerelease.com',
    certificates: [
      { title: 'Full Body Course', pdfUrl: 'certificates/art/art-1.pdf', imageUrl: 'certificates/art/art-1.webp' },
      { title: 'Nerve Entrapment', pdfUrl: 'certificates/art/art-2.pdf', imageUrl: 'certificates/art/art-2.webp' }
    ]
  },
  {
    title: 'Osteopath Academy',
    description: 'Structural and cranial divisions.',
    url: 'https://www.osteopatija.rs',
    urlLabel: 'osteopatija.rs',
    certificates: [
      { title: 'Diploma 1', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-1.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-1.webp' },
      { title: 'Diploma 2', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-2.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-2.webp' },
      { title: 'Diploma 3', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-3.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-3.webp' },
      { title: 'Diploma 4', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-4.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-4.webp' },
      { title: 'Diploma 5', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-5.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-5.webp' },
      { title: 'Diploma 6', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-6.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-6.webp' },
      { title: 'Diploma 7', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-7.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-7.webp' },
      { title: 'Diploma 8', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-8.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-8.webp' },
      { title: 'Diploma 9', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-9.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-9.webp' },
      { title: 'Diploma 10', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-10.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-10.webp' },
      { title: 'Diploma 11', pdfUrl: 'certificates/osteopath-academy/osteopath-academy-11.pdf', imageUrl: 'certificates/osteopath-academy/osteopath-academy-11.webp' }
    ]
  },
  {
    title: 'McKenzie MDT®',
    description: 'Mechanical Diagnosis and Therapy — full body.',
    url: 'https://www.mckenzieinstitute.org',
    urlLabel: 'mckenzieinstitute.org',
    certificates: [
      { title: 'Part A', pdfUrl: 'certificates/mckenzie-mdt/mckenzie-part-a.pdf', imageUrl: 'certificates/mckenzie-mdt/mckenzie-part-a.webp' },
      { title: 'Part B', pdfUrl: 'certificates/mckenzie-mdt/mckenzie-part-b.pdf', imageUrl: 'certificates/mckenzie-mdt/mckenzie-part-b.webp' },
      { title: 'Part C', pdfUrl: 'certificates/mckenzie-mdt/mckenzie-part-c.pdf', imageUrl: 'certificates/mckenzie-mdt/mckenzie-part-c.webp' },
      { title: 'Part D', pdfUrl: 'certificates/mckenzie-mdt/mckenzie-part-d.pdf', imageUrl: 'certificates/mckenzie-mdt/mckenzie-part-d.webp' },
      { title: 'Part E', pdfUrl: 'certificates/mckenzie-mdt/mckenzie-part-e.pdf', imageUrl: 'certificates/mckenzie-mdt/mckenzie-part-e.webp' }
    ]
  },
  {
    title: 'Swodeam Institute',
    description: 'Spinal and peripheral manipulative therapy.',
    url: 'https://www.swodeam.com',
    urlLabel: 'swodeam.com',
    certificates: [
      { title: 'Spinal Manipulation', pdfUrl: 'certificates/swodeam/swodeam-1.pdf', imageUrl: 'certificates/swodeam/swodeam-1.webp' },
      { title: 'Peripheral Manipulation', pdfUrl: 'certificates/swodeam/swodeam-2.pdf', imageUrl: 'certificates/swodeam/swodeam-2.webp' }
    ]
  },
  {
    title: 'Orthopaedic Manipulative Therapy',
    description: 'Levels V3 (spine) and L3 (extremities).',
    url: 'https://www.orthodiv.org',
    urlLabel: 'orthodiv.org',
    certificates: [
      { title: 'Level V3 (Spine)', pdfUrl: 'certificates/orthopaedic/orthopaedic-1.pdf', imageUrl: 'certificates/orthopaedic/orthopaedic-1.webp' },
      { title: 'Level L3 (Extremities)', pdfUrl: 'certificates/orthopaedic/orthopaedic-2.pdf', imageUrl: 'certificates/orthopaedic/orthopaedic-2.webp' }
    ]
  },
  {
    title: 'Anatomy Trains',
    description: 'Neural, Visceral and Energetic Integration.',
    certificateUrl: 'certificates/anatomy-trains/anatomy-trains.pdf',
    certificateImage: 'certificates/anatomy-trains/anatomy-trains.webp'
  },
  {
    title: 'New Advances in Hip Rehabilitation',
    description: 'Advanced, evidence-based hip rehab strategies.',
    certificateUrl: 'certificates/hip-rehab/hip-rehab.pdf',
    certificateImage: 'certificates/hip-rehab/hip-rehab.webp'
  },
  {
    title: 'University of Calgary',
    description: 'General Management Certificate.',
    certificateUrl: 'certificates/calgary-management/calgary-management.pdf',
    certificateImage: 'certificates/calgary-management/calgary-management.webp'
  }
] as const;

export const ATHLETIC_ITEMS: readonly AthleticItem[] = [
  {
    title: 'CSIA Level 2',
    role: 'Ski Instructor',
    iconType: 'csia'
  },
  {
    title: 'NCCP Level 1',
    role: 'Ski Coach',
    iconType: 'nccp'
  },
  {
    title: 'TRX Certified',
    role: 'Suspension Training',
    iconType: 'trx'
  }
] as const;

export const SERVICE_OPTIONS: readonly string[] = [
  'Physiotherapy',
  'Performance Training'
] as const;

export const QUICK_QUESTIONS: readonly string[] = [
  'How do I book an appointment?',
  'What are the prices for treatment?',
  'Where is CD Physio located?',
  'What conditions does Carole treat?',
  "Tell me about Carole's experience."
] as const;
