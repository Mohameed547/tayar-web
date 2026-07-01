// Source of truth for: captain/types/provider.ts → Captain (team member)
// Named Captain to match existing captain dashboard usage in TeamCaptains.tsx

export interface Captain {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
}
