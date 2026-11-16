/**
 * Canonical list of AWS acronyms that have definitions in i18n Glossary.
 */
export const GLOSSARY_TERMS = [
  'EC2',
  'ALB',
  'NLB',
  'GWLB',
  'CLB',
  'ELB',
  'ASG',
  'AMI',
  'AZ',
  'VPC',
  'IGW',
  'NAT',
  'NACL',
  'SG',
  'ENI',
  'EIP',
  'TGW',
  'DX',
  'RDS',
  'S3',
  'EBS',
  'EFS',
  'FSX',
  'SQS',
  'SNS',
  'DLQ',
  'FIFO',
  'IAM',
  'KMS',
  'WAF',
  'ACM',
  'MFA',
  'SCP',
  'RTO',
  'RPO',
  'DR',
  'HA',
  'SPOF',
  'IOPS',
  'RI',
  'DAX',
  'ECS',
  'EKS',
] as const;

export type GlossaryTerm = (typeof GLOSSARY_TERMS)[number];

const isGlossaryTerm = (term: string): term is GlossaryTerm =>
  (GLOSSARY_TERMS as readonly string[]).includes(term);

/**
 * Normalizes acronym tokens to their Glossary key.
 * @param token Acronym text extracted from Markdown.
 * @returns Standardized glossary key if found.
 */
export const normalizeGlossaryKey = (token: string): GlossaryTerm | undefined => {
  if (token === 'FSx') {
    return 'FSX';
  }
  return isGlossaryTerm(token) ? token : undefined;
};
