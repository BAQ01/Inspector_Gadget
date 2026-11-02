let reloadStarted = false
const hadController = Boolean(navigator.serviceWorker?.controller)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloadStarted) return
    reloadStarted = true
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations
          .filter((registration) => registration.scope.includes('/inspector/'))
          .map((registration) => registration.update()),
      )
    } catch (error) {
      console.warn('Controle op een nieuwe appversie is mislukt.', error)
    }
  })
}
