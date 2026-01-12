"use client";

import React, { useState, useEffect, useDeferredValue, useMemo } from "react";
import { 
  Globe,
  Ghost,
  Music,
  Gamepad2,
  Hammer,
  Eye,
  Star,
  Heart,
  Smile,
  Cpu,
  Code2,
  ShieldAlert, 
  Lock, 
  User, 
  Activity, 
  Server, 
  Bot, 
  Terminal, 
  Database,
  Search,
  Settings,
  AlertTriangle,
  Trash2,
  Edit3,
  Power,
  RefreshCcw,
  Zap,
  Plus,
  X,
  Save,
  Palette,
  Tag,
  Info,
  Link,
  GitBranch,
  FileCode,
  FolderOpen,
  ChevronRight,
  Play,
  Square,
  Upload,
  FilePlus,
  FolderPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast, Toaster } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ICON_MAP: Record<string, any> = {
  Cpu, Bot, Terminal, Zap, ShieldAlert, Globe, Activity, Code2, Ghost, Music, Gamepad2, Hammer, Eye, Star, Heart, Smile, Server, Database
};

interface BotData {
  id: string;
  name: string;
  status: string;
  cpu: string;
  ram: string;
  uptime: string;
  version: string;
  description: string;
  tags: string[];
  color: string;
  icon: string;
  invite_url: string;
  discord_token?: string;
  server_count?: number;
  user_count?: number;
  start_time?: string;
  ping?: number;
  command_count?: number;
  directory_path?: string;
  startup_command?: string;
  pid?: number;
}

