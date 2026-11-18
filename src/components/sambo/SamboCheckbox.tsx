import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";
import { CheckboxCircleIcon, CheckboxFilledIcon } from "./icons";

/**
 * The app's own checkbox: an empty purple ring when unchecked, a solid purple
 * disc when checked. Keeps Radix's checkbox semantics (role, aria-checked,
 * keyboard and label association) and only replaces the drawing.
 * Target size meets WCAG 2.2 2.5.8 (at least 24x24px).
 */
const SamboCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "relative grid h-6 w-6 shrink-0 cursor-pointer place-content-center rounded-full text-task-ink",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxCircleIcon className="h-5 w-5" />
    <CheckboxPrimitive.Indicator className="absolute inset-0 grid place-content-center">
      <CheckboxFilledIcon className="h-5 w-5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
SamboCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { SamboCheckbox };
