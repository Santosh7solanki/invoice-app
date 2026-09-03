/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useAuth } from "@/context/AuthContext";
import invoiceService, {
  type Invoice as ApiInvoice,
} from "@/api/invoice.service";
type RangeType =
  | "Today"
  | "Week"
  | "Month"
  | "Year"
  | "Custom";

type SortKey =
  | "invoiceNo"
  | "invoiceDate"
  | "customerName"
  | "subTotal"
  | "taxPercentage"
  | "taxAmount"
  | "invoiceAmount";

interface ColumnVisibility {
  invoiceNo: boolean;
  invoiceDate: boolean;
  customerName: boolean;
  items: boolean;
  subTotal: boolean;
  taxPercentage: boolean;
  taxAmount: boolean;
  invoiceAmount: boolean;
  actions: boolean;
}

interface TrendItem {
  monthStart: string;
  invoiceCount: number;
  amountSum: number;
}

interface TopItem {
  itemID: number;
  itemName: string;
  amountSum: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [metrics, setMetrics] = useState({
    invoiceCount: 0,
    totalAmount: 0,
  });

  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [range, setRange] =
    useState<RangeType>("Month");

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] =
    useState<SortKey>("invoiceDate");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const [columnAnchor, setColumnAnchor] =
    useState<null | HTMLElement>(null);

  const [columns, setColumns] =
    useState<ColumnVisibility>({
      invoiceNo: true,
      invoiceDate: true,
      customerName: true,
      items: true,
      subTotal: true,
      taxPercentage: true,
      taxAmount: true,
      invoiceAmount: true,
      actions: true,
    });

  const currencySymbol = "₹";

  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDateRange = () => {
    const today = new Date();

    if (range === "Today") {
      return {
        fromDate: formatApiDate(today),
        toDate: formatApiDate(today),
      };
    }

    if (range === "Week") {
      const start = new Date(today);
      const end = new Date(today);

      const day = today.getDay();
      const diff =
        day === 0 ? 6 : day - 1;

      start.setDate(
        today.getDate() - diff
      );

      end.setDate(
        start.getDate() + 6
      );

      return {
        fromDate: formatApiDate(start),
        toDate: formatApiDate(end),
      };
    }

    if (range === "Month") {
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      return {
        fromDate: formatApiDate(start),
        toDate: formatApiDate(end),
      };
    }

    if (range === "Year") {
      const start = new Date(
        today.getFullYear(),
        0,
        1
      );

      const end = new Date(
        today.getFullYear(),
        11,
        31
      );

      return {
        fromDate: formatApiDate(start),
        toDate: formatApiDate(end),
      };
    }

    return {
      fromDate: customFrom,
      toDate: customTo,
    };
  };
