// Force unregister all old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🗑️ Unregistering all old service workers...');
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        console.log('✅ Unregistered:', success);
      });
    }
  });
  
  // Clear all caches
  caches.keys().then(function(names) {
    console.log('🗑️ Deleting all caches...');
    for (let name of names) {
      caches.delete(name);
      console.log('✅ Deleted cache:', name);
    }
  });
}

console.log('✅ Cleanup complete - Please refresh the page');
