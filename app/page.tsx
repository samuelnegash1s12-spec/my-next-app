"use client";

/* ============================================================
   STUDENT NOTE GENERATOR APP
   Single-file Next.js + Material UI
   Author: Samuel 😎
   ============================================================ */

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import FavoriteIcon from "@mui/icons-material/Favorite";

/* ============================================================
   TYPES
   ============================================================ */

type StudyMode = "short" | "detailed" | "exam";
type Difficulty = "easy" | "medium" | "hard";

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Home() {
  /* ---------------------- STATE ---------------------- */

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [studyMode, setStudyMode] = useState<StudyMode>("short");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  /* ---------------------- EFFECTS ---------------------- */

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#f4f6f8";
  }, [darkMode]);

  /* ============================================================
     NOTE GENERATION LOGIC
     ============================================================ */

  const generateNote = () => {
    if (!name || !subject || !topic || !level) {
      setNote("⚠️ Please fill in ALL fields before generating notes.");
      return;
    }

    setLoading(true);
    setNote("");

    setTimeout(() => {
      const intro = `
Hello ${name} 👋

📘 Subject: ${subject}
🧠 Topic: ${topic}
🎓 Level: ${level}
📊 Difficulty: ${difficulty.toUpperCase()}
📝 Study Mode: ${studyMode.toUpperCase()}
`;

      const shortNote = `
• Understand the core idea of "${topic}"
• Focus on key definitions
• Revise quickly with examples
• Practice 5–10 questions
`;

      const detailedNote = `
1️⃣ Introduction  
- Definition and explanation of "${topic}"
- Why it is important in ${subject}

2️⃣ Key Concepts  
- Main principles explained simply
- Diagrams and real-life examples

3️⃣ Deep Understanding  
- How concepts connect together
- Common mistakes students make

4️⃣ Practice Strategy  
- Solve different types of questions
- Analyze wrong answers

5️⃣ Revision Tips  
- Daily short revision
- Weekly full review
`;

      const examNote = `
🧪 EXAM-FOCUSED NOTES

✔ Important formulas & keywords
✔ Frequently asked questions
✔ Time management tips
✔ How to structure answers
✔ Examiner expectations

⚠️ Avoid careless mistakes
`;

      const motivation = `
💡 Motivation:
"Discipline beats motivation. Study even when you don't feel like it."

❤️ Remember:
Your future self will thank you for studying today.
`;

      let body = "";

      if (studyMode === "short") body = shortNote;
      if (studyMode === "detailed") body = detailedNote;
      if (studyMode === "exam") body = examNote;

      const finalNote = `
${intro}

━━━━━━━━━━━━━━━━━━━━━━
📚 STUDY NOTES
━━━━━━━━━━━━━━━━━━━━━━
${body}

━━━━━━━━━━━━━━━━━━━━━━
${motivation}
`;

      setNote(finalNote);
      setLoading(false);
    }, 1500);
  };

  /* ============================================================
     UTILITY FUNCTIONS
     ============================================================ */

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note);
    setShowSnackbar(true);
  };

  const clearAll = () => {
    setName("");
    setSubject("");
    setTopic("");
    setLevel("");
    setNote("");
  };

  /* ============================================================
     UI
     ============================================================ */

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: darkMode ? 8 : 4,
          bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        }}
      >
        <CardContent>
          <Stack spacing={4}>
            {/* HEADER */}
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                Student Note Generator 📚
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Smart notes • Better grades • Less stress
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Chip icon={<SchoolIcon />} label="For Students" />
                <Chip
                  icon={<EmojiObjectsIcon />}
                  label="Smart Learning"
                  color="primary"
                />
                <Chip
                  icon={<FavoriteIcon />}
                  label="Built with ❤️"
                  color="success"
                />
              </Stack>
            </Box>

            <Divider />

            {/* SETTINGS */}
            <Stack direction="row" justifyContent="space-between">
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                }
                label={
                  darkMode ? (
                    <Stack direction="row" spacing={1}>
                      <DarkModeIcon /> <span>Dark Mode</span>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <LightModeIcon /> <span>Light Mode</span>
                    </Stack>
                  )
                }
              />
            </Stack>

            {/* INPUTS */}
            <Stack spacing={3}>
              <TextField
                label="Your Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                label="Subject"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <TextField
                label="Topic"
                fullWidth
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <TextField
                label="Education Level (e.g. Grade 11)"
                fullWidth
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>Study Mode</InputLabel>
                <Select
                  value={studyMode}
                  label="Study Mode"
                  onChange={(e) =>
                    setStudyMode(e.target.value as StudyMode)
                  }
                >
                  <MenuItem value="short">Short Notes</MenuItem>
                  <MenuItem value="detailed">Detailed Notes</MenuItem>
                  <MenuItem value="exam">Exam Focused</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty"
                  onChange={(e) =>
                    setDifficulty(e.target.value as Difficulty)
                  }
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* ACTIONS */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={generateNote}
                fullWidth
              >
                Generate Notes
              </Button>

              <Tooltip title="Clear everything">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearAll}
                >
                  Clear
                </Button>
              </Tooltip>
            </Stack>

            {loading && <LinearProgress />}

            {/* OUTPUT */}
            {note && (
              <Card
                sx={{
                  bgcolor: darkMode ? "#2a2a2a" : "#f7f7f7",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography
                      component="pre"
                      whiteSpace="pre-wrap"
                      fontFamily="monospace"
                      fontSize={14}
                    >
                      {note}
                    </Typography>

                    <Button
                      startIcon={<ContentCopyIcon />}
                      onClick={copyToClipboard}
                    >
                      Copy Notes
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* SNACKBAR */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success">Notes copied to clipboard!</Alert>
      </Snackbar>
    </Container>
  );
}
