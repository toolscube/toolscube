"use client";

import { ConversionTracker } from "@/components/analytics/conversion-tracker";

interface ToolCompletionTrackerProps {
  toolName: string;
  category: string;
  isCompleted: boolean;
  conversionValue?: number;
  metadata?: {
    processingTime?: number;
    fileSize?: number;
    outputFormat?: string;
    inputFormat?: string;
    userActions?: number;
  };
}

export function ToolCompletionTracker({
  toolName,
  category, 
  isCompleted,
  conversionValue = 1,
  metadata = {}
}: ToolCompletionTrackerProps) {
  
  if (!isCompleted) {
    return null;
  }

  return (
    <ConversionTracker
      toolName={toolName}
      category={category}
      conversionValue={conversionValue}
      customData={{
        ...(metadata.processingTime && { processing_time: metadata.processingTime }),
        ...(metadata.fileSize && { file_size: metadata.fileSize }),
        ...(metadata.outputFormat && { output_format: metadata.outputFormat }),
        ...(metadata.inputFormat && { input_format: metadata.inputFormat }),
        ...(metadata.userActions && { user_actions: metadata.userActions }),
        completion_timestamp: Date.now(),
      }}
    />
  );
}