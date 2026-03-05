import { User, Worker } from "../bioloTypes"

export function mapWorkerToUI(worker: Worker): User {
  const name = `${worker.firstName} ${worker.lastName}`
  return {
    id: worker.id,
    name,

    email: worker.user.email,
    phone: worker.user.phoneNumber,

    avatar: worker.firstName[0] + worker.lastName[0],
    avatarColor: "#3b82f6",

    profession: worker.categories?.[0]?.label ?? "Profissional",

    bio: worker.bio,

    rating: worker.averageRating,

    totalJobs: worker.totalJobs,

    pricePerHour: `${worker.pricePerHour.toLocaleString()} Kz/h`,
    pricePerHourValue: worker.pricePerHour,

    available: worker.availability === "AVAILABLE",

    verified: worker.isVerified,

    location: {
      lat: worker.latitude,
      lng: worker.longitude,
      area: "Rangel" // pode vir de outro campo futuramente
    },

    serviceRadius: worker.serviceRadius,

    skills: worker.categories?.map(c => c.label) ?? [],

    role: "worker",
    status: "active",
    createdAt: worker?.createdAt ?? new Date().toISOString()
  }
}