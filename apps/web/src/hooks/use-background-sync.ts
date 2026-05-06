import { useEffect } from "react";

interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: SyncManager;
}

export function useBackgroundSync() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as ServiceWorkerRegistrationWithSync).sync.register("sync-pokemon-data");
      });
    }
  }, []);
}
