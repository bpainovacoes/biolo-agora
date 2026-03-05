import { User } from "../bioloTypes";

export interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
    phoneNumber: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  };
  savedWorkers?: string[];
  createdAt?: string;
}

export function mapClientToUI(client: ClientProfile): User {
  console.log("Destruturando", client)
  const name = `${client.firstName} ${client.lastName}`;
  return {
    id: client.id,
    name,
    email: client.user.email,
    phone: client.user.phoneNumber,
    avatar: client.firstName[0] + client.lastName[0],
    avatarColor: "#06b6d4",
    role: "client",
    status: client.user.status === "ACTIVE" ? "active"
          : client.user.status === "SUSPENDED" ? "suspended"
          : "blocked",
    savedWorkers: client.savedWorkers ?? [],
    createdAt: client.createdAt ?? new Date().toISOString(),
  };
}
