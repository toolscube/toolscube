"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/gtm";

interface ToolPageTrackerProps {
  toolName: string;
  category: string;
}

export function ToolPageTracker({ toolName, category }: ToolPageTrackerProps) {
  useEffect(() => {
    // Track page view when component mounts
    trackPageView(toolName, category);
  }, [toolName, category]);

  return null; // This component doesn't render anything
}