self.addEventListener('push', event => {
    const options = {
      body: event.data.text(),
      icon: '/icon.png',  // Use um ícone adequado
      badge: '/badge.png' // Opcional, ícone de "badge" (miniatura)
    };
  
    event.waitUntil(
      self.registration.showNotification('Nova Notificação', options)
    );
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close(); // Fecha a notificação ao clicar
  
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (let client of clientList) {
          if ("focus" in client) {
            return client.focus(); // Apenas foca na aba aberta
          }
        }
      })
    );
  });
  
  

  
  