import { useEffect } from "react";

export function useBackgroundSync() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-pokemon-data");
      });
    }
  }, []);
}
