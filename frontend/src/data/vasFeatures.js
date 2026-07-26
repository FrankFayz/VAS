import {
  Cctv,
  Image,
  Radio,
  Scale,
  ShieldCheck,
  CalendarClock,
  Monitor,
  MapPin,
} from 'lucide-react'

/** Six primary features — real product pages keep this short */
export const VAS_FEATURES = [
  {
    icon: Cctv,
    title: 'Live hall monitoring',
    description:
      'Connect exam-hall cameras and keep active sessions under continuous watch.',
  },
  {
    icon: Radio,
    title: 'Instant malpractice alerts',
    description:
      'Get notified when copying, phone use, or other suspicious behaviour is detected.',
  },
  {
    icon: Image,
    title: 'Photo & video evidence',
    description:
      'Every alert includes timestamped media so decisions are based on proof.',
  },
  {
    icon: MapPin,
    title: 'Seat-level location',
    description:
      'See the exact row and seat so invigilators know where to intervene.',
  },
  {
    icon: Monitor,
    title: 'Supervisor dashboard',
    description:
      'Review incidents, add notes, confirm malpractice, warn, or dismiss in one place.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin-approved access',
    description:
      'Only verified supervisors approved by your institution can view live data.',
  },
]

export const VAS_STEPS = [
  {
    step: '1',
    title: 'Monitor',
    description: 'Cameras watch the hall during a live exam session.',
  },
  {
    step: '2',
    title: 'Detect',
    description: 'AI flags suspicious activity and saves evidence.',
  },
  {
    step: '3',
    title: 'Alert',
    description: 'The supervisor sees the incident on their dashboard.',
  },
  {
    step: '4',
    title: 'Decide',
    description: 'Staff review proof and take the official action.',
  },
]

export const VAS_USERS = [
  {
    icon: Monitor,
    role: 'Supervisors',
    description: 'Receive alerts, review evidence, and act during the exam.',
  },
  {
    icon: ShieldCheck,
    role: 'Administrators',
    description: 'Approve staff, manage sessions, halls, and system access.',
  },
  {
    icon: CalendarClock,
    role: 'Exam offices',
    description: 'Keep a clear record of incidents for later review.',
  },
]

export const VAS_COVER_HIGHLIGHTS = [
  {
    icon: Cctv,
    title: 'AI camera monitoring',
    description: 'Watches halls through CCTV during live exams.',
  },
  {
    icon: Image,
    title: 'Evidence with every alert',
    description: 'Timestamped photos and clips ready for review.',
  },
  {
    icon: Scale,
    title: 'Supervisors decide',
    description: 'Confirm, warn, or dismiss — humans stay in control.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin-gated access',
    description: 'Only approved staff can open the dashboard.',
  },
]
