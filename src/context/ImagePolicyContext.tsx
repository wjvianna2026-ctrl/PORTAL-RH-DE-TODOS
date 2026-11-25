import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_IMAGE_SETTINGS } from '../data/initialPortalData';
import {
  ImageAdaptationSettings,
  ImageBannerRatio,
  ImageQualityPreset,
} from '../types/portal';

const ImagePolicyContext = createContext<ImageAdaptationSettings>(DEFAULT_IMAGE_SETTINGS);

export function mergeImageSettings(
  partial?: Partial<ImageAdaptationSettings> | null
): ImageAdaptationSettings {
  if (!partial) return DEFAULT_IMAGE_SETTINGS;
  return {
    bannerAspectRatio:
      partial.bannerAspectRatio === '4:3' || partial.bannerAspectRatio === '21:9'
        ? partial.bannerAspectRatio
        : '16:9',
    fitMode:
      partial.fitMode === 'smart-crop' ||
      partial.fitMode === 'adapt-contain' ||
      partial.fitMode === 'blur-backdrop'
        ? partial.fitMode
        : DEFAULT_IMAGE_SETTINGS.fitMode,
    qualityPreset:
      partial.qualityPreset === 'high' ||
      partial.qualityPreset === 'compact' ||
      partial.qualityPreset === 'balanced'
        ? partial.qualityPreset
        : DEFAULT_IMAGE_SETTINGS.qualityPreset,
    roundedStyle:
      partial.roundedStyle === 'md' ||
      partial.roundedStyle === 'xl' ||
      partial.roundedStyle === 'lg'
        ? partial.roundedStyle
        : DEFAULT_IMAGE_SETTINGS.roundedStyle,
    goldBorder:
      typeof partial.goldBorder === 'boolean'
        ? partial.goldBorder
        : DEFAULT_IMAGE_SETTINGS.goldBorder,
    autoAdaptUploads:
      typeof partial.autoAdaptUploads === 'boolean'
        ? partial.autoAdaptUploads
        : DEFAULT_IMAGE_SETTINGS.autoAdaptUploads,
  };
}

export const ImagePolicyProvider: React.FC<{
  settings?: Partial<ImageAdaptationSettings> | null;
  children: React.ReactNode;
}> = ({ settings, children }) => {
  const merged = useMemo(() => mergeImageSettings(settings), [settings]);
  return <ImagePolicyContext.Provider value={merged}>{children}</ImagePolicyContext.Provider>;
};

export function useImagePolicy(): ImageAdaptationSettings {
  return useContext(ImagePolicyContext);
}

export function getExportSpec(
  requestedAspect: '16:9' | '1:1',
  settings: ImageAdaptationSettings
): {
  width: number;
  height: number;
  quality: number;
  label: string;
} {
  const qualityMap: Record<ImageQualityPreset, number> = {
    high: 0.92,
    balanced: 0.86,
    compact: 0.76,
  };
  const quality = qualityMap[settings.qualityPreset] ?? 0.86;

  if (requestedAspect === '1:1') {
    const size =
      settings.qualityPreset === 'high' ? 640 : settings.qualityPreset === 'compact' ? 400 : 512;
    return {
      width: size,
      height: size,
      quality,
      label: `1:1 (${size}×${size}px)`,
    };
  }

  const baseWidthMap: Record<ImageQualityPreset, number> = {
    high: 1600,
    balanced: 1280,
    compact: 960,
  };
  const width = baseWidthMap[settings.qualityPreset] ?? 1280;

  const ratioHeight = (ratio: ImageBannerRatio, w: number) => {
    if (ratio === '4:3') return Math.round((w * 3) / 4);
    if (ratio === '21:9') return Math.round((w * 9) / 21);
    return Math.round((w * 9) / 16);
  };

  const height = ratioHeight(settings.bannerAspectRatio, width);
  return {
    width,
    height,
    quality,
    label: `${settings.bannerAspectRatio} (${width}×${height}px)`,
  };
}
