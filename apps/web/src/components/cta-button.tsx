"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "white";
  eventName: string;
  eventProps?: Record<string, any>;
  className?: string;
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  eventName,
  eventProps,
  className = "",
}: CTAButtonProps) {
  const baseClasses = "px-8 py-4 rounded-lg font-semibold text-lg transition-colors";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
    white: "bg-white text-blue-600 rounded-lg hover:bg-gray-100",
  };

  // Override classes if custom className provided (for special cases like white text on gradient)
  const finalClasses = className 
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${variantClasses[variant]}`;

  const handleClick = () => {
    trackEvent(eventName, eventProps || {});
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={finalClasses}
    >
      {children}
    </Link>
  );
}

