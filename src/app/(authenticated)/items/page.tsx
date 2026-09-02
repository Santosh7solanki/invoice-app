"use client";

import { useMemo, useState,useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  FileDownloadOutlined,
  ViewColumnOutlined,
} from "@mui/icons-material";

import AddItemForm from "@/components/forms/AddItemForm";
import itemService, { Item } from "@/api/item.service";

type SortField =
  | "itemName"
  | "description"
  | "salesRate"
  | "discountPct";

type SortDirection = "asc" | "desc";

const initialColumns = {
  picture: true,
  itemName: true,
  description: true,
  salesRate: true,
  discountPct: true,
  actions: true,
};

export default function ItemsPage() {
const [items, setItems] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(true);

const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState<SortField>("itemName");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [columns, setColumns] = useState(initialColumns);

  const [columnMenuAnchor, setColumnMenuAnchor] =
    useState<null | HTMLElement>(null);

const [selectedItem, setSelectedItem] = useState<Item | null>(null);

const [deleteItemData, setDeleteItemData] =
  useState<Item | null>(null);

const [isDeleteOpen, setIsDeleteOpen] = useState(false);

const [isDeleting, setIsDeleting] = useState(false);


const fetchItems = async () => {
  try {
    setIsLoading(true);

    const data = await itemService.getItems();
console.log("dddddddddddddddddd", data);
    setItems(data);
  } catch (error) {
    console.error("Failed to fetch items:", error);
  } finally {
    setIsLoading(false);
  }
};



useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchItems();
}, []);





  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (!searchValue) {
        return true;
      }

      return (
        item.itemName.toLowerCase().includes(searchValue) ||
        item.description?.toLowerCase().includes(searchValue)
      );
    });

    return [...filtered].sort((a, b) => {
      let first: string | number | null;
      let second: string | number | null;

      switch (sortField) {
        case "salesRate":
          first = a.salesRate;
          second = b.salesRate;
          break;

        case "discountPct":
          first = a.discountPct;
          second = b.discountPct;
          break;

        case "description":
          first = a.description || "";
          second = b.description || "";
          break;

        default:
          first = a.itemName;
          second = b.itemName;
      }

      if (typeof first === "number" && typeof second === "number") {
        return sortDirection === "asc"
          ? first - second
          : second - first;
      }

      return sortDirection === "asc"
        ? String(first).localeCompare(String(second))
        : String(second).localeCompare(String(first));
    });
  }, [items, search, sortField, sortDirection]);

  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleExport = () => {
    if (!filteredItems.length) {
      return;
    }

    const headers = [
      "Item Name",
      "Description",
      "Sale Rate",
      "Discount %",
    ];

    const rows = filteredItems.map((item) => [
      item.itemName,
      item.description || "",
      item.salesRate.toFixed(2),
      item.discountPct.toFixed(2),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "items.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const toggleColumn = (
    column: keyof typeof initialColumns
  ) => {
    setColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  };

  return (
    <Box
  sx={{
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    color: "#222",
    p: {
      xs: 2,
      sm: 3,
      md: 4,
    },
  }}
>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Items
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Manage your product and service catalog.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
    onClick={() => {
  setSelectedItem(null);
  setIsAddItemOpen(true);
}}
          sx={{
            minWidth: 145,
            height: 40,
            textTransform: "none",
          }}
        >
          Add New Item
        </Button>
      </Box>

      {/* Action Bar */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            p: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Search by item name or description"
            sx={{
              width: {
                xs: "100%",
                sm: 320,
              },
            }}
            slotProps={{
              htmlInput: {
                "aria-label":
                  "Search items by item name or description",
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlined />}
              onClick={handleExport}
              sx={{ textTransform: "none" }}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ViewColumnOutlined />}
              onClick={(event) =>
                setColumnMenuAnchor(event.currentTarget)
              }
              sx={{ textTransform: "none" }}
            >
              Columns
            </Button>

            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={() => setColumnMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => toggleColumn("itemName")}
              >
                <Checkbox checked={columns.itemName} />
                Item Name
              </MenuItem>

              <MenuItem
                onClick={() =>
                  toggleColumn("description")
                }
              >
                <Checkbox checked={columns.description} />
                Description
              </MenuItem>

              <MenuItem
                onClick={() => toggleColumn("salesRate")}
              >
                <Checkbox checked={columns.salesRate} />
                Sale Rate
              </MenuItem>

              <MenuItem
                onClick={() =>
                  toggleColumn("discountPct")
                }
              >
                <Checkbox checked={columns.discountPct} />
                Discount %
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* Desktop Grid */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "action.hover",
                }}
              >
                {columns.picture && (
                  <TableCell
                    sx={{
                      width: 80,
                      fontWeight: 600,
                    }}
                  >
                    Picture
                  </TableCell>
                )}

                {columns.itemName && (
                  <TableCell
                    onClick={() =>
                      handleSort("itemName")
                    }
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Item Name{" "}
                    {sortField === "itemName" &&
                      (sortDirection === "asc"
                        ? "↑"
                        : "↓")}
                  </TableCell>
                )}

                {columns.description && (
                  <TableCell
                    onClick={() =>
                      handleSort("description")
                    }
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Description{" "}
                    {sortField === "description" &&
                      (sortDirection === "asc"
                        ? "↑"
                        : "↓")}
                  </TableCell>
                )}

                {columns.salesRate && (
                  <TableCell
                    align="right"
                    onClick={() =>
                      handleSort("salesRate")
                    }
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Sale Rate{" "}
                    {sortField === "salesRate" &&
                      (sortDirection === "asc"
                        ? "↑"
                        : "↓")}
                  </TableCell>
                )}

                {columns.discountPct && (
                  <TableCell
                    align="right"
                    onClick={() =>
                      handleSort("discountPct")
                    }
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Discount %{" "}
                    {sortField === "discountPct" &&
                      (sortDirection === "asc"
                        ? "↑"
                        : "↓")}
                  </TableCell>
                )}

                {columns.actions && (
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow
                    key={item.itemID}
                    hover
                  >
                    {columns.picture && (
                      <TableCell>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            backgroundColor:
                              "action.hover",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          📦
                        </Box>
                      </TableCell>
                    )}

                    {columns.itemName && (
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {item.itemName}
                        </Typography>
                      </TableCell>
                    )}

                    {columns.description && (
                      <TableCell>
                        <Tooltip
                          title={item.description || ""}
                        >
                          <Typography
                            sx={{
                              maxWidth: 320,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.description || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    )}

                    {columns.salesRate && (
                      <TableCell align="right">
                        {item.salesRate.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                    )}

                    {columns.discountPct && (
                      <TableCell align="right">
                        {item.discountPct.toFixed(2)}%
                      </TableCell>
                    )}

                    {columns.actions && (
                      <TableCell align="right">
                        <Tooltip title="Edit">
                  <IconButton
  size="small"
  aria-label={`Edit ${item.itemName}`}
  onClick={() => {
    setSelectedItem(item);
    setIsAddItemOpen(true);
  }}
>
  <EditOutlined fontSize="small" />
</IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                       <IconButton
  size="small"
  color="error"
  aria-label={`Delete ${item.itemName}`}
  onClick={() => {
    setDeleteItemData(item);
    setIsDeleteOpen(true);
  }}
>
  <DeleteOutlined fontSize="small" />
</IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      py: 8,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      No items found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Add your first item to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Mobile Cards */}
        <Box
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
          }}
        >
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <Box
                key={item.itemID}
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      flexShrink: 0,
                      borderRadius: 1,
                      backgroundColor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    📦
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {item.itemName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.description || "-"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {item.salesRate.toFixed(2)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.discountPct.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label={`Edit ${item.itemName}`}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Delete ${item.itemName}`}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            <Box
              sx={{
                py: 8,
                px: 2,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                No items found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Add your first item to get started.
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        <TablePagination
          component="div"
          count={filteredItems.length}
          page={page}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              Number(event.target.value)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page"
        />
      </Paper>
    
<Dialog
  open={isDeleteOpen}
  onClose={() => {
    if (!isDeleting) {
      setIsDeleteOpen(false);
      setDeleteItemData(null);
    }
  }}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>
    Delete Item?
  </DialogTitle>

  <DialogContent>
    <Typography>
      Are you sure you want to delete{" "}
      <strong>{deleteItemData?.itemName}</strong>?
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => {
        setIsDeleteOpen(false);
        setDeleteItemData(null);
      }}
      disabled={isDeleting}
    >
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      disabled={isDeleting}
      onClick={async () => {
        if (!deleteItemData) return;

        try {
          setIsDeleting(true);

          await itemService.deleteItem(
            deleteItemData
          );

          setIsDeleteOpen(false);
          setDeleteItemData(null);

          await fetchItems();
        } catch (error) {
          console.error("Failed to delete item:", error);
        } finally {
          setIsDeleting(false);
        }
      }}
    >
      {isDeleting ? (
        <CircularProgress size={18} color="inherit" />
      ) : (
        "Delete"
      )}
    </Button>
  </DialogActions>
</Dialog>


<AddItemForm
  open={isAddItemOpen}
  item={selectedItem}
  onClose={() => {
    setIsAddItemOpen(false);
    setSelectedItem(null);
  }}
  onSuccess={fetchItems}
/>

    </Box>
  );
}