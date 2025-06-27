import { useState, useEffect, useRef } from "react";
import { Resizable } from "re-resizable";

function DraggableResizableImage({
  img,
  index,
  onUpdate,
  onRotate,
  isSelected,
  onSelect,
  onDelete,
  frameWidth,
  frameHeight,
}) {
  const [pos, setPos] = useState({ x: img.x, y: img.y });
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: img.width,
    height: img.height,
  });
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onSelect(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupRef, onSelect]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(index);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isSelected && isDragging) {
      setPos((prev) => {
        const newX = prev.x + e.movementX;
        const newY = prev.y + e.movementY;

        // Clamp the new X and Y within the background boundaries
        const maxX = frameWidth - dimensions.width;
        const maxY = frameHeight - dimensions.height;

        return {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        };
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate(index, { x: pos.x, y: pos.y });
    }
  };

  const handleResize = (e, direction, ref, d) => {
    let newWidth = ref.offsetWidth;
    let newHeight = ref.offsetHeight;

    // Clamp width and height so it stays within frame
    newWidth = Math.min(newWidth, frameWidth - pos.x);
    newHeight = Math.min(newHeight, frameHeight - pos.y);

    setDimensions({ width: newWidth, height: newHeight });
    onUpdate(index, { width: newWidth, height: newHeight });
  };

  const toggleAspectRatio = () => {
    onUpdate(index, { lockAspectRatio: !img.lockAspectRatio });
  };

  const changeShape = (e) => {
    onUpdate(index, { shape: e.target.value });
  };

  const handleSliderChange = (type, value) => {
    const newDims = { ...dimensions, [type]: parseInt(value, 10) };
    setDimensions(newDims);
    onUpdate(index, newDims);
  };

  const shapeClipPaths = {
    circle: "circle(50%)",
    hexagon:
      "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
    none: "none",
  };
  const resizeHandles = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    topRight: true,
    bottomRight: true,
    bottomLeft: true,
    topLeft: true,
  };

  return (
    <div
      style={{
        position: "absolute",
        top: pos.y,
        left: pos.x,
        transform: `rotate(${img.rotate}deg)`,
        cursor: isSelected ? "move" : "default",
        zIndex: isSelected ? 1000 : index,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Resizable
        size={dimensions}
        enable={isSelected ? resizeHandles : false}
        lockAspectRatio={img.lockAspectRatio}
        onResizeStop={handleResize}
      >
        <div className="relative w-full h-full">
          {/* Shape wrapper */}
          <div
            className="w-full h-full overflow-hidden"
            style={{
              clipPath: shapeClipPaths[img.shape || "none"],
              WebkitClipPath: shapeClipPaths[img.shape || "none"],
            }}
          >
            <img
              src={img.src}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>

          {isSelected && (
            <>
              <button
                onClick={() => onRotate(index)}
                className="absolute top-0 right-14 bg-white text-xs px-1 py-0.5 border border-gray-300"
              >
                ⟳
              </button>
              <button
                onClick={() => onDelete(index)}
                className="absolute top-0 right-5 bg-red-500 text-white text-xs px-1 py-0.5 border border-red-700"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </Resizable>

      {isSelected && (
        <div
          ref={popupRef}
          className="absolute -bottom-28 left-0 bg-white p-3 shadow-md text-xs z-50 border border-gray-300 rounded"
        >
          <div className="mb-2">
            <label className="mr-2">Shape:</label>
            <select
              value={img.shape || "none"}
              onChange={changeShape}
              className="border border-gray-300 px-1"
            >
              <option value="none">None</option>
              <option value="circle">Circle</option>
              <option value="hexagon">Hexagon</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="mr-2">Aspect Ratio</label>
            <input
              type="checkbox"
              checked={img.lockAspectRatio}
              onChange={toggleAspectRatio}
            />
          </div>
          <div className="mb-2">
            <label>Width: </label>
            <input
              type="range"
              min="20"
              max="500"
              value={dimensions.width}
              onChange={(e) => handleSliderChange("width", e.target.value)}
            />
            <span className="ml-2">{dimensions.width}px</span>
          </div>
          <div>
            <label>Height: </label>
            <input
              type="range"
              min="20"
              max="500"
              value={dimensions.height}
              onChange={(e) => handleSliderChange("height", e.target.value)}
            />
            <span className="ml-2">{dimensions.height}px</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DraggableResizableImage;
