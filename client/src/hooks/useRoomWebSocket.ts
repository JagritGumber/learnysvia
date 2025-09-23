import { useEffect } from "react";
import { useWebsocketStore } from "@/store/websocket";
import { api } from "@/utils/treaty";
import toast from "react-hot-toast";
import { SelectPollWithQuestionAndOptions } from "@/shared/types/poll";
import { usePollStore } from "@/store/poll.store";
import { useNavigate } from "@tanstack/react-router";

interface UseRoomWebSocketProps {
  roomId: string;
  participantId: string;
}

export function useRoomWebSocket({
  roomId,
  participantId,
}: UseRoomWebSocketProps) {
  const setPoll = usePollStore.getState().setPoll;
  const navigate = useNavigate();

  const startWebsocketConnection = async () => {
    if (useWebsocketStore.getState().websocket) {
      console.log("websocket already subscribed");
      return;
    }
    console.log("Connecting websocket");

    try {
      const ws = api.ws
        .rooms({ id: roomId })({ pid: participantId })
        .subscribe();
      useWebsocketStore.getState().setWebsocket(ws);
      usePollStore.getState().setRoomId(roomId);
      ws.on("open", (event) => {
        console.log("WebSocket connected", event);
      });

      ws.on("message", (event) => {
        if (event.data[422]) {
          console.error("Data validation failed", event.data);
          return;
        }
        const data = event.data as unknown as (typeof event.data)[200];
        const channelSignal = event.data as unknown as string;

        if (data?.event === "participants:result") {
          useWebsocketStore.getState().setParticipants(data?.participants);
          useWebsocketStore.getState().setLoadingParticipants(false);
        } else if (
          data?.event === "participant:updated" ||
          channelSignal === "participants:notfresh"
        ) {
          useWebsocketStore.getState().fetchParticipants(roomId);
        } else if (channelSignal === "poll:created") {
          // Invalidate polls query to refresh the list
          useWebsocketStore.getState().invalidatePolls(roomId);
          toast.success("New poll created!");
        } else if (data?.event === "polls:result") {
          // Handle polls result if needed
          console.log("Received polls result:", data.polls);
        } else if (data?.event === "poll:result") {
          const poll = data?.poll as SelectPollWithQuestionAndOptions;
          setPoll(poll);
        } else if (data?.event === "error") {
          useWebsocketStore.getState().setParticipantsError(data?.message);
          useWebsocketStore.getState().setLoadingParticipants(false);
          toast.error(`Participants error: ${data.message}`);
        } else if (data?.event === "redirect:join") {
          navigate({
            to: "/join/$code",
            params: {
              code: data?.code,
            },
          });
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        useWebsocketStore
          .getState()
          .setParticipantsError("WebSocket connection error");
        toast.error("Connection error occurred");
      });

      ws.on("close", (event) => {
        console.log("WebSocket closed", event);
        useWebsocketStore.getState().setWebsocket(null);
        useWebsocketStore.getState().setParticipants([]);
        useWebsocketStore.getState().setParticipantsError(null);
      });
    } catch (error) {
      console.error("Failed to connect to the room", error);
      toast.error("Failed to connect to the room, Please try again later");
    }
  };

  useEffect(() => {
    startWebsocketConnection();
  }, [roomId, participantId]);
}
