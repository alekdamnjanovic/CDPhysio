import { EducationItem, CredentialItem, AthleticItem } from '../models/content.model';

export const EDUCATION_ITEMS: readonly EducationItem[] = [
  {
    school: "Queen's University",
    degree: 'Physiotherapy',
    detail: 'BScPT — physiotherapy degree, Kingston, ON.',
    certificateUrl: 'certificates/education-queens/page19.pdf',
    certificateImage: 'certificates/education-queens/page19.webp'
  },
  {
    school: 'University of Western Ontario',
    degree: 'Kinesiology',
    detail: 'BA Kinesiology — specialization in Athletic Therapy, London, ON.',
    certificateUrl: 'certificates/education-western/page20.pdf',
    certificateImage: 'certificates/education-western/page20.webp'
  }
] as const;

export const CREDENTIAL_ITEMS: readonly CredentialItem[] = [
  {
    title: 'ART®',
    description: 'Active Release Techniques — full body and nerve entrapment courses.',
    url: 'https://www.activerelease.com',
    urlLabel: 'activerelease.com',
    certificates: [
      { title: 'Course 1', pdfUrl: 'certificates/art/page1.pdf', imageUrl: 'certificates/art/page1.webp' },
      { title: 'Course 2', pdfUrl: 'certificates/art/page2.pdf', imageUrl: 'certificates/art/page2.webp' }
    ]
  },
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
    title: 'DNS® Strength Training 1',
    description: 'Dynamic Neuromuscular Stabilization — functional core & strength training.',
    certificateUrl: 'certificates/dns/dns-strength-training-1.pdf',
    certificateImage: 'certificates/dns/dns-strength-training-1.webp'
  },
  {
    title: 'Gunn IMS Certified Practitioner',
    description: 'Intramuscular Stimulation for chronic pain.',
    url: 'https://www.gunnims.com',
    urlLabel: 'gunnims.com',
    certificateUrl: 'certificates/gunn-ims/page18.pdf',
    certificateImage: 'certificates/gunn-ims/page18.webp'
  },
  {
    title: 'Barral Institute',
    description: 'Visceral courses — abdomen, pelvis, and thorax.',
    url: 'https://www.barralinstitute.com',
    urlLabel: 'barralinstitute.com',
    certificates: [
      { title: 'Part 1', pdfUrl: 'certificates/barral-institute/page3.pdf', imageUrl: 'certificates/barral-institute/page3.webp' },
      { title: 'Part 2', pdfUrl: 'certificates/barral-institute/page4.pdf', imageUrl: 'certificates/barral-institute/page4.webp' },
      { title: 'Part 3', pdfUrl: 'certificates/barral-institute/page5.pdf', imageUrl: 'certificates/barral-institute/page5.webp' }
    ]
  },
  {
    title: 'Osteopath Academy',
    description: 'Structural and cranial divisions.',
    url: 'https://www.osteopatija.rs',
    urlLabel: 'osteopatija.rs',
    certificates: [
      { title: 'Diploma 1', pdfUrl: 'certificates/osteopath-academy/page6.pdf', imageUrl: 'certificates/osteopath-academy/page6.webp' },
      { title: 'Diploma 2', pdfUrl: 'certificates/osteopath-academy/page7.pdf', imageUrl: 'certificates/osteopath-academy/page7.webp' },
      { title: 'Diploma 3', pdfUrl: 'certificates/osteopath-academy/page8.pdf', imageUrl: 'certificates/osteopath-academy/page8.webp' },
      { title: 'Diploma 4', pdfUrl: 'certificates/osteopath-academy/page9.pdf', imageUrl: 'certificates/osteopath-academy/page9.webp' },
      { title: 'Diploma 5', pdfUrl: 'certificates/osteopath-academy/page10.pdf', imageUrl: 'certificates/osteopath-academy/page10.webp' },
      { title: 'Diploma 6', pdfUrl: 'certificates/osteopath-academy/page11.pdf', imageUrl: 'certificates/osteopath-academy/page11.webp' },
      { title: 'Diploma 7', pdfUrl: 'certificates/osteopath-academy/page12.pdf', imageUrl: 'certificates/osteopath-academy/page12.webp' },
      { title: 'Diploma 8', pdfUrl: 'certificates/osteopath-academy/page13.pdf', imageUrl: 'certificates/osteopath-academy/page13.webp' },
      { title: 'Diploma 9', pdfUrl: 'certificates/osteopath-academy/page14.pdf', imageUrl: 'certificates/osteopath-academy/page14.webp' },
      { title: 'Diploma 10', pdfUrl: 'certificates/osteopath-academy/page15.pdf', imageUrl: 'certificates/osteopath-academy/page15.webp' },
      { title: 'Diploma 11', pdfUrl: 'certificates/osteopath-academy/page16.pdf', imageUrl: 'certificates/osteopath-academy/page16.webp' }
    ]
  },
  {
    title: 'McKenzie MDT®',
    description: 'Mechanical Diagnosis and Therapy — full body.',
    url: 'https://www.mckenzieinstitute.org',
    urlLabel: 'mckenzieinstitute.org',
    certificates: [
      { title: 'Part A', pdfUrl: 'certificates/mckenzie-mdt/page1.pdf', imageUrl: 'certificates/mckenzie-mdt/page1.webp' },
      { title: 'Part B', pdfUrl: 'certificates/mckenzie-mdt/page2.pdf', imageUrl: 'certificates/mckenzie-mdt/page2.webp' },
      { title: 'Part C', pdfUrl: 'certificates/mckenzie-mdt/page3.pdf', imageUrl: 'certificates/mckenzie-mdt/page3.webp' },
      { title: 'Part D', pdfUrl: 'certificates/mckenzie-mdt/page23.pdf', imageUrl: 'certificates/mckenzie-mdt/page23.webp' },
      { title: 'Part E', pdfUrl: 'certificates/mckenzie-mdt/page24.pdf', imageUrl: 'certificates/mckenzie-mdt/page24.webp' }
    ]
  },
  {
    title: 'Swodeam Institute',
    description: 'Spinal and peripheral manipulative therapy.',
    url: 'https://www.swodeam.com',
    urlLabel: 'swodeam.com',
    certificates: [
      { title: 'Part 1', pdfUrl: 'certificates/swodeam/page21.pdf', imageUrl: 'certificates/swodeam/page21.webp' },
      { title: 'Part 2', pdfUrl: 'certificates/swodeam/page22.pdf', imageUrl: 'certificates/swodeam/page22.webp' }
    ]
  },
  {
    title: 'Orthopaedic Manipulative Therapy',
    description: 'Levels V3 (spine) and L3 (extremities).',
    url: 'https://www.orthodiv.org',
    urlLabel: 'orthodiv.org',
    certificates: [
      { title: 'Level V3', pdfUrl: 'certificates/orthopaedic/page6.pdf', imageUrl: 'certificates/orthopaedic/page6.webp' },
      { title: 'Level L3', pdfUrl: 'certificates/orthopaedic/page7.pdf', imageUrl: 'certificates/orthopaedic/page7.webp' }
    ]
  },
  {
    title: 'Anatomy Trains',
    description: 'Neural, Visceral and Energetic Integration.'
  },
  {
    title: 'New Advances in Hip Rehabilitation',
    description: 'Advanced, evidence-based hip rehab strategies.',
    certificateUrl: 'certificates/hip-rehab/page5.pdf',
    certificateImage: 'certificates/hip-rehab/page5.webp'
  },
  {
    title: 'University of Calgary',
    description: 'General Management Certificate.',
    certificateUrl: 'certificates/calgary-management/page4.pdf',
    certificateImage: 'certificates/calgary-management/page4.webp'
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
  'Sports Recovery',
  'Manual Therapy',
  'Initial Assessment',
  'Performance Training',
  'Other'
] as const;

export const QUICK_QUESTIONS: readonly string[] = [
  'How do I book an appointment?',
  'What are the prices for treatment?',
  'Where is CD Physio located?',
  'What conditions does Carole treat?',
  "Tell me about Carole's experience."
] as const;
