"use client";

import { AppState, User, PROFESSIONALS, CATEGORIES, ClientStep } from "@/lib/bioloTypes";
import ClientDashboardHome from "./ClientDashboardHome";
import SearchScreen from "./SearchScreen";
import ProfessionalProfileScreen from "./ProfessionalProfileScreen";
import WaitingScreen from "./WaitingScreen";
import ChatNegotiateScreen from "./ChatNegotiateScreen";
import InProgressScreen from "./InProgressScreen";
import RateScreen from "./RateScreen";
import DoneScreen from "./DoneScreen";
import DeclinedScreen from "./DeclinedScreen";
import ConfirmServiceScreen from "./ConfirmServiceScreen";

interface Props {
  user: User;
  state: AppState;
  update: (p: Partial<AppState>) => void;
  onLogout: () => void;
}

export default function ClientApp({ user, state, update, onLogout }: Props) {
  const go = (step: ClientStep) => update({ clientStep: step });

  switch (state.clientStep) {
    case "dashboard":
      return <ClientDashboardHome user={user} onSearch={() => go("search")} onLogout={onLogout} />;
    case "search":
    case "filter":
    case "professional-list":
      return (
        <SearchScreen
          user={user}
          onBack={() => go("dashboard")}
          onSelectWorker={(w) => { update({ selectedWorker: w, clientStep: "professional-profile" }); }}
          userLocation={state.userLocation}
          onLocationFound={(loc) => update({ userLocation: loc })}
        />
      );
    case "professional-profile":
      return (
        <ProfessionalProfileScreen
          user={user}
          worker={state.selectedWorker!}
          onBack={() => go("professional-list")}
          onSendRequest={() => go("waiting")}
        />
      );
    case "waiting":
      return (
        <WaitingScreen
          worker={state.selectedWorker!}
          onAccepted={() => go("chat-negotiate")}
          onDeclined={() => go("declined")}
        />
      );
    case "declined":
      return <DeclinedScreen onBack={() => go("search")} />;
    case "chat-negotiate":
      return (
        <ChatNegotiateScreen
          user={user}
          worker={state.selectedWorker!}
          messages={state.chatMessages}
          onAddMessage={(msg) => update({ chatMessages: [...state.chatMessages, msg] })}
          onConfirm={() => go("confirm-service")}
        />
      );
    case "confirm-service":
      return (
        <ConfirmServiceScreen
          worker={state.selectedWorker!}
          onConfirm={() => go("in-progress")}
          onBack={() => go("chat-negotiate")}
        />
      );
    case "in-progress":
      return <InProgressScreen worker={state.selectedWorker!} onComplete={() => go("completed")} serviceProgress={state.serviceProgress} />;
    case "completed":
      return <RateScreen worker={state.selectedWorker!} onRate={(r) => { update({ givenRating: r, clientStep: "done" }); }} />;
    case "done":
      return <DoneScreen worker={state.selectedWorker!} rating={state.givenRating} onHome={() => go("dashboard")} />;
    default:
      return <ClientDashboardHome user={user} onSearch={() => go("search")} onLogout={onLogout} />;
  }
}
