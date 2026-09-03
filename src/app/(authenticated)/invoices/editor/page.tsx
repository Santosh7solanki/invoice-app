"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Divider,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import itemService, { Item } from "@/api/item.service";
import invoiceService from "@/api/invoice.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

interface InvoiceLine {
  rowNo: number;
  itemID: number | "";
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}

const createEmptyLine = (rowNo: number): InvoiceLine => ({
  rowNo,
  itemID: "",
  description: "",
  quantity: 1,
  rate: 0,
  discountPct: 0,
});

export default function InvoiceEditorPage() {
  const searchParams = useSearchParams();
  const invoiceID = searchParams.get("id");
  const isEditMode = Boolean(invoiceID);
  const isPrintMode = searchParams.get("print") === "true";

  const { token } = useAuth();
  const router = useRouter();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [lines, setLines] = useState<InvoiceLine[]>([
    createEmptyLine(1),
  ]);

  const [updatedOn, setUpdatedOn] = useState<string | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);

  // Load invoice for edit
  useEffect(() => {
    if (!isEditMode || !invoiceID || !token) {
      return;
    }

    const loadInvoice = async () => {
      try {
        const result = await invoiceService.getInvoiceById(
          token,
          Number(invoiceID)
        );

        setInvoiceNo(String(result.invoiceNo));
        setInvoiceDate(result.invoiceDate.slice(0, 10));
        setCustomerName(result.customerName);
        setAddress(result.address);
        setCity(result.city);
        setTaxPercentage(String(result.taxPercentage));
        setNotes(result.notes);
        setUpdatedOn(result.updatedOn);

        setLines(
          result.lines?.map((line) => ({
            rowNo: line.rowNo,
            itemID: line.itemID,
            description: line.description,
            quantity: line.quantity,
            rate: line.rate,
            discountPct: line.discountPct,
          })) ?? [createEmptyLine(1)]
        );

        if (isPrintMode) {
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to load invoice:", error);
      }
    };

    loadInvoice();
  }, [token, invoiceID, isEditMode, isPrintMode]);

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      try {
        setItemsLoading(true);

        const result = await itemService.getItems();

        setItems(result);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setItemsLoading(false);
      }
    };

    loadItems();
  }, []);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      createEmptyLine(prev.length + 1),
    ]);
  };

  const deleteLine = (rowNo: number) => {
    if (lines.length === 1) {
      return;
    }

    setLines((prev) =>
      prev
        .filter((line) => line.rowNo !== rowNo)
        .map((line, index) => ({
          ...line,
          rowNo: index + 1,
        }))
    );
  };

  const copyLine = (rowNo: number) => {
    setLines((prev) => {
      const sourceLine = prev.find(
        (line) => line.rowNo === rowNo
      );

      if (!sourceLine) {
        return prev;
      }

      const newLine: InvoiceLine = {
        ...sourceLine,
        rowNo: prev.length + 1,
      };

      return [...prev, newLine];
    });
  };

  const updateLine = (
    rowNo: number,
    field:
      | "itemID"
      | "description"
      | "quantity"
      | "rate"
      | "discountPct",
    value: number | "" | string
  ) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.rowNo !== rowNo) {
          return line;
        }

        if (field === "itemID") {
          return {
            ...line,
            itemID: value === "" ? "" : Number(value),
          };
        }

        if (field === "description") {
          return {
            ...line,
            description: String(value),
          };
        }

        if (field === "quantity") {
          return {
            ...line,
            quantity: Number(value),
          };
        }

        if (field === "rate") {
          return {
            ...line,
            rate: Number(value),
          };
        }

        return {
          ...line,
          discountPct: Number(value),
        };
      })
    );
  };

  const calculateAmount = (line: InvoiceLine): number => {
    const grossAmount = line.quantity * line.rate;
    const discountAmount =
      grossAmount * (line.discountPct / 100);

    return grossAmount - discountAmount;
  };

  const subTotal = lines.reduce(
    (total, line) => total + calculateAmount(line),
    0
  );

  const taxRate = Number(taxPercentage) || 0;
  const taxAmount = subTotal * (taxRate / 100);
  const invoiceTotal = subTotal + taxAmount;

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!invoiceNo || !invoiceDate || !customerName) {
      alert(
        "Please fill Invoice No, Invoice Date and Customer Name."
      );
      return;
    }

    if (lines.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    try {
      const payload = {
        invoiceNo: Number(invoiceNo),
        invoiceDate: new Date(invoiceDate).toISOString(),
        customerName,
        address,
        city,
        taxPercentage: Number(taxPercentage) || 0,
        notes,
        lines: lines.map((line) => ({
          rowNo: line.rowNo,
          itemID: Number(line.itemID),
          description: line.description,
          quantity: Number(line.quantity),
          rate: Number(line.rate),
          discountPct: Number(line.discountPct),
        })),
      };

      if (isEditMode && invoiceID) {
        await invoiceService.updateInvoice(token, {
          ...payload,
          invoiceID: Number(invoiceID),
          updatedOn,
        });

        alert("Invoice updated successfully.");
      } else {
        await invoiceService.createInvoice(token, payload);

        alert("Invoice created successfully.");
      }

      router.push("/invoices");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to save invoice.";

      if (
        message ===
        "Record already modified by another user."
      ) {
        setConflictOpen(true);
        return;
      }

      alert(message);
    }
  };

  const handleCancel = () => {
    router.push("/invoices");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        px: {
          xs: 1,
          sm: 2,
          md: 3,
        },
        py: {
          xs: 1,
          sm: 2,
        },

        "@media print": {
          minHeight: "auto",
          padding: 0,
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,

          "@media print": {
            display: "none",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {isEditMode ? "Edit Invoice" : "New Invoice"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              textTransform: "none",
              minWidth: 90,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: "none",
              minWidth: 90,
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* ================= INVOICE DETAILS ================= */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 1,
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: "#111827",
            mb: 2,
          }}
        >
          Invoice Details
        </Typography>

        <Grid container spacing={2}>
          {/* Invoice No */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Invoice No"
              placeholder="INV-001"
              value={invoiceNo}
              onChange={(event) =>
                setInvoiceNo(event.target.value)
              }
            />
          </Grid>

          {/* Invoice Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Invoice Date"
              value={invoiceDate}
              onChange={(event) =>
                setInvoiceDate(event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* Customer */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              required
              label="Customer Name"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
            />
          </Grid>

          {/* City */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="City"
              placeholder="Enter city"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
            />
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Address"
              placeholder="Enter address"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label="Notes"
              placeholder="Additional notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ================= LINE ITEMS ================= */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 1,
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Line Items
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={addLine}
            sx={{
              textTransform: "none",
              displayPrint: "none",
            }}
          >
            + Add Row
          </Button>
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: {
              xs: "none",
              md: "grid",
            },
            gridTemplateColumns:
              "50px minmax(150px, 1.2fr) minmax(160px, 1.5fr) 90px 100px 90px 110px 80px",
            gap: 1,
            px: 1,
            py: 1,
            backgroundColor: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            S.No
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Item *
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Description
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Qty *
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Rate *
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Disc %
          </Typography>

          <Typography
            variant="caption"
            sx={{ fontWeight: 600 }}
          >
            Amount
          </Typography>

          <Typography
            variant="caption"
            sx={{ fontWeight: 600 }}
          >
            Actions
          </Typography>
        </Box>

        {lines.map((line) => (
          <Box
            key={line.rowNo}
            sx={{
              display: {
                xs: "block",
                md: "grid",
              },
              gridTemplateColumns:
                "50px minmax(150px, 1.2fr) minmax(160px, 1.5fr) 90px 100px 90px 110px 80px",
              gap: 1,
              alignItems: "center",
              p: 1,
              borderBottom: "1px solid #E5E7EB",

              "@media print": {
                display: "grid",
                gridTemplateColumns:
                  "50px minmax(150px, 1.2fr) minmax(160px, 1.5fr) 70px 90px 80px 100px",
              },
            }}
          >
            {/* S.No */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
              }}
            >
              <Typography variant="body2">
                {line.rowNo}
              </Typography>
            </Box>

            {/* Item */}
            <TextField
              fullWidth
              size="small"
              select
              label="Item"
              value={line.itemID}
              disabled={itemsLoading}
              onChange={(event) => {
                const selectedItemID = Number(
                  event.target.value
                );

                const selectedItem = items.find(
                  (item) => item.itemID === selectedItemID
                );

                if (!selectedItem) {
                  return;
                }

                setLines((prev) =>
                  prev.map((currentLine) =>
                    currentLine.rowNo === line.rowNo
                      ? {
                          ...currentLine,
                          itemID: selectedItem.itemID,
                          description:
                            selectedItem.description ?? "",
                          rate: selectedItem.salesRate,
                          discountPct:
                            selectedItem.discountPct,
                        }
                      : currentLine
                  )
                );
              }}
              slotProps={{
                select: {
                  native: true,
                },
              }}
              sx={{
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            >
              <option value="">Select Item</option>

              {items.map((item) => (
                <option
                  key={item.itemID}
                  value={item.itemID}
                >
                  {item.itemName}
                </option>
              ))}
            </TextField>

            {/* Description */}
            <TextField
              fullWidth
              size="small"
              label="Description"
              value={line.description}
              onChange={(event) =>
                updateLine(
                  line.rowNo,
                  "description",
                  event.target.value
                )
              }
              sx={{
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            />

            {/* Qty */}
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Qty"
              value={line.quantity}
              onChange={(event) =>
                updateLine(
                  line.rowNo,
                  "quantity",
                  event.target.value
                )
              }
              sx={{
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            />

            {/* Rate */}
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Rate"
              value={line.rate}
              onChange={(event) =>
                updateLine(
                  line.rowNo,
                  "rate",
                  event.target.value
                )
              }
              sx={{
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            />

            {/* Discount */}
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Discount %"
              value={line.discountPct}
              onChange={(event) =>
                updateLine(
                  line.rowNo,
                  "discountPct",
                  event.target.value
                )
              }
              sx={{
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            />

            {/* Amount */}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 14,
                mb: {
                  xs: 1,
                  md: 0,
                },
              }}
            >
              ₹ {calculateAmount(line).toFixed(2)}
            </Typography>

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                justifyContent: {
                  xs: "flex-end",
                  md: "flex-start",
                },
                mb: {
                  xs: 1,
                  md: 0,
                },
                displayPrint: "none",
              }}
            >
              <IconButton
                size="small"
                color="primary"
                onClick={() => copyLine(line.rowNo)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                color="error"
                onClick={() => deleteLine(line.rowNo)}
                disabled={lines.length === 1}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Sub Total */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Box
            sx={{
              width: {
                xs: "100%",
                sm: 300,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
              }}
            >
              <Typography variant="body2">
                Subtotal:
              </Typography>

              <Typography variant="body2">
                ₹ {subTotal.toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
              }}
            >
              <Typography variant="body2">
                Tax:
              </Typography>

              <Typography variant="body2">
                {taxRate.toFixed(2)}% ₹{" "}
                {taxAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ================= INVOICE TOTALS ================= */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 1,
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Invoice Totals
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                maxWidth: 320,
                ml: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                }}
              >
                <Typography variant="body2">
                  Sub Total
                </Typography>

                <Typography variant="body2">
                  ₹ {subTotal.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                }}
              >
                <Typography variant="body2">
                  Tax
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TextField
                    size="small"
                    type="number"
                    value={taxPercentage}
                    onChange={(event) =>
                      setTaxPercentage(
                        event.target.value
                      )
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: 100,
                      },
                    }}
                    sx={{
                      width: 85,
                    }}
                  />

                  <Typography variant="body2">
                    ₹ {taxAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  Invoice Amount
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  ₹ {invoiceTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ================= CONFLICT DIALOG ================= */}
      <Dialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
      >
        <DialogTitle>
          Invoice was modified
        </DialogTitle>

        <DialogContent>
          <Typography>
            This invoice was modified by another user
            while you were editing it.
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Please reload the invoice to get the latest
            data before making changes again.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConflictOpen(false)}
          >
            Keep Editing
          </Button>

          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Reload Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}