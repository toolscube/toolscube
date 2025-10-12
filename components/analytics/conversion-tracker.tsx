"use client";

import { useEffect } from "react";
import { gtmPush } from "@/lib/gtm";

interface ConversionTrackerProps {
  toolName: string;
  category: string;
  conversionValue?: number;
  customData?: Record<string, string | number>;
}

export function ConversionTracker({ 
  toolName, 
  category, 
  conversionValue = 1,
  customData = {}
}: ConversionTrackerProps) {
  
  useEffect(() => {
    // Track as Google Ads conversion
    gtmPush({
      event: "conversion",
      google_conversion_id: "GTM-KRV3TG75",
      google_conversion_label: `${toolName.toLowerCase().replace(/\s+/g, '_')}_conversion`,
      google_conversion_value: conversionValue,
      google_conversion_currency: "USD",
      tool_name: toolName,
      tool_category: category,
      ...customData,
    });

    // Also track as enhanced ecommerce purchase
    gtmPush({
      event: "purchase",
      ecommerce: {
        transaction_id: `${toolName}_${Date.now()}`,
        value: conversionValue,
        currency: "USD",
        items: [{
          item_id: toolName.toLowerCase().replace(/\s+/g, '_'),
          item_name: toolName,
          item_category: category,
          item_brand: "Tools Cube",
          price: conversionValue,
          quantity: 1,
        }]
      }
    });

    // Track for Facebook/Meta Ads
    gtmPush({
      event: "CompleteRegistration", // Facebook recognizes this
      content_name: toolName,
      content_category: category,
      value: conversionValue,
      currency: "USD",
    });

  }, [toolName, category, conversionValue, customData]);

  return null;
}