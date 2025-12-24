"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  CssBaseline,
  Switch,
  Box,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MovieIcon from "@mui/icons-material/Movie";
import ImageIcon from "@mui/icons-material/Image";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

type NoteItem = {
  id: string;
  title: string;
  html: string;          // rich content (HTML)
  timestamp: number;
  tags: string[];
  pinned: boolean;
  category?: string;
};

type SnackSeverity = "success" | "info" | "warning" | "error";
type Snack = { open: boolean; message: string; severity: SnackSeverity };

type AssetKind = "pdf" | "image" | "video" | "other";
type Asset = {
  id: string;
  name: string;
  kind: AssetKind;
  type: string;
  size: number;
  created: number;
  file: File;
  folder?: string;       // simple categorization
};

// Web Share API types
type ShareData = {
  title?: string;
  text?: string;
  url?: string;
};
type NavigatorShare = Navigator & {
  share?: (data: ShareData) => Promise<void>;
};
const isWebShareAvailable = (nav: Navigator): nav is NavigatorShare =>
  typeof (nav as NavigatorShare).share === "function";

// IndexedDB helpers
const dbName = "studyProDB";
const storeName = "assets";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function addAsset(id: string, record: Omit<Asset, "id"> & { id: string }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function getAllAssets(): Promise<Asset[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Asset[]);
    req.onerror = () => reject(req.error);
  });
}
async function deleteAsset(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
function fileToObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

// Rich text editor component (contentEditable, no external libs)
type RichTextEditorProps = {
  html: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
};
function RichTextEditor({ html, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const exec = (cmd: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList" | "formatBlock", value?: string) => {
    document.execCommand(cmd, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const applyHeading = (level: 1 | 2 | 3) => exec("formatBlock", `h${level}`);
  const undo = () => {
    document.execCommand("undo");
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const redo = () => {
    document.execCommand("redo");
    if (ref.current) onChange(ref.current.innerHTML);
  };
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Tooltip title="Bold"><IconButton onClick={() => exec("bold")}><FormatBoldIcon /></IconButton></Tooltip>
        <Tooltip title="Italic"><IconButton onClick={() => exec("italic")}><FormatItalicIcon /></IconButton></Tooltip>
        <Tooltip title="Underline"><IconButton onClick={() => exec("underline")}><FormatUnderlinedIcon /></IconButton></Tooltip>
        <Tooltip title="Bulleted list"><IconButton onClick={() => exec("insertUnorderedList")}><FormatListBulletedIcon /></IconButton></Tooltip>
        <Tooltip title="Numbered list"><IconButton onClick={() => exec("insertOrderedList")}><FormatListNumberedIcon /></IconButton></Tooltip>
        <Tooltip title="Heading 1"><IconButton onClick={() => applyHeading(1)}><TitleIcon /></IconButton></Tooltip>
        <Tooltip title="Undo"><IconButton onClick={undo}><UndoIcon /></IconButton></Tooltip>
        <Tooltip title="Redo"><IconButton onClick={redo}><RedoIcon /></IconButton></Tooltip>
      </Stack>
      <Box
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        sx={{
          minHeight: 200,
          p: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          fontSize: 15,
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: html || "" }}
        aria-placeholder={placeholder}
      />
    </Stack>
  );
}

// Main page
export default function Page() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [tab, setTab] = useState<number>(0);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [snackbar, setSnackbar] = useState<Snack>({ open: false, message: "", severity: "success" });
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  const [library, setLibrary] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [renameAsset, setRenameAsset] = useState<Asset | null>(null);

  const [searchNotes, setSearchNotes] = useState<string>("");
  const [searchLibrary, setSearchLibrary] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteHtml, setNoteHtml] = useState<string>("");
  const [editNote, setEditNote] = useState<NoteItem | null>(null);

  useEffect(() => {
    try {
      const m = localStorage.getItem("mui-mode");
      if (m === "dark" || m === "light") setMode(m);
      const rawNotes = localStorage.getItem("notes");
      if (rawNotes) setNotes(JSON.parse(rawNotes) as NoteItem[]);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("mui-mode", mode);
  }, [mode]);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const items = await getAllAssets();
        setLibrary(items);
      } catch {}
    })();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1976d2" },
          secondary: { main: "#9c27b0" },
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  const showSnack = (message: string, severity: SnackSeverity = "success") =>
    setSnackbar({ open: true, message, severity });

  const extractTags = (html: string): string[] => {
    const text = html.replace(/<[^>]+>/g, " ");
    const words = text.split(/\W+/).filter((w) => w.length > 3);
    const unique = Array.from(new Set(words));
    return unique.slice(0, 8);
  };

  const addNote = () => {
    if (!noteHtml.trim()) return showSnack("Write some content", "warning");
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const newNote: NoteItem = {
      id,
      title: noteTitle.trim() || "Untitled",
      html: noteHtml,
      timestamp: Date.now(),
      tags: extractTags(noteHtml),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle("");
    setNoteHtml("");
    showSnack("Note saved", "success");
  };

  const updateNote = (updated: NoteItem) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    showSnack("Note updated", "success");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showSnack("Note deleted", "info");
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.timestamp - a.timestamp)
    );
  };

  const copyHtml = async (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      showSnack("Copied", "info");
    } catch {
      showSnack("Copy failed", "error");
    }
  };

  const shareNote = async (note: NoteItem) => {
    const text = `${note.title}\n${new Date(note.timestamp).toLocaleString()}\n\n${note.html.replace(/<[^>]+>/g, " ")}`;
    try {
      if (isWebShareAvailable(navigator)) {
        await navigator.share({ title: note.title, text });
        showSnack("Shared", "success");
      } else {
        await navigator.clipboard.writeText(text);
        showSnack("Share unavailable; copied instead", "info");
      }
    } catch {
      await navigator.clipboard.writeText(text);
      showSnack("Share failed; copied instead", "warning");
    }
  };

  const exportNotesJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notes-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showSnack("Exported JSON", "success");
    } catch {
      showSnack("Export failed", "error");
    }
  };

  const importNotesJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      if (!Array.isArray(data)) throw new Error("Invalid format");
      const clean: NoteItem[] = data
        .filter((n) => n && typeof n === "object")
        .map((raw) => raw as NoteItem)
        .filter((n) => n.id && n.title && typeof n.html === "string" && typeof n.timestamp === "number")
        .map((n) => ({ ...n, pinned: !!n.pinned, tags: Array.isArray(n.tags) ? n.tags : extractTags(n.html) }));
      setNotes(clean);
      showSnack("Imported notes", "success");
    } catch {
      showSnack("Import failed", "error");
    }
  };

  const printNoteToPDF = (note: NoteItem) => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return showSnack("Pop-up blocked. Allow pop-ups.", "warning");
    win.document.write(`
      <html>
        <head>
          <title>${escapeHtml(note.title)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            time { color: #666; font-size: 12px; }
            .content { font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(note.title)}</h1>
          <time>${new Date(note.timestamp).toLocaleString()}</time>
          <hr />
          <div class="content">${note.html}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const uploadAssets = async (files: FileList | null, folder?: string) => {
    if (!files || files.length === 0) return;
    try {
      for (const file of Array.from(files)) {
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        const kind: AssetKind =
          file.type.includes("pdf") ? "pdf" :
          file.type.startsWith("image/") ? "image" :
          file.type.startsWith("video/") ? "video" : "other";
        const record: Asset = { id, name: file.name, kind, type: file.type, size: file.size, created: Date.now(), file, folder };
        await addAsset(id, record);
      }
      const items = await getAllAssets();
      setLibrary(items);
      showSnack("Files saved offline", "success");
    } catch {
      showSnack("File save failed", "error");
    }
  };

  const removeAsset = async (id: string) => {
    try {
      await deleteAsset(id);
      const items = await getAllAssets();
      setLibrary(items);
      showSnack("Deleted asset", "info");
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  const renameAssetLocal = async () => {
    if (!renameAsset) return;
    try {
      // Rewrite object in DB with the same file, new name/folder
      await addAsset(renameAsset.id, renameAsset);
      const items = await getAllAssets();
      setLibrary(items);
      setRenameAsset(null);
      showSnack("Asset updated", "success");
    } catch {
      showSnack("Update failed", "error");
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchNotes.trim().toLowerCase();
    if (!q) return true;
    const plain = n.html.replace(/<[^>]+>/g, " ").toLowerCase();
    return n.title.toLowerCase().includes(q) || plain.includes(q) || n.tags.some((t) => t.toLowerCase().includes(q));
  });

  const filteredLibrary = library.filter((a) => {
    const q = searchLibrary.trim().toLowerCase();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || (a.folder || "").toLowerCase().includes(q) || a.kind.toLowerCase().includes(q);
  });

  // Screens

  const HomeScreen = () => {
    const pinned = notes.filter((n) => n.pinned).slice(0, 4);
    const recent = notes.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">Study Pro (Android style)</Typography>
                  <Chip
                    icon={online ? <CloudDoneIcon /> : <CloudOffIcon />}
                    label={online ? "Online" : "Offline"}
                    color={online ? "success" : "default"}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<NoteAddIcon />} onClick={() => setTab(1)}>
                    Notes
                  </Button>
                  <Button variant="outlined" startIcon={<Inventory2Icon />} onClick={() => setTab(2)}>
                    Library
                  </Button>
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Create and edit rich notes, import PDFs, watch videos and view images—all within one app, offline and online.
              </Typography>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle1">Pinned notes</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {pinned.length === 0 ? (
                    <Typography variant="body2">No pinned notes yet.</Typography>
                  ) : (
                    pinned.map((n) => (
                      <Stack key={n.id} spacing={0.5} sx={{ borderLeft: "3px solid #1976d2", pl: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                        <Typography variant="caption">{new Date(n.timestamp).toLocaleString()}</Typography>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle1">Recent notes</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {recent.length === 0 ? (
                    <Typography variant="body2">No notes yet.</Typography>
                  ) : (
                    recent.map((n) => (
                      <Stack key={n.id} spacing={0.5} sx={{ borderLeft: "3px solid #9c27b0", pl: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                        <Typography variant="caption">{new Date(n.timestamp).toLocaleString()}</Typography>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    );
  };

  const NoteScreen = () => {
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h6">Create rich note</Typography>
                <Chip icon={<SearchIcon />} label="Tip: add keywords for better search" size="small" />
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField label="Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} fullWidth />
                <RichTextEditor
                  html={noteHtml}
                  onChange={setNoteHtml}
                  placeholder="Type your study notes here… Use the toolbar to format."
                />
              </Stack>
            </CardContent>
            <CardActions>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={addNote}>
                Save
              </Button>
              <Button variant="text" startIcon={<RestartAltIcon />} onClick={() => { setNoteTitle(""); setNoteHtml(""); }}>
                Reset
              </Button>
            </CardActions>
          </Card>

          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField label="Search notes" value={searchNotes} onChange={(e) => setSearchNotes(e.target.value)} fullWidth />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportNotesJSON} disabled={notes.length === 0}>
                  Export JSON
                </Button>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                  Import JSON
                  <input
                    hidden
                    type="file"
                    accept="application/json"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f) void importNotesJSON(f);
                    }}
                  />
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography variant="body2">No matching notes.</Typography>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((n) => (
                <Card key={n.id}>
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Typography variant="h6">{n.title}</Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {n.tags.map((t) => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.timestamp).toLocaleString()}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        fontSize: 15,
                        lineHeight: 1.7,
                      }}
                      dangerouslySetInnerHTML={{ __html: n.html }}
                    />
                  </CardContent>
                  <CardActions sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => void copyHtml(n.html)}>
                      Copy
                    </Button>
                    <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => void shareNote(n)}>
                      Share
                    </Button>
                    <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => printNoteToPDF(n)}>
                      Save as PDF
                    </Button>
                    <Button
                      variant={n.pinned ? "contained" : "outlined"}
                      startIcon={n.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                      color="secondary"
                      onClick={() => togglePin(n.id)}
                    >
                      {n.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button variant="text" color="error" startIcon={<DeleteForeverIcon />} onClick={() => deleteNote(n.id)}>
                      Delete
                    </Button>
                    <Button variant="text" startIcon={<EditIcon />} onClick={() => setEditNote(n)}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Stack>

          <Dialog open={!!editNote} onClose={() => setEditNote(null)} fullWidth maxWidth="md">
            <DialogTitle>Edit note</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  fullWidth
                  value={editNote?.title || ""}
                  onChange={(e) => setEditNote((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                />
                <RichTextEditor
                  html={editNote?.html || ""}
                  onChange={(val) => setEditNote((prev) => (prev ? { ...prev, html: val, tags: extractTags(val) } : prev))}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditNote(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (!editNote) return;
                  updateNote(editNote);
                  setEditNote(null);
                }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    );
  };

  const LibraryScreen = () => {
    const [folderInput, setFolderInput] = useState<string>("");
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <Typography variant="h6">Library (offline files)</Typography>
                <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
                  <TextField
                    size="small"
                    placeholder="Folder (optional)"
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                  />
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                    Add files
                    <input
                      hidden
                      type="file"
                      multiple
                      accept="application/pdf,video/*,image/*,*/*"
                      onChange={(e) => void uploadAssets(e.target.files, folderInput.trim() || undefined)}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Inventory2Icon />}
                    onClick={async () => {
                      const items = await getAllAssets();
                      setLibrary(items);
                      showSnack("Library refreshed", "info");
                    }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  label="Search library"
                  value={searchLibrary}
                  onChange={(e) => setSearchLibrary(e.target.value)}
                  fullWidth
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Upload PDFs, videos, images, and other files—stored offline in IndexedDB. Preview inside the app.
              </Typography>
            </CardContent>
          </Card>

          {filteredLibrary.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="body2">No files yet or no match. Add files to see them here.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredLibrary.map((asset) => (
                <Card key={asset.id}>
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {asset.kind === "pdf" && <PictureAsPdfIcon color="primary" />}
                        {asset.kind === "video" && <MovieIcon color="primary" />}
                        {asset.kind === "image" && <ImageIcon color="primary" />}
                        <Typography variant="subtitle1">{asset.name}</Typography>
                        <Chip label={asset.kind} size="small" variant="outlined" />
                        {asset.folder && <Chip label={`Folder: ${asset.folder}`} size="small" variant="outlined" />}
                        <Typography variant="caption" color="text.secondary">
                          {(asset.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{new Date(asset.created).toLocaleString()}</Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Button variant="contained" onClick={() => setPreviewAsset(asset)}>
                      Open
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={() => {
                        const url = fileToObjectURL(asset.file);
                        const text = `Saved in Library\n${new Date(asset.created).toLocaleString()}`;
                        if (isWebShareAvailable(navigator)) {
                          void navigator.share({ title: asset.name, text, url });
                        } else {
                          void navigator.clipboard.writeText(`${asset.name}\n${text}\n${url}`).then(() => showSnack("Share unavailable; copied link", "info"));
                        }
                      }}
                    >
                      Share
                    </Button>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setRenameAsset(asset)}>
                      Rename / Move
                    </Button>
                    <Button variant="text" color="error" startIcon={<DeleteForeverIcon />} onClick={() => void removeAsset(asset.id)}>
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        const url = fileToObjectURL(asset.file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = asset.name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          )}

          <Dialog open={!!previewAsset} onClose={() => setPreviewAsset(null)} fullWidth maxWidth="md">
            <DialogTitle>{previewAsset?.name}</DialogTitle>
            <DialogContent dividers>
              {!previewAsset ? null : (
                <Box sx={{ width: "100%" }}>
                  {previewAsset.kind === "pdf" && (
                    <Box sx={{ width: "100%", height: { xs: 400, sm: 600 } }}>
                      <iframe
                        title={previewAsset.name}
                        src={fileToObjectURL(previewAsset.file)}
                        style={{ width: "100%", height: "100%", border: "none" }}
                      />
                    </Box>
                  )}
                  {previewAsset.kind === "video" && (
                    <Box sx={{ width: "100%" }}>
                      <video controls src={fileToObjectURL(previewAsset.file)} style={{ width: "100%" }} />
                    </Box>
                  )}
                  {previewAsset.kind === "image" && (
                    <Box sx={{ width: "100%" }}>
                      <img alt={previewAsset.name} src={fileToObjectURL(previewAsset.file)} style={{ width: "100%", height: "auto", display: "block" }} />
                    </Box>
                  )}
                  {previewAsset.kind === "other" && (
                    <Typography variant="body2">Preview not supported. Use Download to open.</Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewAsset(null)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={!!renameAsset} onClose={() => setRenameAsset(null)} fullWidth maxWidth="sm">
            <DialogTitle>Rename / Move</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={renameAsset?.name || ""}
                  onChange={(e) => setRenameAsset((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                />
                <TextField
                  label="Folder (optional)"
                  value={renameAsset?.folder || ""}
                  onChange={(e) => setRenameAsset((prev) => (prev ? { ...prev, folder: e.target.value } : prev))}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRenameAsset(null)}>Cancel</Button>
              <Button variant="contained" onClick={() => void renameAssetLocal()}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    );
  };

  const ProfileScreen = () => {
    const total = notes.length;
    const pinnedCount = notes.filter((n) => n.pinned).length;
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Typography variant="h6">Settings</Typography>
                <SettingsIcon color="primary" />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Typography>Theme</Typography>
                <Switch checked={mode === "dark"} onChange={() => setMode(mode === "dark" ? "light" : "dark")} />
                <Chip label={mode === "dark" ? "Dark" : "Light"} variant="outlined" size="small" />
              </Stack>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body2">Total notes: {total}</Typography>
                <Typography variant="body2">Pinned notes: {pinnedCount}</Typography>
                <Typography variant="body2">Library items: {library.length}</Typography>
                <Typography variant="body2">Status: {online ? "Online" : "Offline"}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppBar position="static" color="primary">
          <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <Typography variant="h6">Study Pro</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={online ? <CloudDoneIcon /> : <CloudOffIcon />}
                label={online ? "Online" : "Offline"}
                color={online ? "success" : "default"}
                size="small"
              />
              <Switch checked={mode === "dark"} onChange={() => setMode(mode === "dark" ? "light" : "dark")} />
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1 }}>
          {tab === 0 && <HomeScreen />}
          {tab === 1 && <NoteScreen />}
          {tab === 2 && <LibraryScreen />}
          {tab === 3 && <ProfileScreen />}
        </Box>

        <BottomNavigation value={tab} onChange={(_, v) => setTab(v)} showLabels>
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Notes" icon={<NoteAddIcon />} />
          <BottomNavigationAction label="Library" icon={<Inventory2Icon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
