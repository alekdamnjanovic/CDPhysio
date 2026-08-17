export interface EducationItem {
  school: string;
  degree: string;
  detail: string;
}

export interface CredentialItem {
  title: string;
  description: string;
  url?: string;
  urlLabel?: string;
}

export interface AthleticItem {
  title: string;
  role: string;
  iconType: 'csia' | 'nccp' | 'trx';
}

export interface StatItem {
  value: number | string;
  suffix?: string;
  isCountUp: boolean;
  label: string;
}
