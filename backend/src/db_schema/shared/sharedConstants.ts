export const ALL_TABLE_NAMES = {
  User: "User",
  Website: "Website",
  Check: "Check",
  CheckHourly: "CheckHourly",
  Incident: "Incident",
};
export const BLOCKED_HOSTNAMES = ["localhost", "metadata.google.internal"];
export const BLOCKED_HOSTNAME_ENDINGS = [".localhost", ".local", ".internal", ".home.arpa"];
export const BLOCKED_IPV4_RANGES: [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];
export const BLOCKED_IPV6_RANGES: [string, number][] = [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
];
export const IPV6_BRACKETS = /^\[|\]$/g;
export const TRAILING_DOT = /\.$/;
export const PRISMA_ERROR_NAME_START = "PrismaClient";
export const DRIVER_ADAPTER_ERROR_NAME = "DriverAdapterError";
