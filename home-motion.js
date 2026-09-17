(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sectionCharacters = Array.from(document.querySelectorAll('.home-section-character'))
  const heroCandidate = document.querySelector('.hero-human-wrap')
  const motionTargets = [...sectionCharacters, ...(heroCandidate ? [heroCandidate] : [])]
  if (!motionTargets.length || prefersReducedMotion.matches) return

  // Gentle mouse parallax on desktop complements the automatic floating animation.
  // It is deliberately disabled on touch devices so scrolling stays effortless.
  if (window.matchMedia('(pointer: fine)').matches) {
    let frame = null
    let pointer = { x: 0, y: 0 }
    const update = () => {
      frame = null
      const x = (pointer.x / window.innerWidth - 0.5)
      const y = (pointer.y / window.innerHeight - 0.5)
      motionTargets.forEach((target, index) => {
        const intensity = target === heroCandidate ? 11 : 4 + (index % 4) * 1.2
        target.style.setProperty('--character-x', `${(x * intensity).toFixed(1)}px`)
        target.style.setProperty('--character-y', `${(y * intensity).toFixed(1)}px`)
      })
    }
    const onMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY }
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', () => motionTargets.forEach((target) => {
      target.style.setProperty('--character-x', '0px')
      target.style.setProperty('--character-y', '0px')
    }))
  }

  // Add a small entrance reveal only when a character is close to the viewport.
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('character-in-view')
    observer.unobserve(entry.target)
  }), { rootMargin: '0px 0px -8%', threshold: 0.08 })
  motionTargets.forEach((target) => observer.observe(target))
})()
