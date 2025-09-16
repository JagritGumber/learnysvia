import { Tldraw, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useState, useRef } from "react";
import api from "@/utils/api";

interface WhiteboardProps {
  boardId: string;
  boardName: string;
  data?: string;
}

function WhiteboardContent({
  boardId,
  data,
  onEditorReady,
  editorRef,
}: {
  boardId: string;
  data?: string;
  onEditorReady?: (editor: any) => void;
  editorRef: React.MutableRefObject<any>;
}) {
  const editor = useEditor();

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [editor, onEditorReady, editorRef]);

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

export function Whiteboard({ boardId, boardName, data }: WhiteboardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [finalWords, setFinalWords] = useState<string[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event: any) => {
        let newFinal = "";
        let newInterim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += transcriptPart;
          } else {
            newInterim += transcriptPart;
          }
        }
        if (newFinal) {
          // Send final transcript to backend for Wit.ai processing
          try {
            const response = await api.post(`/api/boards/speech/${boardId}`, {
              transcript: newFinal.trim(),
            });

            if (
              response.data.success &&
              response.data.shapesCreated.length > 0
            ) {
              // Refresh the whiteboard data to show new shapes
              const boardResponse = await api.get(`/api/boards/${boardId}`);
              if (boardResponse.data.board?.data) {
                const snapshot = JSON.parse(boardResponse.data.board.data);
                if (editorRef.current) {
                  editorRef.current.loadSnapshot(snapshot);
                }
              }
            }
          } catch (error) {
            console.error("Failed to process speech:", error);
          }

          // Update local transcript display
          setFinalWords((prev) => {
            const newWords = newFinal.trim().split(/\s+/);
            const combined = [...prev, ...newWords];
            const mod = combined.length % 15;
            if (mod === 0) {
              return combined.slice(-15);
            } else {
              return combined.slice(-mod);
            }
          });
        }
        setInterimTranscript(newInterim);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setFinalWords([]);
      setInterimTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-full bg-base-100 flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <h2 className="text-lg font-semibold text-base-content">{boardName}</h2>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`btn ${isRecording ? "btn-error" : "btn-primary"}`}
        >
          {isRecording ? "Stop Audio Notes" : "Start Audio Notes"}
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-white relative">
        <Tldraw persistenceKey={boardId} className="w-full h-full">
          <WhiteboardContent boardId={boardId} data={data} editorRef={editorRef} />
        </Tldraw>

        {/* Subtitles Overlay */}
        {(finalWords.length > 0 || interimTranscript) && (
          <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
            <div className="bg-base-200 rounded border border-base-300 p-2">
              <p className="text-sm text-base-content">
                {finalWords.join(" ") +
                  (interimTranscript ? " " + interimTranscript : "")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
