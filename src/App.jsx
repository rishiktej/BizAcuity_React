import { useState } from "react";
import DraggableResizableImage from "./Imageopts";

function App() {
  const [unit, setUnit] = useState("cm");
  const [widthInput, setWidthInput] = useState(30);
  const [heightInput, setHeightInput] = useState(20);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const MAX_IMAGES = 10;

  const convertToPixels = (value, unit) => {
    if (unit === "cm") return value * 0.6;
    if (unit === "m") return value * 60;
    if (unit === "ft") return value * 20;
    return value;
  };

  const pixelWidth = convertToPixels(widthInput, unit);
  const pixelHeight = convertToPixels(heightInput, unit);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map((file) => URL.createObjectURL(file));
    const newImages = fileURLs.map((src) => ({
      src,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotate: 0,
    }));

    setImages((prev) => {
      const urlImages = prev.filter((img) => !img.src.startsWith("blob:"));
      const combined = [
        ...urlImages,
        ...prev.filter((img) => img.src.startsWith("blob:")),
        ...newImages,
      ];
      return combined.slice(0, MAX_IMAGES);
    });
  };

  const handleURLInput = (e) => {
    setImageURLs(e.target.value);
  };

  const handleURLUpload = () => {
    const urls = imageURLs
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    const newImages = urls.map((src) => ({
      src,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotate: 0,
    }));

    setImages((prev) => {
      const blobImages = prev.filter((img) => img.src.startsWith("blob:"));
      const combined = [...blobImages, ...newImages];
      return combined.slice(0, MAX_IMAGES);
    });
  };

  const rotateImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].rotate = (updated[index].rotate + 90) % 360;
      return updated;
    });
  };

  const updateImage = (index, data) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  };

  const deleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) setSelectedImageIndex(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-100"
      onClick={() => setSelectedImageIndex(null)}
    >
      <aside
        className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 p-4 shadow-md overflow-y-auto"
        aria-label="Sidebar"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Set Dimensions
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={widthInput}
              onChange={(e) => setWidthInput(+e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Width"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(+e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Height"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="ft">ft</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Image URLs (comma or newline separated)
            </label>
            <textarea
              value={imageURLs}
              onChange={handleURLInput}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
            ></textarea>
            <button
              onClick={handleURLUpload}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Upload URLs
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Max {MAX_IMAGES} images allowed.
          </p>
        </div>
      </aside>

      <div className="sm:ml-64 p-6">
        <div
          className="border-2 border-dashed border-gray-400 mx-auto relative"
          style={{
            width: pixelWidth,
            height: pixelHeight,
            backgroundColor: bgColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, index) => (
            <DraggableResizableImage
              key={index}
              index={index}
              img={img}
              onUpdate={updateImage}
              onRotate={rotateImage}
              onDelete={deleteImage}
              isSelected={selectedImageIndex === index}
              onSelect={(i) => setSelectedImageIndex(i)}
              frameWidth={pixelWidth} // add this
              frameHeight={pixelHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
