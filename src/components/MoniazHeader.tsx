import React from "react";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";

const MoniazHeader: React.FC = () => (
  <>
    <Box
      sx={{
        bgcolor: "navy.main",
        color: "#fff",
        py: 0.75,
        fontSize: "0.4rem",
        fontWeight: 300,
      }}
    >
      <Container maxWidth="xl">
        <Typography sx={{ textAlign: "center" }}>
          پنل استخراج سوال — زیرمجموعه نشر آنلاین مُـنیاز
        </Typography>
      </Container>
    </Box>
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main" }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 56, md: 64 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "#fff",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "1.2rem",
              }}
            >
              م
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "1rem", lineHeight: 1.2 }}>
                نشر آنلاین مُـنیاز
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: 0.25,
                  px: 0.75,
                  py: 0.1,
                  bgcolor: "inherit",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  borderRadius: "2px",
                }}
              >
                MONIAZ.IR
              </Box>
            </Box>
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.95rem" } }}>
            استخراج سوال با هوش مصنوعی
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  </>
);

export default MoniazHeader;
