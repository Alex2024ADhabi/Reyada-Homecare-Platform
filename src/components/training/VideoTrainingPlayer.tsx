import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description: string;
  keyPoints: string[];
  interactiveElements?: {
    type: "quiz" | "note" | "bookmark";
    timestamp: number;
    content: string;
  }[];
}

interface VideoTrainingProps {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  chapters: VideoChapter[];
  subtitles?: {
    language: string;
    url: string;
  }[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onInteraction?: (type: string, data: any) => void;
}

const VideoTrainingPlayer: React.FC<VideoTrainingProps> = ({
  videoId,
  title,
  description,
  videoUrl,
  duration,
  chapters,
  subtitles = [],
  onProgress,
  onComplete,
  onInteraction,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState("en");
  const [currentChapter, setCurrentChapter] = useState<VideoChapter | null>(
    null,
  );
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState<
    Array<{ timestamp: number; note: string; id: string }>
  >([]);
  const [watchTime, setWatchTime] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [interactivePrompts, setInteractivePrompts] = useState<
    Array<{ timestamp: number; shown: boolean; content: any }>
  >([]);

  // Initialize interactive prompts from chapters
  useEffect(() => {
    const prompts = chapters.flatMap(
      (chapter) =>
        chapter.interactiveElements?.map((element) => ({
          timestamp: element.timestamp,
          shown: false,
          content: element,
        })) || [],
    );
    setInteractivePrompts(prompts);
  }, [chapters]);

  // Update current chapter based on video time
  useEffect(() => {
    const chapter = chapters.find(
      (ch) => currentTime >= ch.startTime && currentTime <= ch.endTime,
    );
    if (chapter && chapter !== currentChapter) {
      setCurrentChapter(chapter);
    }
  }, [currentTime, chapters, currentChapter]);

  // Track watch time and completion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setWatchTime((prev) => prev + 1);
        const progress = (currentTime / duration) * 100;
        setCompletionPercentage(progress);
        onProgress?.(progress);

        // Check for completion
        if (progress >= 90 && progress < 95) {
          onComplete?.();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, onProgress, onComplete]);

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Check for interactive prompts
      interactivePrompts.forEach((prompt, index) => {
        if (!prompt.shown && Math.abs(time - prompt.timestamp) < 1) {
          setInteractivePrompts((prev) =>
            prev.map((p, i) => (i === index ? { ...p, shown: true } : p)),
          );
          showInteractivePrompt(prompt.content);
        }
      });
    }
  };

  const showInteractivePrompt = (content: any) => {
    // Pause video for interactive content
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }

    onInteraction?.(content.type, content);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    seekTo(Math.min(currentTime + 10, duration));
  };

  const skipBackward = () => {
    seekTo(Math.max(currentTime - 10, 0));
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addNote = () => {
    const note = prompt("Add a note at this timestamp:");
    if (note) {
      const newNote = {
        id: Date.now().toString(),
        timestamp: currentTime,
        note,
      };
      setUserNotes((prev) => [...prev, newNote]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-blue-100 text-sm">{description}</p>
        <div className="flex items-center gap-4 mt-2">
          <Badge className="bg-white/20 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(duration)}
          </Badge>
          <Badge className="bg-white/20 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            {Math.round(completionPercentage)}% Complete
          </Badge>
          {currentChapter && (
            <Badge className="bg-white/20 text-white">
              <BookOpen className="h-3 w-3 mr-1" />
              {currentChapter.title}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Video Player */}
        <div className="flex-1">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setCurrentTime(0);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                onComplete?.();
              }}
            >
              {subtitles.map((subtitle) => (
                <track
                  key={subtitle.language}
                  kind="subtitles"
                  src={subtitle.url}
                  srcLang={subtitle.language}
                  label={subtitle.language.toUpperCase()}
                  default={subtitle.language === selectedSubtitle}
                />
              ))}
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={(value) => seekTo(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-white text-xs mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipBackward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipForward}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(Number(e.target.value))}
                    className="bg-black/50 text-white text-xs rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className="text-white hover:bg-white/20"
                  >
                    <Subtitles className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addNote}
                    className="text-white hover:bg-white/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-gray-50 border-l">
          {/* Chapter Navigation */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Chapters
            </h3>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => seekTo(chapter.startTime)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    currentChapter?.id === chapter.id
                      ? "bg-blue-100 border-l-4 border-blue-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatTime(chapter.startTime)} -{" "}
                    {formatTime(chapter.endTime)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Chapter Info */}
          {currentChapter && (
            <div className="p-4 border-b">
              <h4 className="font-semibold mb-2">{currentChapter.title}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {currentChapter.description}
              </p>
              {currentChapter.keyPoints.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Key Points:</h5>
                  <ul className="text-xs space-y-1">
                    {currentChapter.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* User Notes */}
          <div className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              My Notes ({userNotes.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-2 rounded border text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">
                      {formatTime(note.timestamp)}
                    </span>
                    <button
                      onClick={() => seekTo(note.timestamp)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Go to
                    </button>
                  </div>
                  <p className="text-gray-700">{note.note}</p>
                </div>
              ))}
              {userNotes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No notes yet. Click the note button to add one!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Learning Progress</span>
          <span className="text-sm text-gray-600">
            Watch time: {Math.floor(watchTime / 60)}m {watchTime % 60}s
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default VideoTrainingPlayer;
