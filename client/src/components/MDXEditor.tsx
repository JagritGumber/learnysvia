import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import { useDebounce } from "@/hooks/useDebounce";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  ListsToggle,
  InsertThematicBreak,
  InsertCodeBlock,
  codeBlockPlugin as codeBlockPluginImport,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  InsertTable,
  tablePlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  diffSourcePlugin,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface MDXEditorProps {
  boardId: string;
  boardName: string;
  initialContent?: string;
}

export function MDXEditorComponent({
  boardId,
  boardName,
  initialContent = "",
}: MDXEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isRecording, setIsRecording] = useState(false);
  const [finalWords, setFinalWords] = useState<string[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const editorRef = useRef<MDXEditorMethods>(null);

  // Debounced content for auto-save
  const debouncedContent = useDebounce(content, 1000);

  // Auto-save functionality
  useEffect(() => {
    if (debouncedContent !== initialContent && debouncedContent.trim()) {
      saveContent(debouncedContent);
    }
  }, [debouncedContent, initialContent]);

  const saveContent = async (mdxContent: string) => {
    try {
      await api.put(`/api/boards/${boardId}/data`, {
        data: mdxContent,
      });
    } catch (error) {
      console.error("Failed to save MDX content:", error);
    }
  };

  // Speech recognition setup
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

            if (response.data.success && response.data.mdxContent) {
              // Append the generated MDX content to existing content
              const newContent = content + "\n\n" + response.data.mdxContent;
              setContent(newContent);
              editorRef.current?.setMarkdown(newContent);
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
  }, [boardId, content]);

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

  const insertTemplate = (template: string) => {
    if (editorRef.current) {
      const currentMarkdown = editorRef.current.getMarkdown();
      const newContent = currentMarkdown + "\n\n" + template;
      editorRef.current.setMarkdown(newContent);
      setContent(newContent);
    }
  };

  const templates = {
    heading: "# Heading\n\n",
    code: "```javascript\n// Your code here\n```\n\n",
    list: "- Item 1\n- Item 2\n- Item 3\n\n",
    mermaid:
      "```mermaid\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]\n```\n\n",
    quiz: "<Quiz question=\"What is 2+2?\" options={['3', '4', '5']} correct={1} />\n\n",
  };

  return (
    <div className="flex h-full bg-base-100 flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <h2 className="text-lg font-semibold text-base-content">{boardName}</h2>
        <div className="flex gap-2">
          {/* Template Buttons */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-outline btn-sm">
              Templates
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={() => insertTemplate(templates.heading)}>
                  Heading
                </button>
              </li>
              <li>
                <button onClick={() => insertTemplate(templates.code)}>
                  Code Block
                </button>
              </li>
              <li>
                <button onClick={() => insertTemplate(templates.list)}>
                  List
                </button>
              </li>
              <li>
                <button onClick={() => insertTemplate(templates.mermaid)}>
                  Mermaid Diagram
                </button>
              </li>
              <li>
                <button onClick={() => insertTemplate(templates.quiz)}>
                  Quiz Component
                </button>
              </li>
            </ul>
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`btn ${isRecording ? "btn-error" : "btn-primary"} btn-sm`}
          >
            {isRecording ? "Stop Audio Notes" : "Start Audio Notes"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <MDXEditor
          ref={editorRef}
          markdown={content}
          onChange={(newContent) => setContent(newContent)}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                javascript: "JavaScript",
                typescript: "TypeScript",
                python: "Python",
                java: "Java",
                css: "CSS",
                html: "HTML",
                json: "JSON",
                mermaid: "Mermaid",
              },
            }),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <CreateLink />
                  <InsertImage />
                  <ListsToggle />
                  <InsertThematicBreak />
                  <InsertCodeBlock />
                  <InsertTable />
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => <ChangeCodeMirrorLanguage />,
                      },
                    ]}
                  />
                </>
              ),
            }),
            tablePlugin(),
            imagePlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            diffSourcePlugin({ viewMode: "source" }),
          ]}
          className="h-full border-0"
        />
      </div>

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
  );
}
