"use client";

import type React from "react";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      //   theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#2f3136",
          "--normal-text": "#dcddde",
          "--normal-border": "#202225",
          "--success-bg": "#3ba55d",
          "--success-text": "#ffffff",
          "--success-border": "#2d7d46",
          "--error-bg": "#ed4245",
          "--error-text": "#ffffff",
          "--error-border": "#c03537",
          "--warning-bg": "#faa61a",
          "--warning-text": "#ffffff",
          "--warning-border": "#d8890e",
          "--info-bg": "#5865f2",
          "--info-text": "#ffffff",
          "--info-border": "#4752c4",
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
