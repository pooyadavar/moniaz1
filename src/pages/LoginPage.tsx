import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { useAuth } from "../auth/AuthProvider";

interface Props {
  onRegisterClick: () => void;
}

const LoginPage: React.FC<Props> = ({ onRegisterClick }) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "calc(100svh - 104px)",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 7 },
        direction: "rtl",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          p: { xs: 2.5, md: 3 },
          border: "1px solid #e5eaf0",
          borderRadius: 3,
          bgcolor: "#fff",
          boxShadow: "0 18px 55px rgba(12, 45, 107, 0.10)",
        }}
      >
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: "auto",
              mb: 1.5,
              borderRadius: "50%",
              bgcolor: "rgba(0, 114, 188, 0.10)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoginRoundedIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a2b42", mb: 0.5 }}>
            ورود اپراتور
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
            برای مدیریت استخراج‌ها وارد حساب شوید.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="شماره تلفن"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            required
            fullWidth
          />
          <TextField
            label="پسورد"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={{ py: 1.2 }}>
            {isLoading ? <CircularProgress size={20} sx={{ color: "#fff", ml: 1 }} /> : <LoginRoundedIcon sx={{ ml: 1 }} />}
            ورود
          </Button>
          <Button type="button" variant="text" onClick={onRegisterClick} sx={{ color: "primary.main" }}>
            حساب ندارید؟ ثبت‌نام
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
