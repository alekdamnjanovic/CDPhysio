import { EducationItem, CredentialItem, AthleticItem } from '../models/content.model';

export const EDUCATION_ITEMS: readonly EducationItem[] = [
  {
    school: "Queen's University",
    degree: 'Physiotherapy',
    detail: 'BScPT — physiotherapy degree, Kingston, ON.'
  },
  {
    school: 'University of Western Ontario',
    degree: 'Kinesiology',
    detail: 'BA Kinesiology — specialization in Athletic Therapy, London, ON.'
  }
] as const;

export const CREDENTIAL_ITEMS: readonly CredentialItem[] = [
  {
    title: 'ART®',
    description: 'Active Release Techniques — full body and nerve entrapment courses.',
    url: 'https://www.activerelease.com',
    urlLabel: 'activerelease.com'
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
    urlLabel: 'gunnims.com'
  },
  {
    title: 'Barral Institute',
    description: 'Visceral courses — abdomen, pelvis, and thorax.',
    url: 'https://www.barralinstitute.com',
    urlLabel: 'barralinstitute.com'
  },
  {
    title: 'Osteopath Academy',
    description: 'Structural and cranial divisions.',
    url: 'https://www.osteopatija.rs',
    urlLabel: 'osteopatija.rs'
  },
  {
    title: 'McKenzie MDT®',
    description: 'Mechanical Diagnosis and Therapy — full body.',
    url: 'https://www.mckenzieinstitute.org',
    urlLabel: 'mckenzieinstitute.org'
  },
  {
    title: 'Swodeam Institute',
    description: 'Spinal and peripheral manipulative therapy.',
    url: 'https://www.swodeam.com',
    urlLabel: 'swodeam.com'
  },
  {
    title: 'Orthopaedic Manipulative Therapy',
    description: 'Levels V3 (spine) and L3 (extremities).',
    url: 'https://www.orthodiv.org',
    urlLabel: 'orthodiv.org'
  },
  {
    title: 'Anatomy Trains',
    description: 'Neural, Visceral and Energetic Integration.'
  },
  {
    title: 'New Advances in Hip Rehabilitation',
    description: 'Advanced, evidence-based hip rehab strategies.'
  },
  {
    title: 'University of Calgary',
    description: 'General Management Certificate.'
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
