// Google Tag Manager utility functions for tracking custom events

type DataLayerEvent = Record<string, string | number | boolean | undefined>;

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
