// Public, fictional examples for the marketing page. Never populate these with
// private wedding records: authenticated product pages will own that data.
export const demoWedding = {
  title: "Meera & Aarav's Royal Union",
  coupleLabel: "Meera & Aarav Agrawal",
  guestNames: "Aarav & Meera",
  heroVenue: "Fairmont Jaipur · December 2027",
  guestDate: "December 13–16, 2027 · The Fairmont Palace, Jaipur",
  daysRemaining: 63,
  attending: 420,
  invited: 480,
  completedTasks: 54,
  spendLabel: "₹28.2L",
  agreedLabel: "₹48,50,000",
} as const;

export interface DemoFamily {
  id: string;
  name: string;
  location: string;
  members: string;
  ceremonies: string;
  invitation: string;
  status: string;
  pending: boolean;
}

export const demoFamilies: readonly DemoFamily[] = [
  { id: "singhania", name: "Singhania Family", location: "Mumbai", members: "4 (2 Adults, 2 Teens)", ceremonies: "All 4 Events", invitation: "Private link ready", status: "Confirmed 4/4", pending: false },
  { id: "mittal", name: "Dr. Rajesh & Sunita Mittal", location: "London", members: "2 Adults", ceremonies: "Sangeet & Pheras", invitation: "Private link ready", status: "Confirmed 2/2", pending: false },
  { id: "verma", name: "Verma Household", location: "Delhi", members: "5 (3 Adults, 2 Kids)", ceremonies: "Haldi + Sangeet", invitation: "Follow-up needed", status: "Awaiting Reply", pending: true },
];

export const demoMembers = ["Rajesh", "Sunita", "Rohan", "Priya"] as const;

export const navigation = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Families", href: "#for-families" },
  { label: "Wedding Website", href: "#wedding-website" },
] as const;
