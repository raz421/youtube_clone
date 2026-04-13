import { useEffect, useMemo, useState } from "react";
import AnimatedButton from "../components/AnimatedButton.jsx";
import { api, extractResponseData } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";
import { useAppStore } from "../store/appStore.js";
import { useAuthStore } from "../store/authStore.js";

function Upload() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const addToast = useAppStore((state) => state.addToast);
  const setVideos = useAppStore((state) => state.setVideos);
  const user = useAuthStore((state) => state.user);

  const thumbnailPreview = useMemo(() => {
    if (!thumbnailFile) {
      return "";
    }

    return URL.createObjectURL(thumbnailFile);
  }, [thumbnailFile]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!videoFile || !thumbnailFile || !title.trim() || !description.trim()) {
      addToast("error", "All upload fields are required");
      return;
    }

    if (!user) {
      addToast("error", "You must be signed in to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    const payload = new FormData();
    payload.append("video", videoFile);
    payload.append("thumbnail", thumbnailFile);
    payload.append("title", title);
    payload.append("description", description);

    try {
      const response = await api.post(endpoints.public.upload, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (eventData) => {
          if (!eventData.total) {
            return;
          }

          const nextProgress = Math.round(
            (eventData.loaded * 100) / eventData.total
          );
          setProgress(nextProgress);
        },
      });

      const createdVideo = extractResponseData(response);
      setVideos((prev) => [createdVideo, ...(Array.isArray(prev) ? prev : [])]);
      addToast("success", "Video uploaded successfully");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setProgress(100);
    } catch (requestError) {
      addToast("error", "Upload failed. Authentication may be required.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="glass-panel relative overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-brand-accent/20 blur-3xl" />
      <h1 className="font-display text-3xl text-white">Upload New Story</h1>
      <p className="mt-2 text-brand-muted">
        Drag, preview, and publish with cinematic pacing.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block rounded-2xl border border-dashed border-white/30 p-6 text-center">
          <p className="text-sm text-brand-muted">Drop video file here</p>
          <input
            type="file"
            accept="video/*"
            className="mt-3 block w-full text-sm text-brand-muted"
            onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
          />
          {videoFile ? (
            <p className="mt-2 text-xs text-brand-accent">{videoFile.name}</p>
          ) : null}
        </label>

        <label className="block rounded-2xl border border-dashed border-white/30 p-6 text-center">
          <p className="text-sm text-brand-muted">Drop thumbnail</p>
          <input
            type="file"
            accept="image/*"
            className="mt-3 block w-full text-sm text-brand-muted"
            onChange={(event) =>
              setThumbnailFile(event.target.files?.[0] || null)
            }
          />
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="mx-auto mt-4 h-40 rounded-xl object-cover"
            />
          ) : null}
        </label>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Video title"
          className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Description"
          className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        />

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-brand-base to-brand-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatedButton
          type="submit"
          disabled={uploading}
          className="disabled:opacity-50"
        >
          {uploading ? `Uploading ${progress}%` : "Publish Video"}
        </AnimatedButton>
      </form>
    </section>
  );
}

export default Upload;
