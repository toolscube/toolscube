"use client";

import { useEffect, useRef } from "react";
import { trackUserEngagement } from "@/lib/gtm";

interface UserBehaviorTrackerProps {
  toolName: string;
}

export function UserBehaviorTracker({ toolName }: UserBehaviorTrackerProps) {
  const startTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const interactions = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > scrollDepth.current) {
        scrollDepth.current = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          trackUserEngagement(toolName, "scroll_depth", scrollPercent);
        }
      }
    };

    const handleInteraction = () => {
      interactions.current++;
      
      // Track engagement milestones
      if ([5, 10, 20, 50].includes(interactions.current)) {
        trackUserEngagement(toolName, "interaction_count", interactions.current);
      }
    };

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      
      // Track time spent (in seconds)
      trackUserEngagement(toolName, "time_spent", timeSpent);
      
      // Track engagement quality based on time and interactions
      const engagementScore = Math.min(100, timeSpent + interactions.current * 2);
      trackUserEngagement(toolName, "engagement_score", engagementScore);
    };

    // Add event listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [toolName]);

  return null;
}