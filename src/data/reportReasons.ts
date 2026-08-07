export type ReportSeverity = 'low' | 'medium' | 'high';

export interface ReportReason {
  name: string;
  description: string;
  severity: ReportSeverity;
}

/** Options shown in the "Report player" modal's reason list. */
const reportReasons: ReportReason[] = [
  {
    name: 'Offensive language',
    description: 'Swearing, slurs, or otherwise offensive language directed at another player.',
    severity: 'low',
  },
  {
    name: 'Spamming',
    description: 'Repeated or excessive messages flooding the chat.',
    severity: 'low',
  },
  {
    name: 'Advertising',
    description: 'Promoting websites, services, or other games in chat.',
    severity: 'low',
  },
  {
    name: 'Item scamming',
    description: 'Tricking another player out of items or gold through deception.',
    severity: 'medium',
  },
  {
    name: 'Real world trading',
    description: 'Buying, selling, or trading game items or gold for real money.',
    severity: 'medium',
  },
  {
    name: 'Account sharing or trading',
    description: 'Sharing, selling, or trading account access with another person.',
    severity: 'medium',
  },
  {
    name: 'Botting or macroing',
    description: 'Using third-party software to automate gameplay.',
    severity: 'medium',
  },
  {
    name: 'Password phishing',
    description: "Attempting to steal another player's login details.",
    severity: 'high',
  },
  {
    name: 'Staff impersonation',
    description: 'Pretending to be a moderator or member of staff.',
    severity: 'high',
  },
  {
    name: 'Threats or harassment',
    description: 'Targeted threats, harassment, or bullying of another player.',
    severity: 'high',
  },
];

export default reportReasons;
