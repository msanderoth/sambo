import { Building2, Car, CalendarHeart, Plane, Tag } from "lucide-react";
export function CategoryIcon({ category, className }: { category?: string; className?: string }) {
  const I = category === "Hem" ? Building2 : category === "Bil" ? Car : category === "Event" ? CalendarHeart : category === "Resa" ? Plane : Tag;
  return <I className={className} />;
}
