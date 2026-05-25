import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from './Loader';

interface PreviewFrameProps {
  previewUrl: string | null;
  previewError: string | null;
  isSettingUp: boolean;
}

export function PreviewFrame({ previewUrl, previewError, isSettingUp }: PreviewFrameProps) {
  if (previewError) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p className="text-sm text-muted-foreground">{previewError}</p>
      </div>
    );
  }

  if (previewUrl) {
    return <iframe width="100%" height="100%" src={previewUrl} title="App preview" />;
  }

  if (isSettingUp) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center space-y-6 w-full max-w-md px-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 animate-pulse" />
            <div className="relative">
              <Loader />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Installing dependencies and starting dev server...</p>
            <div className="w-full bg-secondary/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{ width: ['0%', '70%', '90%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <p className="text-sm text-muted-foreground">Preview not available</p>
    </div>
  );
}