const fetchInvoiceData = async () => {
    if (!token) return;

    if (
      range === "Custom" &&
      (!customFrom || !customTo)
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const {
        fromDate,
        toDate,
      } = getDateRange();

      const [
        invoiceResult,
        metricsResult,
        topItemsResult,
      ] = await Promise.all([
        invoiceService.getInvoices(
          token,
          {
            fromDate:
              fromDate || undefined,
            toDate:
              toDate || undefined,
          }
        ),

        invoiceService.getInvoiceMetrics(
          token,
          {
            fromDate:
              fromDate || undefined,
            toDate:
              toDate || undefined,
          }
        ),

        invoiceService.getTopItems(
          token,
          {
            fromDate:
              fromDate || undefined,
            toDate:
              toDate || undefined,
            topN: 5,
          }
        ),
      ]);

      setInvoices(invoiceResult);
      setMetrics(metricsResult);
      setTopItems(topItemsResult);

      setPage(1);
    } catch (error) {
      console.error(
        "Failed to fetch invoice data:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };
const fetchTrend = async () => {
    if (!token) return;

    try {
      const result =
        await invoiceService.getInvoiceTrend12M(
          token
        );

      setTrendData(result);
    } catch (error) {
      console.error(
        "Failed to fetch invoice trend:",
        error
      );

      setTrendData([]);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [
    token,
    range,
    customFrom,
    customTo,
  ]);

  useEffect(() => {
    fetchTrend();
  }, [token]);

  const formatMoney = (
    value: number | undefined
  ) => {
    return `${currencySymbol}${Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (
    value: string
  ) => {
    if (!value) return "-";

    return new Date(
      value
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTrendMonth = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  };
const filteredInvoices = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return invoices;
    }

    return invoices.filter(
      (invoice) =>
        String(invoice.invoiceNo)
          .toLowerCase()
          .includes(value) ||
        invoice.customerName
          .toLowerCase()
          .includes(value)
    );
  }, [invoices, search]);

  const sortedInvoices = useMemo(() => {
    const data = [
      ...filteredInvoices,
    ];

    data.sort((a, b) => {
      let first: string | number =
        a[sortKey] ?? "";

      let second: string | number =
        b[sortKey] ?? "";

      if (sortKey === "invoiceDate") {
        first = new Date(
          a.invoiceDate
        ).getTime();

        second = new Date(
          b.invoiceDate
        ).getTime();
      }

      if (
        typeof first === "string"
      ) {
        const comparison =
          first.localeCompare(
            String(second)
          );

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      }

      const comparison =
        Number(first) -
        Number(second);

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return data;
  }, [
    filteredInvoices,
    sortKey,
    sortDirection,
  ]);

  const paginatedInvoices =
    useMemo(() => {
      const startIndex =
        (page - 1) *
        rowsPerPage;

      return sortedInvoices.slice(
        startIndex,
        startIndex + rowsPerPage
      );
    }, [
      sortedInvoices,
      page,
    ]);

  const maxTrendAmount =
    Math.max(
      1,
      ...trendData.map(
        (item) => item.amountSum
      )
    );

  const handleSort = (
    key: SortKey
  ) => {
    if (sortKey === key) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }

    setPage(1);
  };

  const handleRangeChange = (
    value: RangeType
  ) => {
    setRange(value);
    setPage(1);
  };

  const handleDelete = async (
    invoiceID: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this invoice?"
      );

    if (!confirmed || !token) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(
        token,
        invoiceID
      );
setInvoices(
        (current) =>
          current.filter(
            (invoice) =>
              invoice.invoiceID !==
              invoiceID
          )
      );
const {
        fromDate,
        toDate,
      } = getDateRange();

      const [
        metricsResult,
        topItemsResult,
      ] = await Promise.all([
        invoiceService.getInvoiceMetrics(
          token,
          {
            fromDate:
              fromDate || undefined,
            toDate:
              toDate || undefined,
          }
        ),

        invoiceService.getTopItems(
          token,
          {
            fromDate:
              fromDate || undefined,
            toDate:
              toDate || undefined,
            topN: 5,
          }
        ),
      ]);

      setMetrics(metricsResult);
      setTopItems(topItemsResult);
    } catch (error) {
      console.error(
        "Failed to delete invoice:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete invoice."
      );
    }
  };

  const handleExport = () => {
    const headers = [
      "Invoice No",
      "Invoice Date",
      "Customer",
      "Items",
      "Sub Total",
      "Tax %",
      "Tax Amount",
      "Total",
    ];

    const rows =
      sortedInvoices.map(
        (invoice) => [
          invoice.invoiceNo,
          invoice.invoiceDate,
          invoice.customerName,
          invoice.totalItems ??
            invoice.lines?.length ??
            "",
          Number(
            invoice.subTotal || 0
          ).toFixed(2),
          Number(
            invoice.taxPercentage ||
              0
          ).toFixed(2),
          Number(
            invoice.taxAmount || 0
          ).toFixed(2),
          Number(
            invoice.invoiceAmount ||
              0
          ).toFixed(2),
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "invoices.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  const toggleColumn = (
    key: keyof ColumnVisibility
  ) => {
    setColumns(
      (current) => ({
        ...current,
        [key]: !current[key],
      })
    );
  };

  const visibleColumnCount =
    Object.values(
      columns
    ).filter(Boolean).length;

  const cardSx = {
    borderRadius: 3,
    boxShadow:
      "0 3px 14px rgba(0,0,0,0.06)",
    height: "100%",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "#f5f6f8",
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >

<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: {
      xs: "flex-start",
      md: "center",
    },
    flexDirection: {
      xs: "column",
      md: "row",
    },
    gap: 2,
    mb: 3,
  }}
>
  <Box>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 700,
        color: "#111827",
      }}
    >
      Invoices
    </Typography>

    <Typography
      color="text.secondary"
      sx={{ mt: 0.5 }}
    >
      View, search and manage
      your invoices
    </Typography>
  </Box>

  <Box
    sx={{
      display: "flex",
      alignItems: {
        xs: "flex-start",
        md: "center",
      },
      flexDirection: {
        xs: "column",
        md: "row",
      },
      gap: 1,
      width: {
        xs: "100%",
        md: "auto",
      },
    }}
  >

    <Stack
      direction="row"
      spacing={1}
      sx={{
        flexWrap: "wrap",
      }}
    >
      {(
        [
          "Today",
          "Week",
          "Month",
          "Year",
        ] as RangeType[]
      ).map((item) => (
        <Button
          key={item}
          variant={
            range === item
              ? "contained"
              : "outlined"
          }
          size="small"
          onClick={() =>
            handleRangeChange(item)
          }
        >
          {item}
        </Button>
      ))}

      <Button
        variant={
          range === "Custom"
            ? "contained"
            : "outlined"
        }
        size="small"
        startIcon={<CalendarMonthIcon />}
        onClick={() =>
          handleRangeChange("Custom")
        }
      >
        Custom
      </Button>
    </Stack>

    <Button
      variant="outlined"
      size="small"
      onClick={() => router.push("/dashboard")}
      sx={{
        minWidth: 145,
        height: 32,
        textTransform: "none",
        whiteSpace: "nowrap",
      }}
    >
      Back to Dashboard
    </Button>
  </Box>
</Box>

      {range === "Custom" && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
            }}
          >
            <TextField
              type="date"
              label="From Date"
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={customFrom}
              onChange={(event) => {
                setCustomFrom(
                  event.target.value
                );
                setPage(1);
              }}
            />

            <TextField
              type="date"
              label="To Date"
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={customTo}
              onChange={(event) => {
                setCustomTo(
                  event.target.value
                );
                setPage(1);
              }}
            />
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >

        <Card sx={cardSx}>
          <CardContent>
            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  # Invoices
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                  }}
                >
                  {
                    metrics.invoiceCount
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {range ===
                  "Custom"
                    ? "Custom range"
                    : `This ${range}`}
                </Typography>
              </Box>

              <ReceiptLongIcon />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardContent>
            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  variant="body2"
                >
                  Total Amount
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                  }}
                >
                  {formatMoney(
                    metrics.totalAmount
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Current range
                </Typography>
              </Box>

              <TrendingUpIcon />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={cardSx}>
  <CardContent>
    <Typography color="text.secondary" variant="body2">
      Last 12 Months
    </Typography>

    {trendData.length === 0 ? (
      <Box
        sx={{
          height: 170,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No trend data
        </Typography>
      </Box>
    ) : (
      <Box sx={{ width: "100%", height: 170, mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData.map((item) => ({
              ...item,
              month: new Date(item.monthStart).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                }
              ),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <RechartsTooltip
              formatter={(value) => [
                Number(value ?? 0),
                "Invoices",
              ]}
            />
            <Line
              type="monotone"
              dataKey="invoiceCount"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )}
  </CardContent>
</Card>

<Card sx={cardSx}>
  <CardContent>
    <Typography color="text.secondary" variant="body2">
      Top Items
    </Typography>

    {topItems.length === 0 ||
    topItems.every((item) => Number(item.amountSum) <= 0) ? (
      <Box
        sx={{
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          No items found
        </Typography>
      </Box>
    ) : (
      <Box sx={{ width: "100%", height: 170, mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topItems.filter(
                (item) => Number(item.amountSum) > 0
              )}
              dataKey="amountSum"
              nameKey="itemName"
              cx="50%"
              cy="45%"
              outerRadius={58}
              paddingAngle={2}
            >
              {topItems
                .filter(
                  (item) => Number(item.amountSum) > 0
                )
                .map((item, index) => (
                  <Cell
                    key={`${item.itemID}-${item.itemName}`}
                    fill={
                      [
                        "#1976d2",
                        "#42a5f5",
                        "#66bb6a",
                        "#ffa726",
                        "#ab47bc",
                        "#78909c",
                      ][index % 6]
                    }
                  />
                ))}
            </Pie>

            <RechartsTooltip
              formatter={(value, name, props) => {
                const total = topItems.reduce(
                  (sum, current) =>
                    sum + Number(current.amountSum || 0),
                  0
                );

                const amount = Number(value || 0);
                const share =
                  total > 0
                    ? ((amount / total) * 100).toFixed(1)
                    : "0.0";

                return [
                  `${formatMoney(amount)} (${share}%)`,
                  String(name),
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    )}
  </CardContent>
</Card>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            gap: 2,
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search Invoice No or Customer"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: {
                xs: "100%",
                md: 350,
              },
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent:
                "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={() =>
                router.push(
                  "/invoices/editor"
                )
              }
            >
              New Invoice
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <FileDownloadOutlinedIcon />
              }
              onClick={
                handleExport
              }
            >
              Export
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <ViewColumnOutlinedIcon />
              }
              onClick={(event) =>
                setColumnAnchor(
                  event.currentTarget
                )
              }
            >
              Column Chooser
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Menu
          anchorEl={
            columnAnchor
          }
          open={Boolean(
            columnAnchor
          )}
          onClose={() =>
            setColumnAnchor(
              null
            )
          }
        >
          {(
            [
              [
                "invoiceNo",
                "Invoice No",
              ],
              [
                "invoiceDate",
                "Invoice Date",
              ],
              [
                "customerName",
                "Customer",
              ],
              [
                "items",
                "Items",
              ],
              [
                "subTotal",
                "Sub Total",
              ],
              [
                "taxPercentage",
                "Tax %",
              ],
              [
                "taxAmount",
                "Tax Amount",
              ],
              [
                "invoiceAmount",
                "Total",
              ],
            ] as [
              keyof ColumnVisibility,
              string
            ][]
          ).map(
            ([key, label]) => (
              <MenuItem
                key={key}
                onClick={() =>
                  toggleColumn(
                    key
                  )
                }
              >
                <Chip
                  size="small"
                  label={
                    columns[key]
                      ? "Shown"
                      : "Hidden"
                  }
                  sx={{
                    mr: 1,
                  }}
                />

                {label}
              </MenuItem>
            )
          )}
        </Menu>

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
              <TableRow>
                {columns.invoiceNo && (
                  <TableCell>
                    <TableHeader
                      label="Invoice No"
                      active={
                        sortKey ===
                        "invoiceNo"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "invoiceNo"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.invoiceDate && (
                  <TableCell>
                    <TableHeader
                      label="Invoice Date"
                      active={
                        sortKey ===
                        "invoiceDate"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "invoiceDate"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.customerName && (
                  <TableCell>
                    <TableHeader
                      label="Customer"
                      active={
                        sortKey ===
                        "customerName"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "customerName"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.items && (
                  <TableCell>
                    <strong>
                      Items
                    </strong>
                  </TableCell>
                )}

                {columns.subTotal && (
                  <TableCell align="right">
                    <TableHeader
                      label="Sub Total"
                      active={
                        sortKey ===
                        "subTotal"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "subTotal"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.taxPercentage && (
                  <TableCell align="right">
                    <TableHeader
                      label="Tax %"
                      active={
                        sortKey ===
                        "taxPercentage"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "taxPercentage"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.taxAmount && (
                  <TableCell align="right">
                    <TableHeader
                      label="Tax Amt"
                      active={
                        sortKey ===
                        "taxAmount"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "taxAmount"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.invoiceAmount && (
                  <TableCell align="right">
                    <TableHeader
                      label="Total"
                      active={
                        sortKey ===
                        "invoiceAmount"
                      }
                      direction={
                        sortDirection
                      }
                      onClick={() =>
                        handleSort(
                          "invoiceAmount"
                        )
                      }
                    />
                  </TableCell>
                )}

                {columns.actions && (
                  <TableCell align="center">
                    <strong>
                      Actions
                    </strong>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumnCount
                    }
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <Typography color="text.secondary">
                      Loading invoices...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedInvoices.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumnCount
                    }
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <Typography color="text.secondary">
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map(
                  (invoice) => (
                    <TableRow
                      key={
                        invoice.invoiceID
                      }
                      hover
                    >
                      {columns.invoiceNo && (
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            #
                            {
                              invoice.invoiceNo
                            }
                          </Typography>
                        </TableCell>
                      )}

                      {columns.invoiceDate && (
                        <TableCell>
                          {formatDate(
                            invoice.invoiceDate
                          )}
                        </TableCell>
                      )}

                      {columns.customerName && (
                        <TableCell>
                          {
                            invoice.customerName
                          }
                        </TableCell>
                      )}

                      {columns.items && (
                        <TableCell>
                          {
                            invoice.totalItems ??
                              invoice.lines
                                ?.length ??
                              "-"
                          }
                        </TableCell>
                      )}

                      {columns.subTotal && (
                        <TableCell align="right">
                          {formatMoney(
                            invoice.subTotal
                          )}
                        </TableCell>
                      )}

                      {columns.taxPercentage && (
                        <TableCell align="right">
                          {Number(
                            invoice.taxPercentage ||
                              0
                          ).toFixed(
                            2
                          )}
                          %
                        </TableCell>
                      )}

                      {columns.taxAmount && (
                        <TableCell align="right">
                          {formatMoney(
                            invoice.taxAmount
                          )}
                        </TableCell>
                      )}

                      {columns.invoiceAmount && (
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {formatMoney(
                              invoice.invoiceAmount
                            )}
                          </Typography>
                        </TableCell>
                      )}

                      {columns.actions && (
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(
                                  `/invoices/editor?id=${invoice.invoiceID}`
                                )
                              }
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Print">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(
                                  `/invoices/editor?id=${invoice.invoiceID}&print=true`
                                )
                              }
                            >
                              <PrintOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDelete(
                                  invoice.invoiceID
                                )
                              }
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
            p: 2,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                py: 5,
                textAlign:
                  "center",
              }}
            >
              <Typography color="text.secondary">
                Loading invoices...
              </Typography>
            </Box>
          ) : paginatedInvoices.length ===
            0 ? (
            <Box
              sx={{
                py: 5,
                textAlign:
                  "center",
              }}
            >
              <Typography color="text.secondary">
                No invoices found
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {paginatedInvoices.map(
                (invoice) => (
                  <Card
                    key={
                      invoice.invoiceID
                    }
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                            variant="h6"
                          >
                            #
                            {
                              invoice.invoiceNo
                            }
                          </Typography>

                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            {
                              invoice.customerName
                            }
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {formatMoney(
                            invoice.invoiceAmount
                          )}
                        </Typography>
                      </Stack>

                      <Divider
                        sx={{
                          my: 1.5,
                        }}
                      />

                      <Stack spacing={1}>
                        <MobileRow
                          label="Date"
                          value={formatDate(
                            invoice.invoiceDate
                          )}
                        />

                        <MobileRow
                          label="Items"
                          value={String(
                            invoice.totalItems ??
                              invoice.lines
                                ?.length ??
                              "-"
                          )}
                        />

                        <MobileRow
                          label="Sub Total"
                          value={formatMoney(
                            invoice.subTotal
                          )}
                        />

                        <MobileRow
                          label="Tax"
                          value={`${Number(
                            invoice.taxPercentage ||
                              0
                          ).toFixed(
                            2
                          )}%`}
                        />

                        <MobileRow
                          label="Tax Amount"
                          value={formatMoney(
                            invoice.taxAmount
                          )}
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          mt: 1,
                          justifyContent:
                            "flex-end",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(
                              `/invoices/editor?id=${invoice.invoiceID}`
                            )
                          }
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(
                              `/invoices/editor?id=${invoice.invoiceID}&print=true`
                            )
                          }
                        >
                          <PrintOutlinedIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDelete(
                              invoice.invoiceID
                            )
                          }
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                )
              )}
            </Stack>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <Pagination
            page={page}
            count={Math.max(
              1,
              Math.ceil(
                sortedInvoices.length /
                  rowsPerPage
              )
            )}
            onChange={(_, value) =>
              setPage(value)
            }
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
}

function TableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <Button
      variant="text"
      onClick={onClick}
      sx={{
        p: 0,
        minWidth: 0,
        textTransform:
          "none",
        fontWeight: 700,
        color:
          "text.primary",
      }}
    >
      {label}

      <Box
        component="span"
        sx={{
          ml: 0.5,
          fontSize: 12,
          opacity: active
            ? 1
            : 0.35,
        }}
      >
        {active
          ? direction ===
            "asc"
            ? "↑"
            : "↓"
          : "↕"}
      </Box>
    </Button>
  );
}

function MobileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent:
          "space-between",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
