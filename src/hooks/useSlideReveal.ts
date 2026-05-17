import { useRef, useState } from 'react';
import { Animated } from 'react-native';

export function useSlideReveal() {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const animations = useRef<Record<string, Animated.Value>>({});

  const getRevealAnim = (key: string) => {
    if (!animations.current[key]) {
      animations.current[key] = new Animated.Value(0);
    }
    return animations.current[key];
  };

  const toggleReveal = (key: string) => {
    const anim = getRevealAnim(key);
    if (revealedKey === key) {
      Animated.spring(anim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }).start();
      setRevealedKey(null);
    } else {
      if (revealedKey) {
        Animated.spring(getRevealAnim(revealedKey), {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 14,
        }).start();
      }
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }).start();
      setRevealedKey(key);
    }
  };

  return { revealedKey, getRevealAnim, toggleReveal };
}
