import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "95%",
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  margin: "auto",
  fontFamily: "Nunito, sans-serif",
  borderRadius: theme.shape.borderRadius || 12,
  [theme.breakpoints.up("sm")]: {
    width: "60%",
    minWidth: 500,
    maxWidth: 900,
  },
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function UserLogin() {
  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { loginAsUser } = useAuth();
  const [tab, setTab] = React.useState<'user' | 'admin'>('user');

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    setIsLoading(true);
    try {
      await loginAsUser(email, password);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <LoginContainer direction="column" justifyContent="space-between">
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            animation: 'slideUp 0.8s ease-out',
          }}
        >
          <Box sx={{ flexDirection: 'row', display: 'flex', gap: 2, mb: 1 }}>
            <Typography
              sx={{
                width: "100%",
                fontSize: "2rem",
                fontWeight: 700,
                color: '#1f2937',
                letterSpacing: '-0.025em',
                mb: 1,
              }}
            >
              Welcome
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={tab}
                exclusive
                onChange={(_e, value) => {
                  if (!value) return;
                  setTab(value);
                  if (value === 'admin') navigate('/admin-login');
                }}
                size="small"
                aria-label="login type"
                sx={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 4,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  p: 0.5,
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 'none',
                    borderRadius: '12px !important',
                    mx: 0.25,
                  },
                }}
              >
                <ToggleButton
                  value="user"
                  aria-label="user-login"
                  sx={{
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    },
                  }}
                >
                  User
                </ToggleButton>
                <ToggleButton
                  value="admin"
                  aria-label="admin-login"
                  sx={{
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    },
                  }}
                >
                  Admin
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel
                htmlFor="email"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}
              >
                Email
              </FormLabel>
              <TextField
                size="medium"
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s ease-in-out',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.8,
                    fontSize: '0.95rem',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Mail size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                  ),
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel
                htmlFor="password"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.9rem'
                }}
              >
                Password
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="Enter your password"
                size="medium"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s ease-in-out',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.8,
                    fontSize: '0.95rem',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Lock size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                  ),
                }}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mb: 2,
                py: 1.8,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                backgroundColor: '#3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign in"
              )}
            </Button>
          </Box>
        </Card>
      </LoginContainer>
    </>
  );
}
