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
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Badge,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import EditIcon from "@mui/icons-material/Edit";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SortIcon from "@mui/icons-material/Sort";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";

type NoteItem = {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
  pinned?: boolean;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
};

type Snack = { open: boolean; message: string; severity: "success" | "info" | "warning" | "error" };

export default function Page() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [tab, setTab] = useState<number>(0);
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [snackbar, setSnackbar] = useState<Snack>({ open: false, message: "", severity: "success" });
  const [firstLaunch, setFirstLaunch] = useState<boolean>(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem("mui-mode");
      if (m === "dark" || m === "light") setMode(m);
      const raw = localStorage.getItem("saved-notes");
      if (raw) {
        const parsed = JSON.parse(raw) as NoteItem[];
        setSavedNotes(Array.isArray(parsed) ? parsed : []);
      }
      const onboard = localStorage.getItem("onboarding-shown");
      if (!onboard) {
        setFirstLaunch(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("mui-mode", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem("saved-notes", JSON.stringify(savedNotes));
    } catch {
      // ignore
    }
  }, [savedNotes]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "dark" ? "#90caf9" : "#1976d2" },
          secondary: { main: "#9c27b0" },
          success: { main: "#2e7d32" },
          warning: { main: "#ed6c02" },
        },
        shape: { borderRadius: 14 },
        components: {
          MuiCard: { styleOverrides: { root: { borderWidth: 1, borderStyle: "solid", borderColor: mode === "dark" ? "#2f2f2f" : "#e5e5e5" } } },
          MuiBottomNavigation: { styleOverrides: { root: { borderTop: `1px solid ${mode === "dark" ? "#2f2f2f" : "#e5e5e5"}` } } },
        },
      }),
    [mode]
  );

  const showSnack = (message: string, severity: Snack["severity"] = "success") => setSnackbar({ open: true, message, severity });

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnack("Copied to clipboard", "success");
    } catch {
      showSnack("Copy failed", "error");
    }
  };

  const handleSaveNote = (note: NoteItem) => {
    setSavedNotes((prev) => {
      const existing = prev.find((n) => n.id === note.id);
      let next = existing ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
      next = next.slice(0, 500);
      return next;
    });
    showSnack("Note saved", "success");
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
    showSnack("Note deleted", "info");
  };

  const handleResetAll = () => {
    setSavedNotes([]);
    showSnack("All notes cleared", "warning");
  };

  const togglePin = (id: string) => {
    setSavedNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
        .sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || (b.timestamp - a.timestamp))
    );
  };

  const themeToggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const OnboardingDialog = () => {
    const [open, setOpen] = useState<boolean>(firstLaunch);
    useEffect(() => setOpen(firstLaunch), [firstLaunch]);
    const close = () => {
      setOpen(false);
      localStorage.setItem("onboarding-shown", "true");
    };
    return (
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoIcon color="primary" />
            <Typography variant="h6">Welcome to Study Notes</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Generate structured notes, save offline, and study with an Android-style interface. Toggle dark mode, pin important notes, and export your data.
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Generate notes: Subject + topics → instant outline." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Save offline: localStorage keeps notes on your device." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pin, edit, copy, share, export/import JSON backups." />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={close} startIcon={<CheckIcon />}>
            Start
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const HomeScreen = () => {
    const recent = savedNotes.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
    return (
      <Container sx={{ py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SchoolIcon color="primary" />
              <Typography variant="h6">Welcome, student</Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Build concise, exam-ready notes. Generate, pin, edit, and export—all offline. Switch to dark mode for late-night study sessions.
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" startIcon={<NoteAddIcon />} onClick={() => setTab(1)}>
              Create notes
            </Button>
            <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => setTab(2)}>
              View saved
            </Button>
          </CardActions>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TipsAndUpdatesIcon color="secondary" />
              <Typography variant="h6">Study tips</Typography>
            </Stack>
            <List dense>
              <ListItem>
                <ListItemText primary="Active recall over passive reading—test yourself using ‘Quick Q&A’." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Chunk topics; tag notes by subject and level for faster retrieval." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Keep summaries short; revise pinned notes daily." />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">Recent notes</Typography>
            </Stack>
            {recent.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                No notes yet. Generate your first note to see it here.
              </Typography>
            ) : (
              <List dense>
                {recent.map((n) => (
                  <ListItem key={n.id} sx={{ alignItems: "flex-start" }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{n.title}</Typography>
                          <Stack direction="row" spacing={0.5}>
                            {n.tags.slice(0, 4).map((t) => (
                              <Chip key={t} label={t} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(n.timestamp).toLocaleString()}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {n.content}
                          </Typography>
                        </Box>
                      }
                    />
                    <Stack direction="row">
                      <Tooltip title="Copy">
                        <IconButton onClick={() => handleCopyText(n.content)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={n.pinned ? "Unpin" : "Pin"}>
                        <IconButton onClick={() => togglePin(n.id)}>{n.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}</IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  };

  const NoteGeneratorScreen = () => {
    const [subject, setSubject] = useState<string>("");
    const [topics, setTopics] = useState<string>("");
    const [level, setLevel] = useState<string>("High School");
    const [style, setStyle] = useState<string>("Bulleted");
    const [tone, setTone] = useState<string>("Concise");
    const [generated, setGenerated] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [noteColor, setNoteColor] = useState<NoteItem["color"]>("default");

    const tokenize = (text: string) =>
      text
        .split(/[,\n;]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

    const makeTags = (subj: string, tpcs: string[]) => {
      const base = [subj, level, style, tone].filter(Boolean);
      const clean = Array.from(new Set([...base, ...tpcs.map((x) => x)]));
      return clean.slice(0, 10);
    };

    const dividerLine = "————————————";

    const generateNotes = () => {
      const t = tokenize(topics);
      const subj = subject.trim();
      if (!subj) {
        showSnack("Add a subject/course", "warning");
        return;
      }
      if (t.length === 0) {
        showSnack("Add at least one topic", "warning");
        return;
      }

      const section = (h: string, body: string[]) => [`• ${h}`, ...body.map((b) => `  - ${b}`)].join("\n");

      const outline: string[] = [];
      outline.push(`${subj} — ${level} (${style}, ${tone})`);
      outline.push(dividerLine);
      outline.push(section("Key definitions", t.map((x) => `${x}: short, exam-ready definition.`)));
      outline.push(
        section(
          "Core concepts",
          t.map((x) => `Explain ${x} in 2–3 bullets; include formula or relationship when relevant.`)
        )
      );
      outline.push(section("Examples", t.map((x) => `One everyday or real-world example that illustrates ${x}.`)));
      outline.push(section("Common mistakes", t.map((x) => `Misunderstanding ${x}; confusing similar terms; skipping units/context.`)));
      outline.push(section("Quick Q&A", t.map((x) => `What is ${x}? Why does it matter? One-line answer.`)));
      outline.push(section("Summary", [`Link definitions → concepts → examples. Keep recall tight and accurate.`]));

      const suggestedTitle = `${subj}: ${t.slice(0, 3).join(" • ")}`;
      setTitle(suggestedTitle);
      setGenerated(outline.join("\n"));
      showSnack("Notes generated", "success");
    };

    const handleSave = () => {
      if (!generated) {
        showSnack("Generate notes first", "info");
        return;
      }
      const t = tokenize(topics);
      const note: NoteItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        title: title || subject || "Untitled",
        content: generated,
        timestamp: Date.now(),
        tags: makeTags(subject, t),
        pinned: false,
        color: noteColor || "default",
      };
      handleSaveNote(note);
    };

    const handleReset = () => {
      setSubject("");
      setTopics("");
      setLevel("High School");
      setStyle("Bulleted");
      setTone("Concise");
      setGenerated("");
      setTitle("");
      setNoteColor("default");
      showSnack("Form reset", "info");
    };

    return (
      <Container sx={{ py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Generate study notes</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your subject and topics. The generator creates a structured outline ready for revision.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField fullWidth label="Subject / Course" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology, Mathematics, History..." sx={{ mb: 2 }} />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Topics (comma or newline separated)"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Cell structure, Photosynthesis, Mitosis"
                sx={{ mb: 2 }}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField fullWidth label="Level" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="High School, Undergraduate, etc." />
                <TextField fullWidth label="Style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Bulleted, Outline, Summary" />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth label="Tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Concise, Detailed, Exam-focus" />
                <FormControl fullWidth>
                  <InputLabel id="note-color-label">Note color</InputLabel>
                  <Select labelId="note-color-label" label="Note color" value={noteColor} onChange={(e) => setNoteColor(e.target.value as NoteItem["color"])}>
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="primary">Primary</MenuItem>
                    <MenuItem value="secondary">Secondary</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" startIcon={<NoteAddIcon />} onClick={generateNotes}>
              Generate
            </Button>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}>
              Reset
            </Button>
          </CardActions>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6">Preview</Typography>
              {generated && <Chip label="Ready" color="success" size="small" />}
            </Stack>
            <TextField fullWidth multiline minRows={10} value={generated} onChange={(e) => setGenerated(e.target.value)} placeholder="Your generated notes will appear here..." />
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={handleSave} disabled={!generated}>
              Save
            </Button>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => handleCopyText(generated)} disabled={!generated}>
              Copy
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  };

  const SavedNotesScreen = () => {
    const [query, setQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [editNote, setEditNote] = useState<NoteItem | null>(null);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      let list = savedNotes.slice();
      if (q) {
        list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)));
      }
      list.sort((a, b) => {
        if (sortBy === "recent") return (Number(b.pinned) - Number(a.pinned)) || (b.timestamp - a.timestamp);
        if (sortBy === "oldest") return (Number(b.pinned) - Number(a.pinned)) || (a.timestamp - b.timestamp);
        return (Number(b.pinned) - Number(a.pinned)) || a.title.localeCompare(b.title);
      });
      return list;
    }, [savedNotes, query, sortBy]);

    const openEdit = (n: NoteItem) => {
      setEditNote(n);
      setEditOpen(true);
    };

    const closeEdit = () => {
      setEditOpen(false);
      setEditNote(null);
    };

    const saveEdit = () => {
      if (!editNote) return;
      handleSaveNote(editNote);
      closeEdit();
      showSnack("Note updated", "success");
    };

    const shareNote = async (n: NoteItem) => {
      const text = `${n.title}\n${new Date(n.timestamp).toLocaleString()}\n\n${n.content}`;
      try {
        if (navigator.share && typeof navigator.share === "function") {
          await navigator.share({ title: n.title, text });
          showSnack("Shared", "success");
        } else {
          await navigator.clipboard.writeText(text);
          showSnack("Share unavailable; note copied instead", "info");
        }
      } catch {
        await navigator.clipboard.writeText(text);
        showSnack("Share failed; note copied", "warning");
      }
    };

    const exportJSON = () => {
      try {
        const blob = new Blob([JSON.stringify(savedNotes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `study-notes-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showSnack("Exported JSON", "success");
      } catch {
        showSnack("Export failed", "error");
      }
    };

    const importJSON = async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as NoteItem[];
        if (!Array.isArray(data)) throw new Error("Invalid format");
        const clean = data
          .filter((n) => n && n.id && n.title && n.content && typeof n.timestamp === "number")
          .map((n) => ({ ...n, pinned: !!n.pinned, color: (n.color as NoteItem["color"]) || "default" }));
        setSavedNotes(clean.slice(0, 500));
        showSnack("Imported notes", "success");
      } catch {
        showSnack("Import failed", "error");
      }
    };

    return (
      <Container sx={{ py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">Saved notes</Typography>
                <Badge badgeContent={savedNotes.length} color="primary" />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by title, content, or tag" fullWidth />
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-label">Sort by</InputLabel>
                  <Select labelId="sort-label" label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
                    <MenuItem value="recent">Recent</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="outlined" color="warning" startIcon={<DeleteForeverIcon />} onClick={handleResetAll} disabled={savedNotes.length === 0}>
              Clear all
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportJSON} disabled={savedNotes.length === 0}>
              Export JSON
            </Button>
            <Button variant="outlined" startIcon={<UploadFileIcon />} component="label">
              Import JSON
              <input
                hidden
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJSON(f);
                }}
              />
            </Button>
          </CardActions>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body2">No notes found. Try generating new notes or adjust your search.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filtered.map((n) => (
              <Card key={n.id}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">{n.title}</Typography>
                      {n.pinned && <Chip label="Pinned" size="small" color="warning" variant="outlined" />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: "wrap" }}>
                    {n.tags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    value={n.content}
                    onChange={(e) => setEditNote({ ...n, content: e.target.value })}
                    onFocus={() => {
                      if (!editOpen) {
                        setEditNote(n);
                        setEditOpen(true);
                      }
                    }}
                  />
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => handleCopyText(n.content)}>
                    Copy
                  </Button>
                  <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => shareNote(n)}>
                    Share
                  </Button>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => openEdit(n)}>
                    Edit
                  </Button>
                  <Button variant="text" color="error" startIcon={<DeleteForeverIcon />} onClick={() => handleDeleteNote(n.id)}>
                    Delete
                  </Button>
                  <Button variant={n.pinned ? "contained" : "outlined"} color="warning" startIcon={n.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />} onClick={() => togglePin(n.id)}>
                    {n.pinned ? "Unpin" : "Pin"}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
          <DialogTitle>Edit note</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField label="Title" value={editNote?.title || ""} onChange={(e) => setEditNote((p) => (p ? { ...p, title: e.target.value } : p))} />
              <TextField
                label="Tags (comma separated)"
                value={(editNote?.tags || []).join(", ")}
                onChange={(e) =>
                  setEditNote((p) => (p ? { ...p, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } : p))
                }
              />
              <FormControl>
                <InputLabel id="edit-color-label">Note color</InputLabel>
                <Select
                  labelId="edit-color-label"
                  label="Note color"
                  value={editNote?.color || "default"}
                  onChange={(e) => setEditNote((p) => (p ? { ...p, color: e.target.value as NoteItem["color"] } : p))}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="primary">Primary</MenuItem>
                  <MenuItem value="secondary">Secondary</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Content"
                multiline
                minRows={10}
                value={editNote?.content || ""}
                onChange={(e) => setEditNote((p) => (p ? { ...p, content: e.target.value } : p))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={closeEdit}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={saveEdit} disabled={!editNote}>
              Save changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  const ProfileScreen = () => {
    const total = savedNotes.length;
    const pinnedCount = savedNotes.filter((n) => n.pinned).length;
    const tagsCount = savedNotes.reduce<Record<string, number>>((acc, n) => {
      n.tags.forEach((t) => {
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {});
    const popularTags = Object.entries(tagsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return (
      <Container sx={{ py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Profile</Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Your study activity and preferences. Toggle dark mode for comfortable night study sessions.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1">Stats</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={`Total saved notes: ${total}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Pinned notes: ${pinnedCount}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Theme: ${mode === "dark" ? "Dark" : "Light"}`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              <Card sx={{ flex: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">Popular tags</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    {popularTags.length === 0 ? (
                      <Chip label="No tags yet" variant="outlined" />
                    ) : (
                      popularTags.map(([tag, count]) => <Chip key={tag} label={`${tag} (${count})`} color="secondary" variant="outlined" />)
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">Appearance</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <WbSunnyIcon />
              <Switch checked={mode === "dark"} onChange={themeToggle} />
              <NightsStayIcon />
              <Typography variant="body2">{mode === "dark" ? "Dark mode enabled" : "Light mode enabled"}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OnboardingDialog />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">Study Notes App</Typography>
              <Chip label="Android style" size="small" color="default" variant="outlined" />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="Toggle theme">
                <Stack direction="row" alignItems="center">
                  <WbSunnyIcon fontSize="small" />
                  <Switch checked={mode === "dark"} onChange={themeToggle} />
                  <NightsStayIcon fontSize="small" />
                </Stack>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1 }}>
          {tab === 0 && <HomeScreen />}
          {tab === 1 && <NoteGeneratorScreen />}
          {tab === 2 && <SavedNotesScreen />}
          {tab === 3 && <ProfileScreen />}
        </Box>

        <Box sx={{ position: "sticky", bottom: 0, left: 0, right: 0 }}>
          <BottomNavigation value={tab} onChange={(_, v) => setTab(v)} sx={{ bgcolor: "background.paper" }} showLabels>
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Generate" icon={<NoteAddIcon />} />
            <BottomNavigationAction label="Saved" icon={<SaveIcon />} />
            <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setSnackbar((s) => ({ ...s, open: false }));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
