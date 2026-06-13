import { useState } from "react";

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube watch or short URLs
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  // YouTube embed already
  if (url.includes("youtube.com/embed/")) return url;
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return url;
  return null;
}

function VideoPanel({ isCreator, videoUrl, onSetVideo }) {
  const [input, setInput] = useState(videoUrl || "");
  const embedUrl = getEmbedUrl(videoUrl);
  const isDirect = embedUrl && !embedUrl.includes("youtube.com/embed");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetVideo(input.trim());
  };

  return (
    <div className="panel video-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-video"></div>
          Class Video
        </div>
        {isCreator && <span className="cursor-info">creator</span>}
      </div>

      {isCreator && (
        <form onSubmit={handleSubmit} className="video-form">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube or video URL..."
          />
          <button type="submit">Set</button>
        </form>
      )}

      {embedUrl ? (
        isDirect ? (
          <video
            src={embedUrl}
            controls
            className="video-player"
          />
        ) : (
          <iframe
            src={embedUrl}
            className="video-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Class Video"
          />
        )
      ) : (
        <div className="video-placeholder">
          {isCreator ? "No video set yet. Paste a URL above." : "Waiting for the creator to add a video..."}
        </div>
      )}
    </div>
  );
}

export default VideoPanel;
