"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  IconButton,
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

type NoteItem = {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
  pinned: boolean;
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

// IndexedDB helpers
const dbName = "studySuperAppDB";
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

async function addAsset(id: string, file: File): Promise<void> {
  const db = await openDB();
  const kind: AssetKind =
    file.type.includes("pdf") ? "pdf" :
    file.type.startsWith("image/") ? "image" :
    file.type.startsWith("video/") ? "video" : "other";
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const record = { id, file, name: file.name, kind, type: file.type, size: file.size, created: Date.now() };
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

export default function Page() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [tab, setTab] = useState<number>(0);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [snackbar, setSnackbar] = useState<Snack>({ open: false, message: "", severity: "success" });
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  const [library, setLibrary] = useState<Asset[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  const [search, setSearch] = useState<string>("");
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

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

  const extractTags = (text: string): string[] => {
    const words = text.split(/\W+/).filter((w) => w.length > 3);
    const unique = Array.from(new Set(words));
    return unique.slice(0, 6);
  };

  const addNote = (title: string, content: string) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const newNote: NoteItem = {
      id,
      title: title.trim() || "Untitled",
      content: content.trim(),
      timestamp: Date.now(),
      tags: extractTags(content),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
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

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnack("Copied", "info");
    } catch {
      showSnack("Copy failed", "error");
    }
  };

  const isWebShareAvailable = (nav: Navigator): nav is NavigatorShare => {
    return typeof (nav as NavigatorShare).share === "function";
  };

  const shareText = async (title: string, text: string, url?: string) => {
    try {
      if (isWebShareAvailable(navigator)) {
        await navigator.share({ title, text, url });
        showSnack("Shared", "success");
      } else {
        await navigator.clipboard.writeText([title, text, url || ""].filter(Boolean).join("\n\n"));
        showSnack("Share unavailable; copied instead", "info");
      }
    } catch {
      await navigator.clipboard.writeText([title, text, url || ""].filter(Boolean).join("\n\n"));
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
        .filter((n) => n.id && n.title && typeof n.content === "string" && typeof n.timestamp === "number")
        .map((n) => ({ ...n, pinned: !!n.pinned, tags: Array.isArray(n.tags) ? n.tags : extractTags(n.content) }));
      setNotes(clean);
      showSnack("Imported notes", "success");
    } catch {
      showSnack("Import failed", "error");
    }
  };

  const printNoteToPDF = (note: NoteItem) => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      showSnack("Pop-up blocked. Allow pop-ups.", "warning");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>${note.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            time { color: #666; font-size: 12px; }
            pre { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(note.title)}</h1>
          <time>${new Date(note.timestamp).toLocaleString()}</time>
          <hr />
          <pre>${escapeHtml(note.content)}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const uploadAssets = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      for (const file of Array.from(files)) {
        const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        await addAsset(id, file);
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

  const filteredNotes = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q));
  });

  // Screens (no Grid, responsive via Stack/Box)

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
                  <Typography variant="h6">Study Super App</Typography>
                  <Chip
                    icon={online ? <CloudDoneIcon /> : <CloudOffIcon />}
                    label={online ? "Online" : "Offline"}
                    color={online ? "success" : "default"}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<NoteAddIcon />} onClick={() => setTab(1)}>
                    New note
                  </Button>
                  <Button variant="outlined" startIcon={<Inventory2Icon />} onClick={() => setTab(2)}>
                    Library
                  </Button>
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Create notes, save PDFs, manage files, preview videos/images, share and export—all offline and online.
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
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h6">Create note</Typography>
                <Chip icon={<SearchIcon />} label="Tip: add keywords for better search" size="small" />
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
                <TextField
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  fullWidth
                  multiline
                  minRows={8}
                  placeholder={`• Key points\n  - Short bullets\n• Summary\n  - Keep it concise`}
                />
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  if (!content.trim()) return showSnack("Write some content", "warning");
                  addNote(title, content);
                  setTitle("");
                  setContent("");
                }}
              >
                Save
              </Button>
              <Button variant="text" startIcon={<RestartAltIcon />} onClick={() => { setTitle(""); setContent(""); }}>
                Reset
              </Button>
            </CardActions>
          </Card>

          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField label="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
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
                      if (f) importNotesJSON(f);
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
                    <TextField
                      fullWidth
                      multiline
                      minRows={6}
                      sx={{ mt: 1 }}
                      value={n.content}
                      onChange={(e) => updateNote({ ...n, content: e.target.value, tags: extractTags(e.target.value) })}
                    />
                  </CardContent>
                  <CardActions sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copyText(n.content)}>
                      Copy
                    </Button>
                    <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => shareText(n.title, n.content)}>
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
                    <Button variant="text" startIcon={<EditIcon />} onClick={() => setEditingNote(n)}>
                      Edit title
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Stack>

          <Dialog open={!!editingNote} onClose={() => setEditingNote(null)} fullWidth maxWidth="sm">
            <DialogTitle>Edit note title</DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Title"
                fullWidth
                value={editingNote?.title || ""}
                onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingNote(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (!editingNote) return;
                  updateNote(editingNote);
                  setEditingNote(null);
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
    return (
      <Container sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <Typography variant="h6">Library (offline files)</Typography>
                <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                    Add files
                    <input
                      hidden
                      type="file"
                      multiple
                      accept="application/pdf,video/*,image/*,*/*"
                      onChange={(e) => uploadAssets(e.target.files)}
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
              <Typography variant="body2" sx={{ mt: 1 }}>
                Upload PDFs, videos, images, and other files. Stored offline in your browser (IndexedDB).
              </Typography>
            </CardContent>
          </Card>

          {library.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="body2">No files yet. Add some to see them here.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {library.map((asset) => (
                <Card key={asset.id}>
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {asset.kind === "pdf" && <PictureAsPdfIcon color="primary" />}
                        {asset.kind === "video" && <MovieIcon color="primary" />}
                        {asset.kind === "image" && <ImageIcon color="primary" />}
                        <Typography variant="subtitle1">{asset.name}</Typography>
                        <Chip label={asset.kind} size="small" variant="outlined" />
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
                        void shareText(asset.name, `Saved in Library\n${new Date(asset.created).toLocaleString()}`, url);
                      }}
                    >
                      Share
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
        </Stack>
      </Container>
    );
  };

  const ProfileScreen = () => {
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
              <Typography variant="body2" sx={{ mt: 2 }}>
                Data is stored locally (offline). Use Export/Import to back up notes. Files are kept in IndexedDB.
              </Typography>
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
            <Typography variant="h6">Study Super App</Typography>
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
          - 
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
