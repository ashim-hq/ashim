import { useConnectionMonitor } from "@/hooks/use-connection-monitor";
import { ConnectionBanner } from "./connection-banner";

export function ConnectionMonitor() {
  useConnectionMonitor();
  return <ConnectionBanner />;
}
