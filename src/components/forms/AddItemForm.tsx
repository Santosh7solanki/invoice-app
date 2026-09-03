/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import {
  Close,
  ImageOutlined,
} from "@mui/icons-material";

import itemService, {
  Item,
} from "@/api/item.service";

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [itemNameError, setItemNameError] = useState("");
  const [salesRateError, setSalesRateError] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = Boolean(item);

  const resetForm = () => {
    setItemName("");
    setDescription("");
    setSalesRate("");
    setDiscountPct("");

    setSelectedFile(null);
    setImagePreview(null);

    setItemNameError("");
    setSalesRateError("");
    setDiscountError("");
    setImageError("");
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    resetForm();
    onClose();
  };

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setImageError("");
    setFormError("");

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Only PNG or JPG images are allowed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setImageError("Image size must be less than 5 MB.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setItemNameError("");
    setSalesRateError("");
    setDiscountError("");
    setImageError("");
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
      setDiscountError(
        "Discount must be between 0 and 100"
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      let savedItemID: number;

      if (isEditMode && item) {
        await itemService.updateItem({
          updatedOn: item.updatedOn,
          itemID: item.itemID,
          itemName: itemName.trim(),
          description: description.trim() || null,
          salesRate: parsedSalesRate,
          discountPct: parsedDiscount,
        });

        savedItemID = item.itemID;
      } else {
        const result = await itemService.addItem({
          itemName: itemName.trim(),
          description: description.trim() || null,
          salesRate: parsedSalesRate,
          discountPct: parsedDiscount,
        });

        savedItemID = Number(
          result?.primaryKeyID ?? result?.itemID
        );

        if (!savedItemID) {
          throw new Error(
            "Item was saved, but item ID was not returned."
          );
        }
      }

      // Upload image only when user selected a new image
      if (selectedFile) {
        await itemService.uploadItemImage(
          savedItemID,
          selectedFile
        );
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
    let isMounted = true;

    const loadExistingItem = async () => {
      if (!open) return;

      if (!item) {
        resetForm();
        return;
      }

      setItemName(item.itemName);
      setDescription(item.description ?? "");
      setSalesRate(String(item.salesRate));
      setDiscountPct(String(item.discountPct));

      setSelectedFile(null);
      setImageError("");
      setFormError("");

      try {
        const thumbnail =
          await itemService.getItemThumbnailUrl(
            item.itemID
          );

        if (isMounted && thumbnail) {
          setImagePreview(thumbnail);
        }
      } catch {
        if (isMounted) {
          setImagePreview(null);
        }
      }
    };

    loadExistingItem();

    return () => {
      isMounted = false;
    };
  }, [open, item]);

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "4px",
          overflow: "hidden",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <Box
          sx={{
            height: 40,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#222",
            }}
          >
            {isEditMode ? "Edit Item" : "New Item"}
          </Typography>

          <IconButton
            onClick={handleClose}
            disabled={isLoading}
            size="small"
            sx={{
              width: 24,
              height: 24,
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
          }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 1,
                py: 0,
                fontSize: 11,
              }}
            >
              {formError}
            </Alert>
          )}

          {/* Item Picture */}
          <Typography
            sx={{
              fontSize: 9,
              color: "#555",
              mb: 0.5,
            }}
          >
            Item Picture
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.25,
            }}
          >
            <Box
              onClick={() =>
                !isLoading &&
                fileInputRef.current?.click()
              }
              sx={{
                width: 48,
                height: 48,
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                cursor: isLoading
                  ? "default"
                  : "pointer",
              }}
            >
              {imagePreview ? (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Item preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  <ImageOutlined
                    sx={{
                      fontSize: 16,
                      display: "block",
                      mx: "auto",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 7,
                      lineHeight: 1,
                      mt: 0.25,
                    }}
                  >
                    Preview
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                disabled={isLoading}
                sx={{
                  height: 22,
                  minWidth: 72,
                  px: 1,
                  textTransform: "none",
                  fontSize: 8,
                  color: "#333",
                  borderColor: "#aaa",
                  borderRadius: "2px",
                }}
              >
                No file chosen

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageSelect}
                />
              </Button>

              <Typography
                sx={{
                  fontSize: 7,
                  color: "#999",
                  mt: 0.35,
                }}
              >
                PNG or JPG, max 5MB
              </Typography>
            </Box>
          </Box>

          {imageError && (
            <Typography
              sx={{
                color: "#d32f2f",
                fontSize: 8,
                mb: 1,
              }}
            >
              {imageError}
            </Typography>
          )}

          {/* Item Name */}
          <Typography
            sx={{
              fontSize: 9,
              color: "#555",
              mb: 0.5,
            }}
          >
            Item Name*
          </Typography>

          <TextField
            fullWidth
            value={itemName}
            placeholder="Enter item name"
            onChange={(event) => {
              setItemName(event.target.value);
              setItemNameError("");
              setFormError("");
            }}
            error={Boolean(itemNameError)}
            helperText={itemNameError}
            disabled={isLoading}
            size="small"
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                height: 30,
                borderRadius: "3px",
                fontSize: 9,
              },
              "& .MuiFormHelperText-root": {
                fontSize: 8,
                margin: "2px 0 0",
              },
            }}
          />

          {/* Description */}
          <Typography
            sx={{
              fontSize: 9,
              color: "#555",
              mb: 0.5,
            }}
          >
            Description
          </Typography>

          <TextField
            fullWidth
            value={description}
            placeholder="Enter item description"
            onChange={(event) => {
              if (event.target.value.length <= 500) {
                setDescription(event.target.value);
              }

              setFormError("");
            }}
            multiline
            rows={3}
            disabled={isLoading}
            sx={{
              mb: 0.25,
              "& .MuiOutlinedInput-root": {
                borderRadius: "3px",
                fontSize: 9,
                alignItems: "flex-start",
              },
            }}
          />

          <Typography
            sx={{
              textAlign: "right",
              fontSize: 7,
              color: "#777",
              mb: 1,
            }}
          >
            {description.length}/500
          </Typography>

          {/* Sale Rate + Discount */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 9,
                  color: "#555",
                  mb: 0.5,
                }}
              >
                Sale Rate*
              </Typography>

              <TextField
                fullWidth
                type="number"
                value={salesRate}
                placeholder="0.00"
                onChange={(event) => {
                  setSalesRate(event.target.value);
                  setSalesRateError("");
                  setFormError("");
                }}
                error={Boolean(salesRateError)}
                helperText={salesRateError}
                disabled={isLoading}
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: "0.01",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 30,
                    borderRadius: "3px",
                    fontSize: 9,
                  },
                  "& .MuiFormHelperText-root": {
                    fontSize: 8,
                    margin: "2px 0 0",
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 9,
                  color: "#555",
                  mb: 0.5,
                }}
              >
                Discount %
              </Typography>

              <TextField
                fullWidth
                type="number"
                value={discountPct}
                placeholder="0"
                onChange={(event) => {
                  setDiscountPct(event.target.value);
                  setDiscountError("");
                  setFormError("");
                }}
                error={Boolean(discountError)}
                helperText={discountError}
                disabled={isLoading}
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 100,
                    step: "0.01",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 30,
                    borderRadius: "3px",
                    fontSize: 9,
                  },
                  "& .MuiFormHelperText-root": {
                    fontSize: 8,
                    margin: "2px 0 0",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            height: 48,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              minWidth: 52,
              height: 26,
              textTransform: "none",
              fontSize: 9,
              color: "#555",
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              minWidth: 40,
              height: 26,
              textTransform: "none",
              fontSize: 9,
              borderRadius: "3px",
              backgroundColor: "#555",
              "&:hover": {
                backgroundColor: "#444",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={14}
                color="inherit"
              />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}