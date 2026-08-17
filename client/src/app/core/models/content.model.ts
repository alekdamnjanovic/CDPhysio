export interface EducationItem {
  school: string;
  degree: string;
  detail: string;
  certificateUrl?: string;
  certificateImage?: string;
  defaultRotation?: number;
  certificates?: readonly CertificateDoc[];
}

export interface CertificateDoc {
  title: string;
  pdfUrl: string;
  imageUrl: string;
  defaultRotation?: number;
}

export interface CredentialItem {
  title: string;
  description: string;
  url?: string;
  urlLabel?: string;
  certificateUrl?: string;
  certificateImage?: string;
  defaultRotation?: number;
  certificates?: readonly CertificateDoc[];
}

export interface AthleticItem {
  title: string;
  role: string;
  iconType: 'csia' | 'nccp' | 'trx';
}
