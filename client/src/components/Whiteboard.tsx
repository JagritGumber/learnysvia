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

interface Shape {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export function Whiteboard({
  boardName,
  backgroundColor = "#ffffff",
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<
    "select" | "pen" | "eraser" | "rectangle" | "circle" | "text"
  >("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [isPlacingShape, setIsPlacingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);

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
  }, [paths, shapes, texts, backgroundColor]);

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

    // Draw shapes
    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;

      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        const radius = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2;
        ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw texts
    texts.forEach((text) => {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontSize}px Arial`;
      ctx.fillText(text.text, text.x, text.y);
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

    if (currentTool === "pen" || currentTool === "eraser") {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        points: [point],
        color: currentColor,
        width: brushSize,
        tool: currentTool,
      };
      setCurrentPath(newPath);
      setIsDrawing(true);
    } else if (currentTool === "rectangle" || currentTool === "circle") {
      setShapeStart(point);
      setIsPlacingShape(true);
    } else if (currentTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newText: TextElement = {
          id: Date.now().toString(),
          x: point.x,
          y: point.y,
          text,
          color: currentColor,
          fontSize: brushSize * 10,
        };
        setTexts((prev) => [...prev, newText]);
      }
    }
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

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath(null);
    setIsDrawing(false);

    if (isPlacingShape && shapeStart && e) {
      const endPoint = getCanvasCoordinates(e);
      const width = endPoint.x - shapeStart.x;
      const height = endPoint.y - shapeStart.y;

      const newShape: Shape = {
        id: Date.now().toString(),
        type: currentTool as "rectangle" | "circle",
        x: shapeStart.x,
        y: shapeStart.y,
        width,
        height,
        color: currentColor,
      };
      setShapes((prev) => [...prev, newShape]);
      setIsPlacingShape(false);
      setShapeStart(null);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setShapes([]);
    setTexts([]);
  };

  const undo = () => {
    if (texts.length > 0) {
      setTexts((prev) => prev.slice(0, -1));
    } else if (shapes.length > 0) {
      setShapes((prev) => prev.slice(0, -1));
    } else if (paths.length > 0) {
      setPaths((prev) => prev.slice(0, -1));
    }
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
    <div className="flex h-full bg-base-100">
      {/* Left Sidebar */}
      <div className="w-16 bg-base-200 border-r border-base-300 flex flex-col items-center py-4 gap-2">
        {/* Tools */}
        <button
          className={`btn btn-sm btn-square ${currentTool === "pen" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setCurrentTool("pen")}
          title="Pen"
        >
          <Icon icon="heroicons:pencil" className="size-4" />
        </button>
        <button
          className={`btn btn-sm btn-square ${currentTool === "eraser" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setCurrentTool("eraser")}
          title="Eraser"
        >
          <Icon icon="heroicons:backspace" className="size-4" />
        </button>
        <button
          className={`btn btn-sm btn-square ${currentTool === "rectangle" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setCurrentTool("rectangle")}
          title="Rectangle"
        >
          <Icon icon="heroicons:square-3-stack-3d" className="size-4" />
        </button>
        <button
          className={`btn btn-sm btn-square ${currentTool === "circle" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setCurrentTool("circle")}
          title="Circle"
        >
          <Icon icon="heroicons:circle-stack" className="size-4" />
        </button>
        <button
          className={`btn btn-sm btn-square ${currentTool === "text" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setCurrentTool("text")}
          title="Text"
        >
          <Icon icon="heroicons:document-text" className="size-4" />
        </button>

        {/* Colors */}
        <div className="divider my-2"></div>
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 ${currentColor === color ? "border-primary" : "border-base-300"}`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
            title={color.toUpperCase()}
          />
        ))}

        {/* Actions */}
        <div className="divider my-2"></div>
        <button
          className="btn btn-sm btn-square btn-ghost"
          onClick={undo}
          disabled={paths.length === 0 && shapes.length === 0 && texts.length === 0}
          title="Undo"
        >
          <Icon icon="heroicons:arrow-uturn-left" className="size-4" />
        </button>
        <button
          className="btn btn-sm btn-square btn-error"
          onClick={clearCanvas}
          title="Clear"
        >
          <Icon icon="heroicons:trash" className="size-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
          <h2 className="text-lg font-semibold text-base-content">{boardName}</h2>

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
    </div>
  );
}
