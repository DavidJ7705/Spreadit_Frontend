import { useRef, useEffect, useState } from 'react';

import Card from '../ui/Card';
import classes from './NewPostForm.module.css';

function NewPostForm(props) {
  const { preSelectedModuleId } = props;
  const titleInputRef = useRef();
  const descriptionInputRef = useRef();

  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(preSelectedModuleId || "");
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Load all modules for the dropdown
  useEffect(() => {
    async function loadModules() {
      try {
        const res = await fetch("http://localhost:8003/api/module");
        if (res.ok) {
          const data = await res.json();
          setModules(Array.isArray(data) ? data : []);
        } else {
          setModules([]);
        }
      } catch (err) {
        console.error('Failed to load modules:', err);
        setModules([]);
      }
    }

    loadModules();
  }, []);

  // Update selectedModuleId when preSelectedModuleId prop changes
  useEffect(() => {
    if (preSelectedModuleId) {
      setSelectedModuleId(preSelectedModuleId);
    }
  }, [preSelectedModuleId]);

  function submitHandler(event) {
    event.preventDefault();

    const enteredTitle = titleInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;
    const finalModuleId = selectedModuleId;

    if (!finalModuleId) {
      alert("Please select a module.");
      return;
    }

    const postData = {
      post_title: enteredTitle,  // Backend expects post_title
      content: enteredDescription,  // Backend expects content
      module_id: parseInt(finalModuleId) // Backend expects module_id as integer
      // Note: Backend doesn't support image field yet
    };

    props.onAddPost(postData);
  }

  // Handle file drop or paste
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      convertFileToBase64(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the actual drop zone
    // Check if we're leaving to an element outside the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOver(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      convertFileToBase64(file);
    }
  }

  function convertFileToBase64(file) {
    // Create an image to get dimensions
    const img = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      // Max dimensions for compression
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      const MAX_SIZE_KB = 500; // Target max size in KB

      let width = img.width;
      let height = img.height;

      // Check if resizing is needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Start with high quality and reduce if needed
      let quality = 0.8;
      let result = canvas.toDataURL('image/jpeg', quality);

      // Reduce quality if still too large (rough estimate: base64 is ~1.37x larger)
      while (result.length > MAX_SIZE_KB * 1024 * 1.37 && quality > 0.3) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }

      setImageUrl(result);
    };

    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageUrl("");
  }

  return (
    <Card>
      <form className={classes.form} onSubmit={submitHandler}>

        {/* Module dropdown - only show if not pre-selected */}
        {!preSelectedModuleId && (
          <div className={classes.control}>
            <label htmlFor="module">Module</label>
            <select
              id="module"
              required
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
            >
              <option value="">-- Select a module --</option>
              {modules.map((m) => (
                <option key={m.id_module} value={m.id_module}>
                  {m.id_module} — {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show selected module info when pre-selected */}
        {preSelectedModuleId && (
          <div className={classes.control}>
            <label>Module</label>
            <div className={classes.preSelectedModule}>
              {modules.length > 0
                ? (modules.find(m => m.id_module === parseInt(preSelectedModuleId))?.name || `Module ${preSelectedModuleId}`)
                : `Module ${preSelectedModuleId} (Loading details...)`
              }
            </div>
          </div>
        )}

        <div className={classes.control}>
          <label htmlFor='title'>Post Title</label>
          <input type='text' required id='title' ref={titleInputRef} />
        </div>

        {/* Image Upload - URL or Drag & Drop */}
        <div className={classes.control}>
          <label>Image (optional)</label>

          <div
            className={`${classes.dropZone} ${dragOver ? classes.dropZoneActive : ''} ${imageUrl ? classes.dropZoneHasImage : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {imageUrl ? (
              <div className={classes.previewContainer}>
                <img src={imageUrl} alt="Preview" className={classes.preview} />
                <button type="button" className={classes.clearBtn} onClick={clearImage}>×</button>
              </div>
            ) : (
              <div className={classes.dropContent}>
                <p>Drag & drop an image here</p>
                <span>or</span>
                <label className={classes.fileLabel}>
                  Choose file
                  <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                </label>
              </div>
            )}
          </div>

          <div className={classes.urlInput}>
            <input
              type='url'
              placeholder="Or paste image URL here..."
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        <div className={classes.control}>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            required
            rows='5'
            ref={descriptionInputRef}
          ></textarea>
        </div>
        <div className={classes.actions}>
          <button>Add Post</button>
        </div>
      </form>
    </Card>
  );
}

export default NewPostForm;