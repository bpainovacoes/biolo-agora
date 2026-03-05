"use client";

import { AppState, User, WorkerStep } from "@/lib/bioloTypes";
import WorkerDashboardHome from "./WorkerDashboardHome";
import CompleteProfileScreen from "./CompleteProfileScreen";
import SetLocationScreen from "./SetLocationScreen";
import AvailableScreen from "./AvailableScreen";
import IncomingRequestScreen from "./IncomingRequestScreen";
import WorkerChatScreen from "./WorkerChatScreen";
import WorkerInProgressScreen from "./WorkerInProgressScreen";
import WorkerFinalizeScreen from "./WorkerFinalizeScreen";
import WorkerCommissionScreen from "./WorkerCommissionScreen";
import WorkerHistoryScreen from "./WorkerHistoryScreen";

interface Props {
  user: User;
  state: AppState;
  update: (p: Partial<AppState>) => void;
  onLogout: () => void;
}

export default function WorkerApp({ user, state, update, onLogout }: Props) {
  const go = (step: WorkerStep) => update({ workerStep: step });

  switch (state.workerStep) {
    case "dashboard":
      return <WorkerDashboardHome user={user} onStart={() => go("complete-profile")} onHistory={() => go("history")} onLogout={onLogout} />;
    case "complete-profile":
      return <CompleteProfileScreen user={user} onNext={() => go("set-location")} />;
    case "set-location":
      return <SetLocationScreen onNext={(loc) => { update({ userLocation: loc }); go("available"); }} />;
    case "available":
      return <AvailableScreen user={user} onRequest={() => go("incoming-request")} />;
    case "incoming-request":
      return (
        <IncomingRequestScreen
          onAccept={() => go("chat-negotiate")}
          onDecline={() => go("available")}
        />
      );
    case "chat-negotiate":
      return (
        <WorkerChatScreen
          user={user}
          messages={state.chatMessages}
          onAddMessage={(msg) => update({ chatMessages: [...state.chatMessages, msg] })}
          onConfirm={() => go("in-progress")}
        />
      );
    case "in-progress":
      return (
        <WorkerInProgressScreen
          onFinalize={() => go("finalize")}
          serviceLocation={state.selectedWorker?.location ?? state.userLocation ?? undefined}
          onProgressUpdate={(p) => update({ serviceProgress: p })}
        />
      );
    case "finalize":
      return <WorkerFinalizeScreen onDone={() => go("commission")} />;
    case "commission":
      return <WorkerCommissionScreen onHistory={() => go("history")} />;
    case "history":
      return <WorkerHistoryScreen user={user} onBack={() => go("dashboard")} />;
    default:
      return <WorkerDashboardHome user={user} onStart={() => go("complete-profile")} onHistory={() => go("history")} onLogout={onLogout} />;
  }
}