function calculateUptime(startTime?: string) {
  if (!startTime) return "0m";
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const diff = now - start;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function BotTerminal({ botId }: { botId: string }) {
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/bots/${botId}/logs`);
      const data = await res.json();
      if (typeof data.logs === "string") {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 500);
    return () => clearInterval(interval);
  }, [botId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={scrollRef}
      className="bg-black/90 border border-white/10 rounded-sm p-3 font-mono text-[9px] h-48 overflow-y-auto mt-2 scroll-smooth"
    >
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5 sticky top-0 bg-black/90 z-10">
        <span className="text-primary opacity-50 uppercase tracking-widest">Bot_Terminal_v2.5</span>
        <span className="text-[8px] opacity-30">AUTO_REFRESH: 0.5S</span>
      </div>
      {isLoading && !logs ? (
        <div className="animate-pulse opacity-40">WAITING_FOR_STREAMS...</div>
      ) : (
        <pre className="whitespace-pre-wrap opacity-80 leading-relaxed">
          {logs || "NO_LOG_DATA_DETECTED"}
        </pre>
      )}
      <div className="animate-pulse mt-1">
        <span className="text-primary opacity-50">{">"}</span>
        <span className="w-1.5 h-3 bg-white/20 inline-block ml-1" />
      </div>
    </div>
  );
}

function FileManager({ botId, botName, onClose }: { botId: string, botName: string, onClose: () => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<"file" | "folder" | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const deferredContent = useDeferredValue(fileContent);

  const getFileInfo = (name: string, isDirectory: boolean) => {
    if (isDirectory) return { icon: FolderOpen, color: "text-blue-400", bg: "bg-blue-400/5" };
    
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return { icon: FileCode, color: "text-[#3776AB]", bg: "bg-[#3776AB]/10" }; 
      case 'js':
      case 'jsx': return { icon: FileCode, color: "text-[#F7DF1E]", bg: "bg-[#F7DF1E]/10" }; 
      case 'ts':
      case 'tsx': return { icon: FileCode, color: "text-[#3178C6]", bg: "bg-[#3178C6]/10" }; 
      case 'json': return { icon: Database, color: "text-[#CBCB41]", bg: "bg-[#CBCB41]/10" };
      case 'md': return { icon: Info, color: "text-[#083FA1]", bg: "bg-[#083FA1]/10" };
      case 'env': return { icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" };
      case 'txt':
      case 'log': return { icon: Terminal, color: "text-zinc-400", bg: "bg-zinc-400/5" };
      case 'html': return { icon: Globe, color: "text-[#E34F26]", bg: "bg-[#E34F26]/10" };
      case 'css': return { icon: Palette, color: "text-[#1572B6]", bg: "bg-[#1572B6]/10" };
      case 'yml':
      case 'yaml': return { icon: Settings, color: "text-purple-400", bg: "bg-purple-400/10" };
      case 'sh': return { icon: Terminal, color: "text-emerald-400", bg: "bg-emerald-400/10" };
      default: return { icon: FileCode, color: "text-zinc-500", bg: "bg-zinc-500/5" };
    }
  };

  const fetchFiles = async (path: string = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bots/${botId}/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.files) setFiles(data.files);
      setCurrentPath(path);
    } catch (err) {
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = (file: any) => {
    if (file.isDirectory) {
      fetchFiles(file.relativePath);
    } else {
      loadFileContent(file.relativePath);
    }
  };

  const goBack = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    fetchFiles(parts.join("/"));
  };

  const loadFileContent = async (fileName: string) => {
    setSelectedFile(fileName);
    setIsContentLoading(true);
    setFileContent("");
    try {
      const res = await fetch(`/api/bots/${botId}/files/content?file=${encodeURIComponent(fileName)}`);
      const data = await res.json();
      setFileContent(data.content || "");
    } catch (err) {
      toast.error("Failed to load file content");
    } finally {
      setIsContentLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/bots/${botId}/files/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedFile, content: fileContent })
      });
      if (res.ok) {
        toast.success("File saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('currentPath', currentPath);

    const processEntry = async (entry: FileSystemEntry, basePath: string = "") => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise<void>((resolve) => {
          fileEntry.file((file) => {
            formData.append('files', file);
            formData.append('relativePaths', basePath ? `${basePath}/${file.name}` : file.name);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        return new Promise<void>((resolve) => {
          reader.readEntries(async (entries) => {
            for (const subEntry of entries) {
              await processEntry(subEntry, basePath ? `${basePath}/${entry.name}` : entry.name);
            }
            resolve();
          });
        });
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        await processEntry(entry);
      }
    }

    try {
      const res = await fetch(`/api/bots/${botId}/files`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success("Files uploaded successfully");
        fetchFiles(currentPath);
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('currentPath', currentPath);

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
      formData.append('relativePaths', files[i].name);
    }

    try {
      const res = await fetch(`/api/bots/${botId}/files`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success("Files uploaded successfully");
        fetchFiles(currentPath);
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createItem = async () => {
    if (!newItemName.trim()) return;
    
    const formData = new FormData();
    formData.append('action', showCreateModal === 'file' ? 'createFile' : 'createFolder');
    formData.append('currentPath', currentPath);
    formData.append(showCreateModal === 'file' ? 'fileName' : 'folderName', newItemName.trim());

    try {
      const res = await fetch(`/api/bots/${botId}/files`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success(`${showCreateModal === 'file' ? 'File' : 'Folder'} created`);
        fetchFiles(currentPath);
        setShowCreateModal(null);
        setNewItemName("");
      } else {
        toast.error("Creation failed");
      }
    } catch (err) {
      toast.error("Creation failed");
    }
  };

  const deleteItem = async (filePath: string) => {
    try {
      const res = await fetch(`/api/bots/${botId}/files`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      if (res.ok) {
        toast.success("Deleted successfully");
        if (selectedFile === filePath) {
          setSelectedFile(null);
          setFileContent("");
        }
        fetchFiles(currentPath);
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getLanguage = (name: string | null) => {
    if (!name) return 'text';
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'python';
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'yml':
      case 'yaml': return 'yaml';
      case 'sh': return 'bash';
      default: return 'text';
    }
  };

  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const highlighterRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = e.currentTarget.scrollTop;
      highlighterRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const HighlightedCode = useMemo(() => {
    return (
      <SyntaxHighlighter
        language={getLanguage(selectedFile)}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: '24px',
          fontSize: '12px',
          lineHeight: '1.5',
          background: 'transparent',
          minWidth: '100%',
          minHeight: '100%',
          overflow: 'visible',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'pre',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'JetBrains Mono, monospace',
            background: 'transparent',
          }
        }}
      >
        {deferredContent || " "}
      </SyntaxHighlighter>
    );
  }, [deferredContent, selectedFile]);

  useEffect(() => {
    fetchFiles();
  }, [botId]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <div className="w-full max-w-6xl h-[85vh] bg-black border border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            File_Manager: {botName}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCreateModal('file')}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-colors"
              title="New File"
            >
              <FilePlus className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setShowCreateModal('folder')}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-sm transition-colors"
              title="Upload Files"
            >
              <Upload className="w-3 h-3" />
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileInputChange}
            />
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-sm transition-colors ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div 
          className={`flex-1 flex overflow-hidden relative ${isDragging ? 'ring-2 ring-primary ring-inset' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 z-10 flex items-center justify-center pointer-events-none">
              <div className="text-primary text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Drop files here
              </div>
            </div>
          )}
          
          {/* File List */}
          <div className="w-72 border-r border-white/10 overflow-y-auto bg-black/50 p-4 space-y-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <div className="flex flex-col">
                <div className="text-[9px] font-mono text-primary/50 uppercase tracking-[0.2em] mb-1">Current_Location</div>
                <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest truncate max-w-[140px] flex items-center gap-1">
                  <FolderOpen className="w-2.5 h-2.5 opacity-50" />
                  {currentPath || "Root"}
                </div>
              </div>
              {currentPath && (
                <button 
                  onClick={goBack}
                  className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] text-primary hover:bg-white/10 rounded-sm font-bold uppercase transition-all"
                >
                  BACK
                </button>
              )}
            </div>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-white/5 rounded-sm" />)}
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-30">
                <FolderOpen className="w-8 h-8 mb-2" />
                <div className="text-[10px] uppercase tracking-widest font-mono">Empty_Directory</div>
              </div>
            ) : (
              files.map((file) => {
                const { icon: Icon, color, bg } = getFileInfo(file.name, file.isDirectory);
                return (
                  <div key={file.name} className="group flex items-center gap-1">
                    <button
                      onClick={() => handleFileClick(file)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-sm transition-all text-[11px] font-mono border border-transparent ${
                        selectedFile === file.relativePath 
                          ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]" 
                          : `hover:bg-white/5 text-zinc-400 hover:text-zinc-200`
                      }`}
                    >
                      <div className={`p-1 rounded-sm ${bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <span className="truncate flex-1 text-left">{file.name}</span>
                      {file.isDirectory && <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />}
                    </button>
                    <button 
                      onClick={() => deleteItem(file.relativePath)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col bg-zinc-950/50 relative">
            {selectedFile ? (
              <>
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-black/40 z-20">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono opacity-50 uppercase truncate max-w-md">Editing_Active</span>
                    <span className="text-[9px] font-mono text-primary truncate max-w-md uppercase tracking-widest">{selectedFile}</span>
                  </div>
                  <button 
                    onClick={saveFile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-all text-[10px] font-bold uppercase disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                  >
                    <Save className="w-3 h-3" />
                    {isSaving ? "SAVING..." : "SAVE_CHANGES"}
                  </button>
                </div>
                <div className="flex-1 relative group/editor overflow-hidden">
                  {isContentLoading ? (
                    <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="w-6 h-6 text-primary animate-spin" />
                        <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">Loading_Content...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col">
                      <div className="flex-1 relative overflow-hidden">
                        <div 
                          ref={highlighterRef}
                          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
                        >
                          {HighlightedCode}
                        </div>
                        <textarea
                          ref={editorRef}
                          value={fileContent}
                          onScroll={handleScroll}
                          onChange={(e) => setFileContent(e.target.value)}
                          className="absolute inset-0 w-full h-full bg-transparent p-6 font-mono text-[12px] outline-none resize-none leading-[1.5] text-white/5 caret-white selection:bg-primary/40 selection:text-white z-10 overflow-auto whitespace-pre scrollbar-thin scrollbar-thumb-white/10"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          spellCheck={false}
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                        />
                      </div>
                      <div className="px-6 py-2 text-[9px] font-mono opacity-20 border-t border-white/5 uppercase tracking-widest flex justify-between items-center bg-black/20">
                        <span>Line_Sync: Active | Language: {getLanguage(selectedFile)}</span>
                        <span>{fileContent.split('\n').length} Lines</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-8">
                <Upload className="w-16 h-16 mb-4" />
                <p className="text-xs uppercase tracking-[0.2em] font-mono">Drag & drop files or select a file to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black border border-white/10 rounded-sm p-6 w-80"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                {showCreateModal === 'file' ? <FilePlus className="w-4 h-4 text-primary" /> : <FolderPlus className="w-4 h-4 text-primary" />}
                Create {showCreateModal === 'file' ? 'File' : 'Folder'}
              </h3>
              <input 
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={showCreateModal === 'file' ? 'filename.py' : 'folder-name'}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && createItem()}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowCreateModal(null); setNewItemName(""); }}
                  className="flex-1 py-2 border border-white/10 text-xs font-bold rounded-sm hover:bg-white/5"
                >
                  CANCEL
                </button>
                <button 
                  onClick={createItem}
                  className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-sm hover:opacity-90"
                >
                  CREATE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openTerminalId, setOpenTerminalId] = useState<string | null>(null);
  const [openFileManager, setOpenFileManager] = useState<{ id: string, name: string } | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING_AUTH_PROTOCOL...",
    "HANDSHAKE_STARTED...",
    "WAITING_FOR_CREDENTIALS..."
  ]);

  const [bots, setBots] = useState<BotData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<BotData | null>(null);
  const [editingBot, setEditingBot] = useState<BotData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    status: "ONLINE",
    cpu: "0%",
    ram: "0MB",
    uptime: "0m",
    version: "v1.0.0",
    description: "",
    tags: "",
    color: "text-primary",
    icon: "Cpu",
    discord_token: "",
    invite_url: "",
    directory_path: "",
    startup_command: "python3 bot.py"
  });

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bots");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBots(data);
      }
    } catch (err) {
      toast.error("Failed to fetch bots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleControl = async (id: string, action: "START" | "STOP") => {
    try {
      const res = await fetch(`/api/bots/${id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Bot ${action === 'START' ? 'started' : 'stopped'} successfully`);
        fetchBots();
      } else {
        toast.error(data.error || "Control action failed");
      }
    } catch (err) {
      toast.error("Control action failed");
    }
  };

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-10), msg]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    addLog(`ATTEMPTING_LOGIN: ${username}`);

    setTimeout(() => {
      if (username === "onlydex" && code === "onlydex") {
        addLog("ACCESS_GRANTED");
        addLog("REDIRECTING_TO_MAINFRAME...");
        setTimeout(() => {
          setIsAuthorized(true);
          localStorage.setItem("admin_session", "true");
        }, 500);
      } else {
        addLog("ACCESS_DENIED: INVALID_CREDENTIALS");
        setError("INVALID_CREDENTIALS // ACCESS_DENIED");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session === "true") {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchBots();
    }
  }, [isAuthorized]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setIsAuthorized(false);
    setUsername("");
    setCode("");
    setTerminalLogs([
      "SESSION_TERMINATED",
      "WAITING_FOR_CREDENTIALS..."
    ]);
  };

  const initiateDelete = (bot: BotData) => {
    setBotToDelete(bot);
    setIsDeleteModalOpen(true);
  };

  const deleteBot = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/bots/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${name} decommissioned successfully.`);
        fetchBots();
        setIsDeleteModalOpen(false);
        setBotToDelete(null);
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const handleOpenModal = (bot?: BotData) => {
    if (bot) {
      setEditingBot(bot);
      setFormData({
        name: bot.name,
        status: bot.status,
        cpu: bot.cpu,
        ram: bot.ram,
        uptime: bot.uptime,
        version: bot.version || "v1.0.0",
        description: bot.description || "",
        tags: Array.isArray(bot.tags) ? bot.tags.join(", ") : "",
        color: bot.color || "text-primary",
        icon: bot.icon || "Cpu",
        discord_token: bot.discord_token || "",
        invite_url: bot.invite_url || "",
        directory_path: bot.directory_path || "",
        startup_command: bot.startup_command || "python3 bot.py"
      });
    } else {
      setEditingBot(null);
      setFormData({
        name: "",
        status: "ONLINE",
        cpu: "0%",
        ram: "0MB",
        uptime: "0m",
        version: "v1.0.0",
        description: "",
        tags: "",
        color: "text-primary",
        icon: "Cpu",
        discord_token: "",
        invite_url: "",
        directory_path: "",
        startup_command: "python3 bot.py"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingBot ? `/api/bots/${editingBot.id}` : "/api/bots";
      const method = editingBot ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== "")
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingBot ? "Bot updated" : "Bot added");
        setIsModalOpen(false);
        fetchBots();
      } else {
        toast.error("Operation failed");
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black selection:bg-primary/30 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl grid md:grid-cols-2 bg-black border border-white/10 rounded-sm shadow-2xl overflow-hidden"
          >
            <div className="bg-white/[0.02] p-8 border-r border-white/10 font-mono text-[10px] space-y-2 hidden md:block">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 opacity-40 uppercase tracking-widest">Auth_Terminal</span>
              </div>
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary opacity-50">{">"}</span>
                  <span className={log.includes("DENIED") ? "text-red-500" : log.includes("GRANTED") ? "text-emerald-500" : "opacity-70"}>{log}</span>
                </div>
              ))}
              <div className="flex gap-2 animate-pulse">
                <span className="text-primary opacity-50">{">"}</span>
                <span className="w-2 h-4 bg-white/20" />
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-sm flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tighter uppercase">Admin Panel Login</h1>
                <p className="text-[9px] text-muted-foreground font-mono mt-1 uppercase tracking-[0.2em] opacity-50">
                  onlydex_mainframe_access
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">User_Identity</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-colors font-mono placeholder:opacity-30"
                      placeholder="ENTER_USERNAME"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">Access_Cipher</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-colors font-mono placeholder:opacity-30"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-mono text-red-500 bg-red-500/5 border border-red-500/20 p-2 rounded-sm text-center uppercase"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase"
                >
                  {isSubmitting ? "AUTHORIZING..." : "INITIALIZE_MAINFRAME"}
                </button>
              </form>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 text-white">
      <Toaster theme="dark" position="bottom-right" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-mono rounded-sm animate-pulse">
                SESSION_ACTIVE
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">OPERATOR: onlydex</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Admin Panel_</h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs italic opacity-60">// Total control over the ArchBots ecosystem</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-sm active:scale-95 transition-all flex items-center gap-2"
          >
            <Power className="w-3 h-3" />
            TERMINATE_SESSION
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Nodes", value: "142", icon: Server, color: "text-blue-400" },
            { label: "Load", value: "24.8%", icon: Activity, color: "text-primary" },
            { label: "Agents", value: bots.length.toString(), icon: Bot, color: "text-purple-400" },
            { label: "Health", value: "OPTIMAL", icon: Database, color: "text-emerald-400" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-6 rounded-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tracking-tighter">{stat.value}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${stat.color} animate-pulse`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          <div className="space-y-8">
            <section className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Bot_Management_Console
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="SEARCH_AGENTS..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-black border border-white/10 rounded-sm py-1 pl-8 pr-4 text-[10px] font-mono outline-none focus:border-primary/50 transition-colors w-40"
                    />
                  </div>
                  <button 
                    onClick={fetchBots}
                    className="p-1.5 bg-white/5 border border-white/10 text-white rounded-sm hover:bg-white/10 transition-all"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-all text-[10px] font-bold uppercase"
                  >
                    <Plus className="w-3 h-3" />
                    ADD_BOT
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono min-w-[800px]">
                  <thead className="bg-white/[0.01] border-b border-white/5 text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-3 font-medium">Agent_Name</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Ping</th>
                      <th className="px-6 py-3 font-medium">Commands</th>
                      <th className="px-6 py-3 font-medium">Uptime</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse uppercase tracking-widest">
                          FETCHING_ENCRYPTED_DATA...
                        </td>
                      </tr>
                    ) : filteredBots.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground uppercase tracking-widest">
                          NO_AGENTS_FOUND
                        </td>
                      </tr>
                    ) : (
                      filteredBots.map((bot) => (
                        <React.Fragment key={bot.id}>
                          <tr className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{bot.name}</span>
                                {bot.pid && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title={`PID: ${bot.pid}`} />}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full bg-current ${
                                  bot.status === 'ONLINE' ? 'text-emerald-400' : 
                                  bot.status === 'MAINTENANCE' ? 'text-amber-400' : 
                                  bot.status === 'IDLE' ? 'text-blue-400' : 
                                  bot.status === 'DND' ? 'text-red-500' : 'text-zinc-500'
                                } animate-pulse`} />
                                <span className={
                                  bot.status === 'ONLINE' ? 'text-emerald-400' : 
                                  bot.status === 'MAINTENANCE' ? 'text-amber-400' : 
                                  bot.status === 'IDLE' ? 'text-blue-400' : 
                                  bot.status === 'DND' ? 'text-red-500' : 'text-zinc-500'
                                }>{bot.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-amber-400/80">{bot.status === 'ONLINE' ? `${bot.ping || 0}ms` : '-'}</td>
                            <td className="px-6 py-4 text-emerald-400/80">{bot.status === 'ONLINE' ? (bot.command_count || 0).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 opacity-60">{bot.status === 'ONLINE' ? calculateUptime(bot.start_time) : '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {bot.status === 'ONLINE' ? (
                                  <button 
                                    onClick={() => handleControl(bot.id, "STOP")}
                                    className="p-1.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded hover:bg-red-500/20 transition-all"
                                    title="Stop Bot"
                                  >
                                    <Square className="w-3 h-3 fill-current" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleControl(bot.id, "START")}
                                    className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded hover:bg-emerald-500/20 transition-all"
                                    title="Start Bot"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setOpenFileManager({ id: bot.id, name: bot.name })}
                                  className="p-1.5 bg-white/5 border border-white/10 hover:text-primary transition-colors rounded"
                                  title="File Manager"
                                >
                                  <FolderOpen className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => setOpenTerminalId(openTerminalId === bot.id ? null : bot.id)}
                                  className={`p-1.5 transition-colors border rounded ${openTerminalId === bot.id ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 hover:text-primary'}`}
                                  title="Toggle Terminal"
                                >
                                  <Terminal className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleOpenModal(bot)}
                                  className="p-1.5 hover:text-primary transition-colors bg-white/5 border border-white/10 rounded"
                                  title="Edit Bot"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => initiateDelete(bot)}
                                  className="p-1.5 hover:text-red-500 transition-colors bg-white/5 border border-white/10 rounded"
                                  title="Delete Bot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {openTerminalId === bot.id && (
                            <tr>
                              <td colSpan={6} className="px-6 pb-4 pt-0">
                                <BotTerminal botId={bot.id} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {openFileManager && (
          <FileManager 
            botId={openFileManager.id} 
            botName={openFileManager.name} 
            onClose={() => setOpenFileManager(null)} 
          />
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-black border border-white/10 rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  {editingBot ? <Edit3 className="w-3 h-3 text-primary" /> : <Plus className="w-3 h-3 text-primary" />}
                  {editingBot ? "EDIT_BOT_CONFIG" : "DEPLOY_NEW_BOT"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-sm transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Bot className="w-3 h-3" /> Agent_Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="e.g. AstraCore"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <FolderOpen className="w-3 h-3" /> Directory_Path
                    </label>
                    <input 
                      type="text" 
                      value={formData.directory_path}
                      onChange={(e) => setFormData({ ...formData, directory_path: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="e.g. bots/astra-core"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Play className="w-3 h-3" /> Startup_Command
                    </label>
                    <input 
                      type="text" 
                      value={formData.startup_command}
                      onChange={(e) => setFormData({ ...formData, startup_command: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="e.g. python3 bot.py"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <GitBranch className="w-3 h-3" /> Version
                    </label>
                    <input 
                      type="text" 
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="e.g. v4.2.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Initial_Status
                    </label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono appearance-none"
                    >
                      <option value="ONLINE" className="bg-zinc-900">ONLINE</option>
                      <option value="IDLE" className="bg-zinc-900">IDLE</option>
                      <option value="DND" className="bg-zinc-900">DND (DO_NOT_DISTURB)</option>
                      <option value="MAINTENANCE" className="bg-zinc-900">MAINTENANCE</option>
                      <option value="OFFLINE" className="bg-zinc-900">OFFLINE</option>
                    </select>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Palette className="w-3 h-3" /> Accent_Color
                    </label>
                    <select 
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono appearance-none"
                    >
                      <option value="text-primary" className="bg-zinc-900">Emerald (Default)</option>
                      <option value="text-purple-400" className="bg-zinc-900">Purple</option>
                      <option value="text-blue-400" className="bg-zinc-900">Blue</option>
                      <option value="text-cyan-400" className="bg-zinc-900">Cyan</option>
                      <option value="text-sky-400" className="bg-zinc-900">Sky</option>
                      <option value="text-indigo-400" className="bg-zinc-900">Indigo</option>
                      <option value="text-violet-400" className="bg-zinc-900">Violet</option>
                      <option value="text-fuchsia-400" className="bg-zinc-900">Fuchsia</option>
                      <option value="text-pink-400" className="bg-zinc-900">Pink</option>
                      <option value="text-rose-400" className="bg-zinc-900">Rose</option>
                      <option value="text-orange-400" className="bg-zinc-900">Orange</option>
                      <option value="text-amber-400" className="bg-zinc-900">Amber</option>
                      <option value="text-lime-400" className="bg-zinc-900">Lime</option>
                      <option value="text-teal-400" className="bg-zinc-900">Teal</option>
                      <option value="text-zinc-400" className="bg-zinc-900">Zinc</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> Discord_Bot_Token (Private)
                    </label>
                    <input 
                      type="password" 
                      value={formData.discord_token}
                      onChange={(e) => setFormData({ ...formData, discord_token: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="MTAyMzQ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Link className="w-3 h-3" /> Invite_Link
                    </label>
                    <input 
                      type="url" 
                      value={formData.invite_url}
                      onChange={(e) => setFormData({ ...formData, invite_url: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono"
                      placeholder="https://discord.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3 h-3" /> Description
                    </label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-sm py-2 px-3 text-sm focus:border-primary/50 outline-none transition-colors font-mono h-24 resize-none"
                      placeholder="Detailed bot description..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 flex gap-3 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-white/10 text-xs font-bold rounded-sm hover:bg-white/5 transition-all uppercase"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase"
                  >
                    <Save className="w-3 h-3" />
                    {isSubmitting ? "PROCESSING..." : (editingBot ? "UPDATE_BOT" : "DEPLOY_BOT")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && botToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-black border border-red-500/20 rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-red-500/10 flex items-center justify-between bg-red-500/5">
                <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-3 h-3" />
                  CONFIRM_DECOMMISSION
                </h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 hover:bg-white/10 rounded-sm transition-colors text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm font-mono text-muted-foreground leading-relaxed uppercase">
                  Are you sure you want to decommission <span className="text-white font-bold">{botToDelete.name}</span>? This action is irreversible and will purge all agent data from the mainframe.
                </p>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 border border-white/10 text-xs font-bold rounded-sm hover:bg-white/5 transition-all uppercase text-white"
                  >
                    ABORT
                  </button>
                  <button 
                    onClick={() => deleteBot(botToDelete.id, botToDelete.name)}
                    className="flex-1 py-3 bg-red-600 text-white text-xs font-bold rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    CONFIRM_PURGE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
