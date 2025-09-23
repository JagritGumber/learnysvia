import { useEffect } from "react";
import { useWebsocketStore } from "@/store/websocket";
import { api } from "@/utils/treaty";
import toast from "react-hot-toast";

interface UseRoomWebSocketProps {
  roomId: string;
  participantId: string;
}

export function useRoomWebSocket({
  roomId,
  participantId,
}: UseRoomWebSocketProps) {
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
        } else if (data?.event === "error") {
          useWebsocketStore.getState().setParticipantsError(data?.message);
          useWebsocketStore.getState().setLoadingParticipants(false);
          toast.error(`Participants error: ${data.message}`);
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
