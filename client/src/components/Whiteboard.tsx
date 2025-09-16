import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect } from "react";
import api from "@/utils/api";

interface WhiteboardProps {
  boardId: string;
  boardName: string;
  data?: string;
}

function WhiteboardContent({
  boardId,
  data,
}: {
  boardId: string;
  data?: string;
}) {
  const editor = useEditor();

  useEffect(() => {
    if (data && editor) {
      try {
        const snapshot = JSON.parse(data);
        editor.loadSnapshot(snapshot);
      } catch (error) {
        console.error("Failed to load whiteboard data:", error);
      }
    }
  }, [data, editor]);

  useEffect(() => {
    if (!editor) return;

    const saveData = async () => {
      try {
        const snapshot = editor.getSnapshot();
        await api.put(`/api/boards/${boardId}/data`, {
          data: JSON.stringify(snapshot),
        });
      } catch (error) {
        console.error("Failed to save whiteboard data:", error);
      }
    };

    // Save on changes with debouncing
    let timeoutId: number;
    const handleChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveData, 1000); // Save after 1 second of no changes
    };

    editor.on("change", handleChange);

    return () => {
      clearTimeout(timeoutId);
      editor.off("change", handleChange);
    };
  }, [editor, boardId]);

  return null;
}

export function Whiteboard({
  boardId,
  boardName,
  data,
}: WhiteboardProps) {
  return (
    <div className="flex h-full bg-base-100 flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <h2 className="text-lg font-semibold text-base-content">{boardName}</h2>
      </div>

      {/* Tldraw Canvas */}
      <div className="flex-1 overflow-hidden bg-white">
        <Tldraw persistenceKey={boardId} className="w-full h-full">
          <WhiteboardContent boardId={boardId} data={data} />
        </Tldraw>
      </div>
    </div>
  );
}
