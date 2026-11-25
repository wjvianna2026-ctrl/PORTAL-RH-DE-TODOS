import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useImagePolicy } from '../context/ImagePolicyContext';
import { ImageBannerRatio, ImageFitMode } from '../types/portal';

interface StandardizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: '16:9' | '1:1' | '4:3' | '21:9';
  rounded?: 'md' | 'lg' | 'xl' | 'full';
  goldBorder?: boolean;
  fitModeOverride?: ImageFitMode;
  ratioOverride?: ImageBannerRatio | '1:1';
  lockAspectRatio?: boolean;
  className?: string;
}

export const StandardizedImage: React.FC<StandardizedImageProps> = ({
  src,
  alt,
  aspectRatio = '16:9',
  rounded,
  goldBorder,
  fitModeOverride,
  ratioOverride,
  lockAspectRatio = false,
  className = '',
}) => {
  const policy = useImagePolicy();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const effectiveRatio =
    ratioOverride ||
    (aspectRatio === '1:1'
      ? '1:1'
      : lockAspectRatio
        ? aspectRatio
        : aspectRatio === '16:9'
          ? policy.bannerAspectRatio
          : aspectRatio);

  const ratioClass =
    effectiveRatio === '1:1'
      ? 'aspect-square'
      : effectiveRatio === '4:3'
        ? 'aspect-[4/3]'
        : effectiveRatio === '21:9'
          ? 'aspect-[21/9]'
          : 'aspect-video';

  const effectiveRounded = rounded === 'full' ? 'full' : rounded || policy.roundedStyle || 'lg';
  const radiusClass =
    effectiveRounded === 'full'
      ? 'rounded-full'
      : effectiveRounded === 'xl'
        ? 'rounded-xl'
        : effectiveRounded === 'md'
          ? 'rounded-md'
          : 'rounded-lg';

  const showGoldBorder = goldBorder !== undefined ? goldBorder : policy.goldBorder;
  const borderClass = showGoldBorder ? 'border border-[#C5A467]/45' : '';

  // Avatars (1:1 rounded-full) always fill cleanly, while banners/covers follow the global adaptation mode
  const effectiveFitMode: ImageFitMode =
    fitModeOverride || (effectiveRatio === '1:1' && effectiveRounded === 'full' ? 'smart-crop' : policy.fitMode);

  return (
    <div
      className={`relative overflow-hidden bg-[#11382B] ${ratioClass} ${radiusClass} ${borderClass} ${className}`}
    >
      {!hasError && src ? (
        effectiveFitMode === 'blur-backdrop' ? (
          <>
            <img
              src={src}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center scale-110 blur-xl opacity-45 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-[#11382B]/25 pointer-events-none" />
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setHasError(true)}
              className="relative z-10 w-full h-full object-contain object-center transition-transform duration-300"
            />
          </>
        ) : effectiveFitMode === 'adapt-contain' ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain object-center bg-[#11382B]/95 transition-transform duration-300"
          />
        ) : (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300"
          />
        )
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#11382B] to-[#1C2421] text-[#D8BC83] p-4 text-center">
          <Building2 className="w-7 h-7 mb-1.5 opacity-80" />
          <span className="text-[11px] font-medium tracking-wide line-clamp-2 opacity-90">{alt}</span>
        </div>
      )}
    </div>
  );
};
