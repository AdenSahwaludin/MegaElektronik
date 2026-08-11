const SUCCESS_WAV = 'data:audio/wav;base64,UklGRtQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YbAEAACAyeO+cS0eTZzZ3KVVISlotuHNiD4dO4XL4bhsLCJTodnYn1IiLm654MmDOx9Bis3es2crJVil2dSZTiIyc7zexH45IUaPztuuYyspXqnZ0JRLIzd5v9y/eTckS5TP2KhfKixjrNjMj0glPH7B2rp0NidQmNDUo1sqMGmw2MeJRSZAg8PYtW81KlWc0NGeVys0brPXw4RDKEWHxNWwazQtW6DQzZhUKzlztdW+gEEqSozG06tnMzBgo9DJk1EsPXi307p7Py1PkMfQpmMzNGWnz8WPTi5BfLnRtXc+L1SUx82hYDM3aanPwYpML0aBu8+xcz0yWJjHyZxdNDturM29hUoxSoW8zaxvPDVdm8fGl1o0P3OuzLmBSDNOib3Kp2s8OGKex8KTVzVDd7DKtX1HNVONvsejaDw7ZqHGvo5VN0d7ssmweUY4V5C/xZ5lPD9rpMa7ilM4S3+0xqx1RTpclL/BmmI9Qm+mxLeGUTpPg7XEqHJFPWCXv76WXz1Gc6jDs4JQPFOHtcKkb0VAZJm+u5JdPkl3qsGvf08+V4q2v6BsRUNonL64jltATXurwKt7TkBbjba8nGlFRmyevbSKWUFRfqy+p3hNQ1+QtrmYZ0ZJcKC7sYZYQ1SBrbukdU1FY5O2t5RlRk1zorqtg1dFRIWuuaByTUhnlbWzkGNHUHejuKmAVkdch663nHBNS2qXtbCNYUlTeqS3pn1VSV+KrrSZbU5Obpm0rYpgSld9pbWjelVLY42usZVrTlFxmrKqhl9MWoCms593VU5mj62vkmlPVHScsaeDXk5dg6axnHVVUGqRrayPaFBXd52wpIFdUGGFpq6Yc1ZTbZKsqYxnUlp6nq6gfl1SZIimrJVxVlZwlKumiWZTXX2erJ18XVRniqapkm9XWHOVqqOGZVVgf5+qmnpdVmqLpaePblhbdZaooIRkV2OBn6iXeF1ZbY2kpI1tWV54l6edgWRZZoOeppR2XltwjqOhimxbYXqXpZt/ZFtphZ6jknVfXnKPop+Ia1xjfZijmH1kXWuHnqGPc2BgdZChnIVrXmZ/mKGVe2Vfboidn41yYWN3kZ+ag2tgaYCXn5N6ZWFwiZycinJiZXmRnpeBa2FrgpedkHlmY3OKm5qIcWNoe5GclIBrY26DlpuOeGdmdYuZl4ZxZWp9kZqSfmtlcISWmYt3aGh3i5iVhHFnbX6RmJB9bGhyhZWWiXZpanmMlpODcWhvgJCWjnxtanSGk5SIdmtte4yVkIFxanGBkJSLe25sdoeSkoZ2bG98i5OOgHJsc4KPkol7b254h5GQhHZucX2LkYx/cm51go6QiHpwcHqHj46DdnBzfoqPin5zcHeDjY6GenJye4eOi4J3cXV/io2IfnRyeYOLjIV6c3R8hoyJgXdzd4CJi4Z9dnR6g4qKg3p1dn2GioiAeHV5gYiJhX13dnyDiIiCe3d4foWIhn95d3qBhoeDfXh4fYOHhoF7eHp/hIaEf3p5fIGFhYJ9enp+goWEgHx6fH+DhIN/fHt9gYOEgX58fH6Bg4KAfXx9gIKCgX99fX6AgoKAf35+f4GBgYB+fn+AgIGAf39/f4CAgIB/f38='
const ERROR_WAV = 'data:audio/wav;base64,UklGRhQLAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YfAKAAAcJC02P0hQWWJqc3yEjZaep6+4wMnR2h8oMDlCSlNbZGx1fYaOlp+nr7jAyNHZIys0PERNVV1mbnZ+h4+Xn6evuMDI0NgmLjc/R09XX2dvd4CIkJefp6+3v8fP1yoyOkJKUVlhaXF5gYiQmKCnr7e/xs7VLTU9RExUW2NrcnqCiZGYoKevtr7FzdQwOD9HT1ZdZWx0e4OKkZmgp6+2vcTMLDQ7QkpRWF9nbnV8hIuSmaCnrrW8w8owNz5FTFNaYWhwd36Ei5KZoKeutbzCyTM6QUhPVlxjanF4f4WMk5mgp660u8HINj1ESlFYXmVscnmAho2TmqCnrbO6wMc5QEdNVFpgZ210eoCHjZOaoKass7m/xT1DSVBWXGJpb3V7gYeNlJqgpqyyuL7EQEZMUlheZGpwdnyCiI6Ump+lq7G3vD1DSU9UWmBmbHJ3fYOIjpSan6WqsLa7QEZLUVdcYmhtc3h+g4mOlJmfpKqvtLpDSU5UWV9kaW90eX+EiY+UmZ6kqa6zuEZMUVZbYWZrcHV6gIWKj5SZnqOorbK3SU5TWF1jaGxxdnuAhYqPlJidoqersLVMUVZbYGRpbnN3fIGGio+TmJ2hpqqvs09UWF1iZmtvdHh9gYaKj5OYnKClqa1OUlZbX2RobHF1eX6ChoqPk5ebn6OorFBVWV1hZmpucnZ6foKGio6SlmqCjptc2OT1CSlNbZGx0e4OKkZmfpKqwtru+xMzRLDQ8QUpTWF9nbnV8hIuSmaCnrrW8w8nN0S0zPD9HT1ZaYmdvd3+EipGZn6Sqr7S6wMfN0SwzPD9HT1ZaYmdvcHWBiJGYoKeutbvBxcrO0i0zPD9HT1ZaYmdvcHWBiJGYoKeutbvBxcrP0iwzPD9HT1ZaYmdvcHWBiJGYoKeutbvBxcrP0iw0PD9HT1ZaYmdvcHWBiJGYoKeutbvBxcrP0iw0PD9HT1ZaYmdvcHWBiJGXoKeutbvBxcrP0iw0PD9HT1ZaYmdvcHWBiJGXoKeutbvBxcrP0yw0PT9HT1ZaYmdvcHWBiJGXoKeutbvBxcrP0yw0PT9HT1ZaYmdvcHWBiJGXoKeutbvBxcrP0y00PT9HT1ZaYmdvcHWBiJGXoKeutbvBxsnP0y00PT9HT1ZaYmdvcHWBiJGXoKeutbvBxsnP0y00PT9HT1ZaYmdvcHWBiJGXoKeutbvBxsnP0y00PT9HTFNaYWhwdnyCiJGYoKeutbvBxsnP0y00PT9HTFNaYWhwdnyCiJGXoKeutbvBxsnQ0y00PT9HTFNaYWhwdnyCiJGXoKeutbvBxsnQ0y00PT9HTFNaYWhwdnyCiJGXoKeutbvBxsnQ0y00PT9HTFNaYWhwdnyCiJGXoKeutbvBxsnQ0y00PT9GS1BXW2Jpb3V7gYeNkpqgpaqvs7i/w8jOMTQ6QUhPVlxjanF4f4WMk5mgp660u8HINj1ESlFYXmVscnmAho2TmqCnrbO6wMc5QEdNVFpgZ210eoCHjZOaoKass7m/xD1DSVBWXGJpb3V7gYeNlJqgpqyyuL7EQEZMUlheZGpwdnyCiI6Ump+lq7G3vEBGTFFWW2Blam90eX6DiI2Sl5yhpquwtbq/xMnN0tcoLTI3PEFGS1BVWl9kaW5zeHyBhouQlZqeo6itsra7wMXJztMoLDI3PUJHTVJXXWJnbXJ3fYKHjJKXnKGnrLG2vMHGy9DW2yInLTI3PEJHTFFXXGFma3B2e4CFio+Vmp+kqa6zuL3Cx8zR1tsiJSsyNz1CSU1TVlhbX2Nnaw=='

