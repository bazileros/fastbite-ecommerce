"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  id: string;
  label?: string;
  description?: string;
  value?: string | null;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
  allowRemoval?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 4;

export function ImageUploadField({
  id,
  label,
  description,
  value,
  onFileChange,
  disabled,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  className,
  allowRemoval = true,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [error, setError] = useState<string | null>(null);

  // Sync preview with external value when no local file is selected
  useEffect(() => {
    if (!objectUrl) {
      setPreview(value ?? null);
    }
  }, [value, objectUrl]);

  // Cleanup generated object URLs when component unmounts or objectUrl changes
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const sizeLimitBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(null);
      setPreview(null);
      setError(null);
      onFileChange(null, null);
      return;
    }

    if (file.size > sizeLimitBytes) {
      setError(`Image must be smaller than ${maxSizeMB}MB`);
      fileInputRef.current?.setCustomValidity(`Image must be smaller than ${maxSizeMB}MB`);
      fileInputRef.current?.reportValidity();
      onFileChange(null, null);
      return;
    }

    setError(null);
    fileInputRef.current?.setCustomValidity("");

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setObjectUrl(nextObjectUrl);
    setPreview(nextObjectUrl);
    onFileChange(file, nextObjectUrl);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (!allowRemoval) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setObjectUrl(null);
    setPreview(null);
    setError(null);
    onFileChange(null, null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        className={cn(
          "group relative flex flex-col gap-3 bg-muted/10 p-4 border border-muted-foreground/40 hover:border-primary/60 border-dashed rounded-lg overflow-hidden transition",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {preview ? (
          <div className="relative bg-muted rounded-md w-full h-48 overflow-hidden">
            <Image
              src={preview}
              alt="Selected preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
            <div className="top-3 right-3 absolute flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={triggerFileDialog}
                disabled={disabled}
              >
                <Upload className="mr-1 w-4 h-4" />
                Replace
              </Button>
              {allowRemoval && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="hover:bg-destructive/10 hover:text-destructive"
                  disabled={disabled}
                >
                  <X className="mr-1 w-4 h-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerFileDialog}
            disabled={disabled}
            className="flex flex-col justify-center items-center gap-3 bg-background py-10 border border-muted-foreground/40 hover:border-primary/60 border-dashed rounded-md text-muted-foreground hover:text-primary text-sm text-center transition"
          >
            <div className="bg-muted p-3 rounded-full">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Upload image</p>
              <p className="text-xs">PNG, JPG up to {maxSizeMB}MB</p>
            </div>
          </button>
        )}
        <Input
          id={id}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={onInputChange}
        />
      </div>
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
