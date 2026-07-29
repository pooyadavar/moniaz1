import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ExtractionEditor from "./ExtractionEditor";
import QuestionUploadPage from "./QuestionUploadPage";
import { useAuth } from "../auth/AuthProvider";
import type { ExtractionListResponse, ExtractionSessionListItem } from "../services/api";
import { apiRequest } from "../services/api";

const statusLabel = (status: string) => {
  if (status === "done") return "آماده";
  if (status === "failed") return "خطا";
  if (status === "created") return "جدید";
  return "در حال پردازش";
};

const OperatorShell: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [sessions, setSessions] = useState<ExtractionSessionListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await apiRequest<ExtractionListResponse>("/api/extractions", {}, token);
      setSessions(result.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت تاریخچه انجام نشد.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "312px minmax(0, 1fr)" },
        minHeight: "calc(100svh - 104px)",
        bgcolor: "#f8fbfd",
        direction: "rtl",
      }}
    >
      <Box
        component="aside"
        sx={{
          borderLeft: { md: "1px solid #d9e4ee" },
          bgcolor: "#f7fbff",
          color: "text.primary",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minHeight: { md: "calc(100svh - 104px)" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 0.5, py: 0.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a2b42" }}>{user?.fullName}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.72rem" }}>{user?.phone}</Typography>
          </Box>
          <Button
            variant="text"
            size="small"
            onClick={logout}
            sx={{ minWidth: 40, px: 1, color: "primary.main", borderRadius: 1, "&:hover": { bgcolor: "rgba(0, 114, 188, 0.08)" } }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </Button>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => setSelectedId(null)}
          startIcon={<AddRoundedIcon />}
          sx={{
            justifyContent: "flex-start",
            color: "#fff",
            borderColor: "transparent",
            bgcolor: "primary.main",
            py: 1,
            "&:hover": { bgcolor: "primary.dark", borderColor: "transparent" },
            "& .MuiButton-startIcon": { ml: 0.75, mr: 0 },
          }}
        >
          درخواست جدید
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5, mt: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.secondary" }}>تاریخچه</Typography>
          <Button size="small" onClick={loadSessions} disabled={isLoading} sx={{ minWidth: 34, color: "primary.main", "&:hover": { bgcolor: "rgba(0, 114, 188, 0.08)" } }}>
            {isLoading ? <CircularProgress size={16} /> : <RefreshRoundedIcon fontSize="small" />}
          </Button>
        </Box>
        <Divider sx={{ borderColor: "#d9e4ee" }} />

        {error ? (
          <Typography sx={{ color: "error.main", fontSize: "0.78rem", px: 0.5 }}>{error}</Typography>
        ) : null}

        <List dense disablePadding sx={{ overflowY: "auto", flex: 1, pr: 0.25 }}>
          {sessions.map((session) => (
            <ListItemButton
              key={session.id}
              selected={selectedId === session.id}
              onClick={() => setSelectedId(session.id)}
              sx={{
                borderRadius: 1.25,
                mb: 0.35,
                alignItems: "flex-start",
                gap: 1,
                color: "text.primary",
                px: 1,
                py: 0.9,
                textAlign: "right",
                "&:hover": { bgcolor: "#edf6ff" },
                "&.Mui-selected": { bgcolor: "#e6f2ff", "&:hover": { bgcolor: "#dfedfb" } },
                
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a2b42" }}>
                  {session.title || session.originalFilename || `درخواست ${session.id}`}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                  {new Date(session.updatedAt).toLocaleString("fa-IR")}
                </Typography>
              </Box>
              <Chip
                label={statusLabel(session.status)}
                size="small"
                variant="outlined"
                sx={{
                  color: session.status === "failed" ? "error.main" : session.status === "done" ? "success.dark" : "text.secondary",
                  borderColor: "#c8d7e6",
                  bgcolor: "#fff",
                  height: 24,
                  fontSize: "0.66rem",
                }}
              />
            </ListItemButton>
          ))}
          {!sessions.length && !isLoading ? (
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", p: 1 }}>
              موردی ثبت نشده است.
            </Typography>
          ) : null}
        </List>
      </Box>

      <Box component="section" sx={{ minWidth: 0, bgcolor: "#ffffff", minHeight: "calc(100svh - 104px)" }}>
        {selectedId ? (
          <ExtractionEditor sessionId={selectedId} onSessionUpdate={loadSessions} />
        ) : (
          <QuestionUploadPage
            onSessionCreated={(sessionId) => {
              setSelectedId(sessionId);
              loadSessions();
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default OperatorShell;