let sharedAudioCtx: AudioContext | null = null
let successAudioEl: HTMLAudioElement | null = null
let errorAudioEl: HTMLAudioElement | null = null

function ensureAudioContext(userInitiated = false): AudioContext | null {
  if (!process.client) return null
  if (!sharedAudioCtx && userInitiated) {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (Ctor) {
        sharedAudioCtx = new Ctor()
      }
    } catch (_) {}
  }
  return sharedAudioCtx
}

function ensureAudioElements() {
  if (!process.client) return
  if (!successAudioEl) {
    try {
      successAudioEl = new Audio(SUCCESS_WAV)
      successAudioEl.preload = 'auto'
      successAudioEl.volume = 1.0
    } catch (_) {}
  }
  if (!errorAudioEl) {
    try {
      errorAudioEl = new Audio(ERROR_WAV)
      errorAudioEl.preload = 'auto'
      errorAudioEl.volume = 1.0
    } catch (_) {}
  }
}

function unlockAudio() {
  if (!process.client) return
  const ctx = ensureAudioContext(true)
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  ensureAudioElements()
}

if (process.client) {
  const handleUserInteraction = () => {
    unlockAudio()
  }
  window.addEventListener('click', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('pointerdown', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('keydown', handleUserInteraction, { capture: true, passive: true })
  window.addEventListener('touchstart', handleUserInteraction, { capture: true, passive: true })
}

function playFallbackAudio(type: 'success' | 'error') {
  if (!process.client) return
  try {
    ensureAudioElements()
    const audio = type === 'success' ? successAudioEl : errorAudioEl
    if (audio) {
      audio.currentTime = 0
      const p = audio.play()
      if (p && typeof p.then === 'function') {
        p.catch(() => {})
      }
    }
  } catch (_) {}
}

export function useAudioBeep() {
  function playSuccessBeep() {
    if (!process.client) return
    unlockAudio()

    try {
      const ctx = ensureAudioContext(true)
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1046.5, now) // High C (instant beep)

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.8, now + 0.003)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.15)
      }
    } catch (_) {}

    // Fallback HTML5 Audio playback for maximum compatibility
    playFallbackAudio('success')
  }

  function playErrorBeep() {
    if (!process.client) return
    unlockAudio()

    try {
      const ctx = ensureAudioContext(true)
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }
        const now = ctx.currentTime
        for (const [freq, offset, dur] of [[320, 0, 0.15], [200, 0.16, 0.22]] as const) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(freq, now + offset)

          gain.gain.setValueAtTime(0, now + offset)
          gain.gain.linearRampToValueAtTime(0.8, now + offset + 0.003)
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(now + offset)
          osc.stop(now + offset + dur)
        }
      }
    } catch (_) {}

    // Fallback HTML5 Audio element
    playFallbackAudio('error')
  }

  return {
    unlockAudio,
    playSuccessBeep,
    playErrorBeep
  }
}
