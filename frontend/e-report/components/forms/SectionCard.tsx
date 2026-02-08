"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isEnabled: boolean;
  onToggle: () => void;
  disabledPlaceholder?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "applicant" | "defendant" | "witness" | "forms";
}

const VARIANT_STYLES = {
  default: {
    disabled: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
    enabled: "bg-white dark:bg-gray-800 border-accent",
    icon: "text-gray-500",
  },
  applicant: {
    disabled: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    enabled: "bg-white dark:bg-gray-800 border-blue-500",
    icon: "text-blue-500",
  },
  defendant: {
    disabled: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    enabled: "bg-white dark:bg-gray-800 border-red-500",
    icon: "text-red-500",
  },
  witness: {
    disabled: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    enabled: "bg-white dark:bg-gray-800 border-green-500",
    icon: "text-green-500",
  },
  forms: {
    disabled: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
    enabled: "bg-white dark:bg-gray-800 border-purple-500",
    icon: "text-purple-500",
  },
};

export function SectionCard({
  title,
  description,
  icon,
  isEnabled,
  onToggle,
  disabledPlaceholder = "Click to enable",
  children,
  className,
  variant = "default",
}: SectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
        isEnabled ? styles.enabled : styles.disabled,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header - Always Visible */}
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer transition-colors",
          !isEnabled && isHovered && "bg-gray-100 dark:bg-gray-800"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              isEnabled
                ? "bg-primary/10 text-primary"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
            )}
          >
            {icon || (isEnabled ? <Unlock size={20} /> : <Lock size={20} />)}
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
            {!isEnabled && isHovered && (
              <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                {disabledPlaceholder}
              </p>
            )}
          </div>
        </div>

        {/* Toggle Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-transform",
            isEnabled && "bg-gray-100 dark:bg-gray-700"
          )}
        >
          {isEnabled ? (
            isHovered ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Content - Only visible when enabled */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isEnabled
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );
}

export default SectionCard;

