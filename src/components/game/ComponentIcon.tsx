import type { ComponentType } from '@/game/types';

const PATHS: Record<ComponentType, React.ReactNode> = {
  users: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="5" cy="10" r="2" />
      <path d="M1.5 18a3.5 3.5 0 0 1 4.5-3.4" />
      <circle cx="19" cy="10" r="2" />
      <path d="M22.5 18a3.5 3.5 0 0 0-4.5-3.4" />
    </>
  ),
  route53: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" />
    </>
  ),
  globalAccelerator: (
    <>
      <circle cx="10" cy="12" r="6" />
      <path d="M15 8l5-2-2 5M14 12h7" />
    </>
  ),
  waf: (
    <>
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
      <path d="M8 12h8M12 8v8" />
    </>
  ),
  cloudfront: (
    <>
      <path d="M7 17h10a4 4 0 0 0 0-8 6 6 0 0 0-11-1 4 4 0 0 0 1 9z" />
      <path d="M12 17v4M8 21h8" />
    </>
  ),
  alb: (
    <>
      <path d="M8 6h8l3 6-3 6H8l-3-6z" />
      <path d="M9 12h6M13 10l2 2-2 2" />
    </>
  ),
  apiGateway: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M9 9l-3 3 3 3M15 9l3 3-3 3" />
    </>
  ),
  ec2: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h8M8 14h4" />
    </>
  ),
  lambda: <path d="M7 4h3l7 16M12 11l-5 9" />,
  elasticache: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M13 7l-4 6h4l-2 5" />
    </>
  ),
  rds: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3" />
    </>
  ),
  aurora: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6" />
      <path d="M12 10l1 2.5 2.5.5-2 1.5.5 2.5-2-1.3-2 1.3.5-2.5-2-1.5 2.5-.5z" />
    </>
  ),
  readReplica: (
    <>
      <ellipse cx="10" cy="7" rx="5" ry="2" />
      <path d="M5 7v9c0 1.1 2.2 2 5 2s5-.9 5-2V7" />
      <path d="M17 9c2 0 3 1 3 3v6M18 16l2 2 2-2" />
    </>
  ),
  dynamodb: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M9 11h6M9 15h6" />
    </>
  ),
  s3: (
    <>
      <path d="M4 7h16l-2 12H6z" />
      <ellipse cx="12" cy="7" rx="8" ry="2" />
    </>
  ),
  sqs: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M8 8v8M12 8v8M16 8v8" />
    </>
  ),
  sns: (
    <>
      <circle cx="6" cy="12" r="2" />
      <path d="M8 12h4M12 12l6-6M12 12l6 6M12 12h7" />
    </>
  ),
};

/**
 * Draws the line icon of an AWS component.
 * @param props The component type and optional classes.
 */
export const ComponentIcon = (props: { type: ComponentType; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className ?? 'size-5'}
    aria-hidden="true"
  >
    {PATHS[props.type]}
  </svg>
);
