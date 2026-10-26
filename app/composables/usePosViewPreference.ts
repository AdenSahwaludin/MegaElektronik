import { computed } from 'vue';

export type PosViewMode = 'classic' | 'new';

export const POS_VIEW_COOKIE_KEY = 'mega_pos_view_mode';

export function usePosViewPreference() {
  const cookie = useCookie<PosViewMode>(POS_VIEW_COOKIE_KEY, {
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
    path: '/',
    sameSite: 'lax',
    default: () => 'classic',
  });

  const mode = computed<PosViewMode>({
    get: () => cookie.value || 'classic',
    set: (val: PosViewMode) => {
      cookie.value = val;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(POS_VIEW_COOKIE_KEY, val);
        } catch (e) {
          // ignore
        }
      }
    },
  });

  const setMode = (newMode: PosViewMode) => {
    mode.value = newMode;
  };

  const targetPath = computed(() => (mode.value === 'new' ? '/pos-new' : '/'));

  // Hydrate cookie dari localStorage jika cookie kosong di client-side
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(POS_VIEW_COOKIE_KEY) as PosViewMode | null;
      if (stored && (stored === 'classic' || stored === 'new') && !cookie.value) {
        cookie.value = stored;
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    mode,
    setMode,
    targetPath,
  };
}
