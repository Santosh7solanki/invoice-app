"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  DescriptionOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const { login } = useAuth();
const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

await login({
  email: email.trim(),
  password,
  rememberMe,
});

router.push("/dashboard");
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <Box
        sx={{
          height: 48,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
   <Typography
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: 10,
    fontWeight: 600,
    color: "#222",
  }}
>
  <DescriptionOutlined
    sx={{
      fontSize: 14,
      color: "#444",
    }}
  />
  InvoiceApp
</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 4,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: "#fff",
            border: "1px solid #e2e2e2",
            borderRadius: "4px",
            p: { xs: 3, sm: 4 },
          }}
        >

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 600,
                color: "#222",
                mb: 0.5,
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: "#777",
              }}
            >
              Log in to your account to continue.
            </Typography>
          </Box>

          {loginError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                fontSize: 11,
                py: 0,
                alignItems: "center",
              }}
            >
              {loginError}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#333",
                mb: 0.7,
              }}
            >
              Email
            </Typography>

            <TextField
              fullWidth
              size="small"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
                setLoginError("");
              }}
              error={Boolean(emailError)}
              helperText={emailError}
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "#333",
                mb: 0.7,
              }}
            >
              Password
            </Typography>

            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
                setLoginError("");
              }}
              error={Boolean(passwordError)}
              helperText={passwordError}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />
            }
            label={
              <Typography sx={{ fontSize: 11, color: "#666" }}>
                Remember me
              </Typography>
            }
            sx={{
              margin: "-4px 0 8px -8px",
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              height: 36,
              backgroundColor: "#555",
              fontSize: 12,
              "&:hover": {
                backgroundColor: "#444",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography
              component="span"
              sx={{
                fontSize: 11,
                color: "#777",
              }}
            >
              Don&apos;t have an account?{" "}
            </Typography>

            <Link
              href="/signup"
              style={{
                fontSize: "11px",
                color: "#333",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Create account
            </Link>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid #e5e5e5",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            fontSize: 9,
            color: "#888",
          }}
        >
          © 2026 InvoiceApp. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
