/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Play, 
  Square, 
  Settings, 
  Type, 
  Palette, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  Download,
  Trash2,
  Edit3,
  Check,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface TeleprompterConfig {
  fontSize: number;
  color: string;
  speed: number;
  opacity: number;
}

export default function App() {
  // Camera & Recording State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Teleprompter State
  const [text, setText] = useState('欢迎使用蔡哥保平安提词器！点击右侧编辑按钮修改文字。您可以调节滚动速度、字体大小和颜色。录制完成后，视频将自动生成下载链接。');
  const [isEditing, setIsEditing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [config, setConfig] = useState<TeleprompterConfig>({
    fontSize: 32,
    color: '#ffffff',
    speed: 2,
    opacity: 0.4
  });
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Dragging State Refs
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const scrollPosRef = useRef(0);

  // Initialize Camera
  const initCamera = useCallback(async () => {
    try {
      // 1. Stop all existing tracks using the ref to ensure we catch everything
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // 2. Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // 3. Request new stream with flexible constraints
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = newStream;
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Auto-play failed:", playErr);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback to basic constraints
      try {
        const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = basicStream;
        setStream(basicStream);
        if (videoRef.current) videoRef.current.srcObject = basicStream;
      } catch (retryErr) {
        console.error("Retry failed:", retryErr);
      }
    }
  }, [facingMode]);

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  // Scrolling Logic
  const animate = useCallback(() => {
    if (isScrolling && scrollContainerRef.current && !isDragging.current) {
      scrollPosRef.current += config.speed * 0.3; // Base speed
      const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
      
      if (scrollPosRef.current >= maxScroll) {
        scrollPosRef.current = maxScroll;
        setIsScrolling(false);
      }
      
      scrollContainerRef.current.scrollTop = scrollPosRef.current;
    } else if (scrollContainerRef.current) {
      // Sync ref with manual scroll
      scrollPosRef.current = scrollContainerRef.current.scrollTop;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isScrolling, config.speed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startY.current = e.pageY - scrollContainerRef.current.offsetTop;
    startScrollTop.current = scrollContainerRef.current.scrollTop;
    setIsScrolling(false); // Pause auto-scroll on manual interaction
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walk = (y - startY.current) * 1.5; // Drag sensitivity
    scrollContainerRef.current.scrollTop = startScrollTop.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = () => {
    setIsScrolling(false); // Pause auto-scroll on touch
  };

  // Recording Logic
  const startRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    setVideoUrl(null);
    
    const mimeTypes = [
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
    
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };
    
    mediaRecorderRef.current = recorder;
    recorder.start(1000); // Collect data every second to be safe
    setIsRecording(true);
    setIsScrolling(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsScrolling(false);
    }
  };


  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleDownload = async () => {
    if (!videoUrl) return;

    // Try Web Share API first (best for mobile "Save to Photos")
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], `teleprompter_${new Date().getTime()}.mp4`, { type: 'video/mp4' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '提词器录制视频',
          });
          return;
        }
      } catch (err) {
        console.error("Share failed:", err);
      }
    }

    // Fallback to traditional download
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `teleprompter_video_${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '蔡哥保平安提词器',
          text: '推荐一个超好用的专业口播提词器！',
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share app failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('应用链接已复制到剪贴板，快去分享给朋友吧！');
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans text-white">
      {/* App Icon/Logo */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3 pointer-events-none">
        <span className="font-bold text-lg tracking-tight drop-shadow-md hidden sm:block">蔡哥保平安提词器</span>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/20 bg-sky-500 flex items-center justify-center">
          <img 
            src="https://files.oaiusercontent.com/file-S4Y2f8X9J8X9J8X9J8X9J8X9" 
            alt="App Icon" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      {/* Teleprompter Overlay */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingBottom: '20vh' }}
      >
        <div 
          ref={scrollContainerRef}
          className="w-full max-w-2xl h-[50vh] overflow-y-auto pointer-events-auto hide-scrollbar select-none active:cursor-grabbing cursor-grab"
          style={{ 
            backgroundColor: `rgba(0,0,0,${config.opacity})`,
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
        >
          <div className="py-[25vh] px-8">
            <p 
              style={{ 
                fontSize: `${config.fontSize}px`, 
                color: config.color,
                lineHeight: 1.5,
                textAlign: 'center',
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {text}
            </p>
          </div>
        </div>
        
        {/* Focus Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-500/50 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Main Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-6">
        
        {/* Top Row: Quick Actions */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>

          <div className="flex gap-4">
            <button 
              onClick={shareApp}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
              title="分享应用"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => {
                scrollPosRef.current = 0;
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
              }}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button 
              onClick={toggleCamera}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
            >
              <Edit3 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Recording */}
        <div className="flex justify-center items-center gap-8">
          <button 
            onClick={() => setIsScrolling(!isScrolling)}
            className={`p-4 rounded-full transition-all ${isScrolling ? 'bg-emerald-500' : 'bg-white/20'}`}
          >
            {isScrolling ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>

          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
              isRecording ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/10'
            }`}
          >
            <div className={`transition-all ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-14 h-14 bg-red-500 rounded-full'}`} />
          </button>

          <div className="w-14" /> {/* Spacer */}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-8 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">提词器设置</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Font Size */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span className="flex items-center gap-2"><Type className="w-4 h-4" /> 字号</span>
                  <span>{config.fontSize}px</span>
                </div>
                <input 
                  type="range" min="16" max="64" value={config.fontSize}
                  onChange={(e) => setConfig({...config, fontSize: parseInt(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Speed */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 滚动速度</span>
                  <span>{config.speed}x</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={config.speed}
                  onChange={(e) => setConfig({...config, speed: parseFloat(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Color */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span className="flex items-center gap-2"><Palette className="w-4 h-4" /> 文字颜色</span>
                </div>
                <div className="flex gap-4">
                  {['#ffffff', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setConfig({...config, color: c})}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${config.color === c ? 'scale-125 border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-[60] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">编辑台词</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full font-bold"
              >
                <Check className="w-5 h-5" /> 完成
              </button>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-zinc-900 rounded-2xl p-6 text-xl outline-none border border-zinc-800 focus:border-emerald-500 transition-colors resize-none"
              placeholder="请输入您的台词..."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Result */}
      <AnimatePresence>
        {videoUrl && !isRecording && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-[70] bg-black/90 flex items-center justify-center p-6"
          >
            <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md space-y-6">
              <h3 className="text-2xl font-bold text-center">录制完成！</h3>
              <video src={videoUrl} controls className="w-full rounded-xl aspect-video bg-black" />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-4 bg-emerald-500 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                >
                  <Download className="w-5 h-5" /> 保存视频
                </button>
                <button 
                  onClick={() => setVideoUrl(null)}
                  className="flex items-center justify-center gap-2 py-4 bg-zinc-800 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> 重新录制
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
