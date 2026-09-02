/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import itemService from "@/api/item.service";

import { Item } from "@/api/item.service";

interface AddItemFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: Item | null;
}

export default function AddItemForm({
  open,
  onClose,
  onSuccess,
    item,
}: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [salesRate, setSalesRate] = useState("");
  const [discountPct, setDiscountPct] = useState("");
const isEditMode = Boolean(item);
  const [itemNameError, setItemNameError] = useState("");
  const [salesRateError, setSalesRateError] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [formError, setFormError] = useState("");

  const [isLoading, setIsLoading] = useState(false);















  const resetForm = () => {
    setItemName("");
    setDescription("");
    setSalesRate("");
    setDiscountPct("");

    setItemNameError("");
    setSalesRateError("");
    setDiscountError("");
    setFormError("");
  };

  const handleClose = () => {
    if (isLoading) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setItemNameError("");
    setSalesRateError("");
    setDiscountError("");
    setFormError("");

    let hasError = false;

    // Item Name
    if (!itemName.trim()) {
      setItemNameError("Item name is required");
      hasError = true;
    }

    // Sale Rate
    const parsedSalesRate = Number(salesRate);

    if (!salesRate.trim()) {
      setSalesRateError("Sale rate is required");
      hasError = true;
    } else if (
      !Number.isFinite(parsedSalesRate) ||
      parsedSalesRate <= 0
    ) {
      setSalesRateError("Sale rate must be greater than 0");
      hasError = true;
    }

    // Discount
    const parsedDiscount = discountPct.trim()
      ? Number(discountPct)
      : 0;

    if (
      discountPct.trim() &&
      (!Number.isFinite(parsedDiscount) ||
        parsedDiscount < 0 ||
        parsedDiscount > 100)
    ) {
      setDiscountError("Discount must be between 0 and 100");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

if (isEditMode && item) {
  await itemService.updateItem({
    updatedOn: item.updatedOn,
    itemID: item.itemID,
    itemName: itemName.trim(),
    description: description.trim() || null,
    salesRate: parsedSalesRate,
    discountPct: parsedDiscount,
  });
} else {
  await itemService.addItem({
    itemName: itemName.trim(),
    description: description.trim() || null,
    salesRate: parsedSalesRate,
    discountPct: parsedDiscount,
  });
}

      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to save item."
      );
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  if (open && item) {
    setItemName(item.itemName);
    setDescription(item.description ?? "");
    setSalesRate(String(item.salesRate));
    setDiscountPct(String(item.discountPct));
  }

  if (open && !item) {
    resetForm();
  }
}, [open, item]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <Box component="form" onSubmit={handleSubmit}>
    <DialogTitle sx={{ fontSize: 20, fontWeight: 600 }}>
  {isEditMode ? "Edit Item" : "Add New Item"}
</DialogTitle>

        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Item Name"
            placeholder="Enter item name"
            value={itemName}
            onChange={(event) => {
              setItemName(event.target.value);
              setItemNameError("");
              setFormError("");
            }}
            error={Boolean(itemNameError)}
            helperText={itemNameError}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            placeholder="Enter item description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setFormError("");
            }}
            multiline
            rows={3}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Sale Rate"
            placeholder="Enter sale rate"
            type="number"
            value={salesRate}
            onChange={(event) => {
              setSalesRate(event.target.value);
              setSalesRateError("");
              setFormError("");
            }}
            error={Boolean(salesRateError)}
            helperText={salesRateError}
            margin="normal"
            required
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.01",
              },
            }}
          />

          <TextField
            fullWidth
            label="Discount %"
            placeholder="Enter discount percentage"
            type="number"
            value={discountPct}
            onChange={(event) => {
              setDiscountPct(event.target.value);
              setDiscountError("");
              setFormError("");
            }}
            error={Boolean(discountError)}
            helperText={discountError}
            margin="normal"
            slotProps={{
              htmlInput: {
                min: 0,
                max: 100,
                step: "0.01",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
           {isLoading ? (
  <CircularProgress size={20} color="inherit" />
) : isEditMode ? (
  "Update Item"
) : (
  "Save Item"
)}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}