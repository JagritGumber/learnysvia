import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface WhiteboardProps {
  boardId: string;
  boardName: string;
  backgroundColor?: string;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: "pen" | "eraser";
}

export function Whiteboard({
  boardName,
  backgroundColor = "#ffffff",
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser">("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear and redraw
    redrawCanvas();
  }, [paths, backgroundColor]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.tool === "eraser" ? backgroundColor : path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
    });
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      points: [point],
      color: currentColor,
      width: brushSize,
      tool: currentTool,
    };

    setCurrentPath(newPath);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;

    const point = getCanvasCoordinates(e);
    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, point],
    };

    setCurrentPath(updatedPath);
  };

  const handleMouseUp = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setPaths([]);
  };

  const undo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ];

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-base-300 bg-base-200">
        <h2 className="text-lg font-semibold text-base-content">{boardName}</h2>

        {/* Tools */}
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${currentTool === "pen" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCurrentTool("pen")}
          >
            <Icon icon="heroicons:pencil" className="size-4" />
            Pen
          </button>
          <button
            className={`btn btn-sm ${currentTool === "eraser" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCurrentTool("eraser")}
          >
            <Icon icon="heroicons:backspace" className="size-4" />
            Eraser
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${currentColor === color ? "border-primary" : "border-base-300"}`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="range range-xs range-primary"
          />
          <span className="text-sm text-base-content/70 w-6">{brushSize}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="btn btn-sm btn-ghost"
            onClick={undo}
            disabled={paths.length === 0}
          >
            <Icon icon="heroicons:arrow-uturn-left" className="size-4" />
            Undo
          </button>
          <button className="btn btn-sm btn-error" onClick={clearCanvas}>
            <Icon icon="heroicons:trash" className="size-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ backgroundColor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
