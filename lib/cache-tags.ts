export const TAGS = {
  me:              "me",
  professionals:   "professionals",
  serviceRequest:  (id: string) => `service-request-${id}`,
  activeRequest:   "active-request",
  chatMessages:    (requestId: string) => `chat-${requestId}`,
  workerHistory:   "worker-history",
  adminStats:      "admin-stats",
  adminUsers:      "admin-users",
} as const;
