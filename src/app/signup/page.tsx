"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  DeleteOutlined,
  DescriptionOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { useAuth } from "@/context/AuthContext";
interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  address: string;
  city: string;
  zipCode: string;
  industry: string;
  currencySymbol: string;
}

export default function SignupPage() {
  const router = useRouter();
const { signup } = useAuth();
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    address: "",
    city: "",
    zipCode: "",
    industry: "",
    currencySymbol: "₹",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupForm | "logo", string>>
  >({});

  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    field: keyof SignupForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setSignupError("");
  };

  const handleLogoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        logo: "Please select a valid image.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image size must be less than 5 MB.",
      }));
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      logo: "",
    }));
  };

const removeLogo = () => {
  setLogo(null);
  setLogoPreview("");

  setErrors((prev) => ({
    ...prev,
    logo: "",
  }));
};

  const validateForm = () => {
    const newErrors: Partial<
      Record<keyof SignupForm | "logo", string>
    > = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    if (!form.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!form.currencySymbol.trim()) {
      newErrors.currencySymbol = "Currency symbol is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSignupError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

await signup({
  ...form,
  logo,
});
router.push("/dashboard");
    } catch (error) {
      setSignupError(
        error instanceof Error
          ? error.message
          : "Unable to create account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputSx = {
    "& .MuiInputBase-root": {
      fontSize: 11,
      height: 32,
    },
    "& .MuiInputBase-input": {
      padding: "7px 10px",
    },
    "& .MuiFormHelperText-root": {
      fontSize: 9,
      marginLeft: 0,
      marginTop: 2,
    },
  };

  const labelSx = {
    fontSize: 10,
    color: "#333",
    mb: 0.5,
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
          alignItems: "flex-start",
          px: 2,
          py: 4,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 760,
            backgroundColor: "#fff",
            border: "1px solid #e2e2e2",
            borderRadius: "4px",
            p: { xs: 2.5, sm: 3 },
          }}
        >

          <Box
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: "#222",
                mb: 0.5,
              }}
            >
              Create Your Account
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                color: "#777",
              }}
            >
              Set up your company and start invoicing in minutes.
            </Typography>
          </Box>

          {signupError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                fontSize: 10,
                py: 0,
              }}
            >
              {signupError}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: { xs: 3, sm: 4 },
            }}
          >

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#333",
                  mb: 1.5,
                }}
              >
                User Information
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  First Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={(event) =>
                    handleChange(
                      "firstName",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  sx={inputSx}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Last Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={(event) =>
                    handleChange(
                      "lastName",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  sx={inputSx}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Email
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Typography sx={labelSx}>
                  Password
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(event) =>
                    handleChange(
                      "password",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.password)}
                  helperText={
                    errors.password || "Password must be 6+ characters"
                  }
                  sx={inputSx}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            size="small"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            edge="end"
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
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#333",
                  mb: 1.5,
                }}
              >
                Company Information
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Company Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter company name"
                  value={form.companyName}
                  onChange={(event) =>
                    handleChange(
                      "companyName",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.companyName)}
                  helperText={errors.companyName}
                  sx={inputSx}
                />
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Company Logo
                </Typography>

                <Box
                  sx={{
                    height: 58,
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                  }}
                >
                  {logoPreview ? (
                    <>
                      <Box
                        component="img"
                        src={logoPreview}
                        alt="Company logo preview"
                        sx={{
                          width: 42,
                          height: 42,
                          objectFit: "contain",
                          border: "1px solid #eee",
                          borderRadius: "3px",
                        }}
                      />

                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: 9,
                          color: "#666",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {logo?.name}
                      </Typography>

                      <IconButton
                        type="button"
                        size="small"
                        onClick={removeLogo}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        sx={{
                          fontSize: 9,
                          minWidth: 65,
                          height: 27,
                          textTransform: "none",
                        }}
                      >
                        Choose File

                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Button>

                      <Typography
                        sx={{
                          fontSize: 9,
                          color: "#999",
                        }}
                      >
                        PNG, JPG up to 5 MB
                      </Typography>
                    </>
                  )}
                </Box>

                {errors.logo && (
                  <Typography
                    sx={{
                      color: "#d32f2f",
                      fontSize: 9,
                      mt: 0.3,
                    }}
                  >
                    {errors.logo}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Address
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter company address"
                  value={form.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  sx={inputSx}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography sx={labelSx}>
                    City
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={(event) =>
                      handleChange(
                        "city",
                        event.target.value
                      )
                    }
                    error={Boolean(errors.city)}
                    helperText={errors.city}
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <Typography sx={labelSx}>
                    Zip Code
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="6 digit zip code"
                    value={form.zipCode}
                    onChange={(event) =>
                      handleChange(
                        "zipCode",
                        event.target.value
                      )
                    }
                    error={Boolean(errors.zipCode)}
                    helperText={errors.zipCode}
                    sx={inputSx}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography sx={labelSx}>
                  Industry
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter industry type"
                  value={form.industry}
                  onChange={(event) =>
                    handleChange(
                      "industry",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.industry)}
                  helperText={errors.industry}
                  sx={inputSx}
                />
              </Box>

              <Box>
                <Typography sx={labelSx}>
                  Currency Symbol
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="₹, $, €"
                  value={form.currencySymbol}
                  onChange={(event) =>
                    handleChange(
                      "currencySymbol",
                      event.target.value
                    )
                  }
                  error={Boolean(errors.currencySymbol)}
                  helperText={errors.currencySymbol}
                  sx={inputSx}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
              pt: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                height: 32,
                minWidth: 70,
                backgroundColor: "#555",
                fontSize: 10,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#444",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                "Sign Up"
              )}
            </Button>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              mt: 2,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: 10,
                color: "#777",
              }}
            >
              Already have an account?{" "}
            </Typography>

            <Link
              href="/login"
              style={{
                fontSize: "10px",
                color: "#333",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Login
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
