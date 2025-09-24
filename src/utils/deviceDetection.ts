/**
 * Device detection utilities for iOS and touch-specific optimizations
 */

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (isMobile()) {
    return window.innerWidth < 768 ? 'mobile' : 'tablet';
  }
  return 'desktop';
};

export const getTouchCapabilities = () => {
  return {
    isIOS: isIOS(),
    isTouchDevice: isTouchDevice(),
    isMobile: isMobile(),
    deviceType: getDeviceType(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasPointerEvents: 'onpointerdown' in window,
    hasTouchEvents: 'ontouchstart' in window
  };
};
