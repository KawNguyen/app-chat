import { User } from "@/types";
import { PendingRequestItem } from "./pending-request-item";

interface PendingRequest {
  id: string;
  sender: User;
  createdAt: Date;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export const PendingRequestsList = ({
  requests,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: PendingRequestsListProps) => (
  <>
    <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
      Pending — {requests.length}
    </h2>
    {requests.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-base font-medium text-muted-foreground">
          No pending friend requests
        </p>
      </div>
    ) : (
      <div className="space-y-1">
        {requests.map((request) => (
          <PendingRequestItem
            key={request.id}
            request={request}
            onAccept={() => onAccept(request.id)}
            onDecline={() => onDecline(request.id)}
            isAccepting={isAccepting}
            isDeclining={isDeclining}
          />
        ))}
      </div>
    )}
  </>
);
