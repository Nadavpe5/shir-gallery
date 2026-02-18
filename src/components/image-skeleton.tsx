"use client";

interface ImageSkeletonProps {
  aspectRatio?: string;
}

export function ImageSkeleton({
  aspectRatio = "aspect-[3/4]",
}: ImageSkeletonProps) {
  return (
    <div
      className={`${aspectRatio} rounded-sm bg-secondary animate-pulse`}
    />
  );
}
