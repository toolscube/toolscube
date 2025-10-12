// Google Tag Manager utility functions for tracking custom events

// biome-ignore lint/suspicious/noExplicitAny: GTM dataLayer requires flexible typing
type DataLayerEvent = Record<string, any>;

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

export function gtmPush(data: DataLayerEvent) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(data);
  }
}

// Common tracking events for tools
export function trackToolUsage(toolName: string, category: string) {
  gtmPush({
    event: "tool_usage",
    tool_name: toolName,
    tool_category: category,
  });
}

export function trackToolConversion(toolName: string, conversionType: string) {
  gtmPush({
    event: "tool_conversion",
    tool_name: toolName,
    conversion_type: conversionType,
  });
}

export function trackFileUpload(toolName: string, fileType: string, fileSize?: number) {
  gtmPush({
    event: "file_upload",
    tool_name: toolName,
    file_type: fileType,
    file_size: fileSize,
  });
}

export function trackDownload(toolName: string, downloadType: string) {
  gtmPush({
    event: "download",
    tool_name: toolName,
    download_type: downloadType,
  });
}

// Enhanced tracking for better ad optimization
export function trackPageView(toolName: string, category: string) {
  gtmPush({
    event: "page_view",
    page_title: toolName,
    page_category: category,
    content_group1: category,
    content_group2: toolName,
  });
}

export function trackUserEngagement(toolName: string, action: string, value?: number) {
  gtmPush({
    event: "user_engagement",
    tool_name: toolName,
    engagement_action: action,
    engagement_value: value,
    timestamp: Date.now(),
  });
}

export function trackConversionValue(toolName: string, category: string, value = 1) {
  gtmPush({
    event: "conversion_event",
    tool_name: toolName,
    tool_category: category,
    conversion_value: value,
    currency: "USD",
  });
}

export function trackUserJourney(fromTool: string, toTool: string) {
  gtmPush({
    event: "user_journey",
    from_tool: fromTool,
    to_tool: toTool,
    navigation_type: "tool_to_tool",
  });
}

export function trackFeatureUsage(toolName: string, featureName: string, featureValue?: string | number) {
  gtmPush({
    event: "feature_usage",
    tool_name: toolName,
    feature_name: featureName,
    feature_value: featureValue,
  });
}

export function trackProcessingTime(toolName: string, operationType: string, timeMs: number) {
  gtmPush({
    event: "processing_performance",
    tool_name: toolName,
    operation_type: operationType,
    processing_time_ms: timeMs,
    performance_category: timeMs < 1000 ? "fast" : timeMs < 5000 ? "medium" : "slow",
  });
}

export function trackError(toolName: string, errorType: string, errorMessage?: string) {
  gtmPush({
    event: "tool_error",
    tool_name: toolName,
    error_type: errorType,
    error_message: errorMessage?.substring(0, 100), // Limit error message length
  });
}

export function trackSocialShare(toolName: string, platform: string) {
  gtmPush({
    event: "social_share",
    tool_name: toolName,
    share_platform: platform,
    content_type: "tool_result",
  });
}

// E-commerce style tracking for better conversion data
export function trackToolCompletion(toolName: string, category: string, valueData?: {
  fileSize?: number;
  processingTime?: number;
  outputFormat?: string;
  inputFormat?: string;
}) {
  gtmPush({
    event: "purchase", // Google Ads recognizes this as a conversion
    transaction_id: `${toolName}_${Date.now()}`,
    item_name: toolName,
    item_category: category,
    item_brand: "Tools Cube",
    value: 1,
    currency: "USD",
    file_size: valueData?.fileSize,
    processing_time: valueData?.processingTime,
    output_format: valueData?.outputFormat,
    input_format: valueData?.inputFormat,
  });
}
