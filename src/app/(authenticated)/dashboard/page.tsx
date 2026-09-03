"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Inventory2Outlined,
  ReceiptLongOutlined,
  ArrowForward,
  LogoutOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  DescriptionOutlined
} from "@mui/icons-material";
export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    company,
    logout,
  } = useAuth();

  const [isLogoutOpen, setIsLogoutOpen] =
    useState(false);
const capitalizeWords = (
    value?: string | null
  ) => {
    if (!value) return "";

    return value
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const handleLogout = () => {
    setIsLogoutOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >

      <Box
        sx={{
          minHeight: 56,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          py: 1,
          gap: 2,
        }}
      >

       <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: 14,
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              textAlign: "right",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#333",
              }}
            >
              {capitalizeWords(user?.firstName)}{" "}
              {capitalizeWords(user?.lastName)}
            </Typography>

            <Typography
              sx={{
                fontSize: 9,
                color: "#777",
              }}
            >
              {capitalizeWords(
                company?.companyName
              )}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={
              <LogoutOutlined
                sx={{ fontSize: 15 }}
              />
            }
            onClick={() =>
              setIsLogoutOpen(true)
            }
            sx={{
              height: 30,
              minWidth: 78,
              px: 1.2,
              fontSize: 10,
              textTransform: "none",
              borderColor: "#d0d0d0",
              color: "#555",
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >

        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 22,
                md: 26,
              },
              fontWeight: 600,
              color: "#222",
              mb: 0.5,
            }}
          >
            Welcome back,{" "}
            {capitalizeWords(user?.firstName)}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#777",
            }}
          >
            Manage your items and invoices from
            one place.
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#333",
            mb: 1.5,
          }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          <Card
            sx={{
              border: "1px solid #e2e2e2",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.04)",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Inventory2Outlined
                sx={{
                  fontSize: 26,
                  color: "#555",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                }}
              >
                Items
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#777",
                  mt: 0.5,
                  maxWidth: 320,
                }}
              >
                Manage your products and
                services, pricing, discounts and
                pictures.
              </Typography>

              <Button
                variant="outlined"
                endIcon={
                  <ArrowForward
                    sx={{ fontSize: 15 }}
                  />
                }
                onClick={() =>
                  router.push("/items")
                }
                sx={{
                  mt: 2,
                  height: 32,
                  fontSize: 10,
                  textTransform: "none",
                }}
              >
                Manage Items
              </Button>
            </CardContent>
          </Card>

          <Card
            sx={{
              border: "1px solid #e2e2e2",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.04)",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <ReceiptLongOutlined
                sx={{
                  fontSize: 26,
                  color: "#555",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#222",
                }}
              >
                Invoices
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#777",
                  mt: 0.5,
                  maxWidth: 320,
                }}
              >
                Create, manage, search and print
                your company invoices.
              </Typography>

              <Button
                variant="outlined"
                endIcon={
                  <ArrowForward
                    sx={{ fontSize: 15 }}
                  />
                }
                onClick={() =>
                  router.push("/invoices")
                }
                sx={{
                  mt: 2,
                  height: 32,
                  fontSize: 10,
                  textTransform: "none",
                }}
              >
                View Invoices
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Card
          sx={{
            mt: 3,
            border: "1px solid #e2e2e2",
            boxShadow: "none",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "#333",
                mb: 1.5,
              }}
            >
              Company Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >

              <Box>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#999",
                  }}
                >
                  Company
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#333",
                    mt: 0.3,
                  }}
                >
                  {capitalizeWords(
                    company?.companyName
                  ) || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#999",
                  }}
                >
                  Currency
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#333",
                    mt: 0.3,
                  }}
                >
                  {company?.currencySymbol ||
                    "-"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#999",
                  }}
                >
                  User
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#333",
                    mt: 0.3,
                  }}
                >
                  {user?.email || "-"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={isLogoutOpen}
        onClose={() =>
          setIsLogoutOpen(false)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Logout
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: "#555",
            }}
          >
            Are you sure you want to logout?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              setIsLogoutOpen(false)
            }
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              textTransform: "none",
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
