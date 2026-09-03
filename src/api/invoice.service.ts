import routes from "@/api/routes";

export interface InvoiceLine {
  rowNo: number;
  itemID: number;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
}

export interface Invoice {
  primaryKeyID: number;
  invoiceID: number;
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  address: string;
  city: string;
  taxPercentage: number;
  notes: string;
  lines?: InvoiceLine[];
  subTotal?: number;
  taxAmount?: number;
  invoiceAmount?: number;
  createdByUserName: string;
  createdOn: string;
  updatedByUserName: string;
  updatedOn: string | null;
   totalItems?: number;
}

export interface CreateInvoiceRequest {
  invoiceNo: number | string;
  invoiceDate: string;
  customerName: string;
  address: string;
  city: string;
  taxPercentage: number;
  notes: string;
  lines: InvoiceLine[];
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  updatedOn: string | null;
  invoiceID: number;
}

export interface InvoiceMutationResponse {
  primaryKeyID: number;
  updatedOn: string | null;
  additionalResponseData: {
    SubTotal: number;
    TaxAmount: number;
    InvoiceAmount: number;
  } | null;
  noOfRecordsEffected: number;
}

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const getInvoices = async (
  token: string,
  params?: {
    invoiceID?: number;
    fromDate?: string;
    toDate?: string;
  }
): Promise<Invoice[]> => {
  const searchParams = new URLSearchParams();

  if (params?.invoiceID !== undefined) {
    searchParams.append("InvoiceID", String(params.invoiceID));
  }

  if (params?.fromDate) {
    searchParams.append("fromDate", params.fromDate);
  }

  if (params?.toDate) {
    searchParams.append("toDate", params.toDate);
  }

  const queryString = searchParams.toString();

  const response = await fetch(
    `${routes.INVOICE.GET_LIST}${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to fetch invoices."
    );
  }

  return result;
};

const createInvoice = async (
  token: string,
  data: CreateInvoiceRequest
): Promise<InvoiceMutationResponse> => {
  const response = await fetch(routes.INVOICE.INSERT, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to create invoice."
    );
  }

  return result;
};

const updateInvoice = async (
  token: string,
  data: UpdateInvoiceRequest
): Promise<InvoiceMutationResponse> => {
  const response = await fetch(routes.INVOICE.UPDATE, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const responseText = await response.text();

  let result: unknown = null;

  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = responseText;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result &&
          typeof result === "object" &&
          "message" in result &&
          typeof result.message === "string"
        ? result.message
        : "Failed to update invoice."
    );
  }

  return result as InvoiceMutationResponse;
};

const deleteInvoice = async (
  token: string,
  invoiceID: number
): Promise<boolean> => {
  const response = await fetch(routes.INVOICE.DELETE(invoiceID), {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const result = await response.text();

    throw new Error(
      result || "Failed to delete invoice."
    );
  }

  return true;
};

const getInvoiceById = async (
  token: string,
  invoiceID: number
): Promise<Invoice> => {
  const response = await fetch(
    routes.INVOICE.GET_BY_ID(invoiceID),
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to fetch invoice."
    );
  }

  return result;
};

const getInvoiceMetrics = async (
  token: string,
  params?: {
    fromDate?: string;
    toDate?: string;
  }
): Promise<{
  invoiceCount: number;
  totalAmount: number;
}> => {
  const searchParams = new URLSearchParams();

  if (params?.fromDate) {
    searchParams.append("fromDate", params.fromDate);
  }

  if (params?.toDate) {
    searchParams.append("toDate", params.toDate);
  }

  const queryString = searchParams.toString();

  const response = await fetch(
    `${routes.INVOICE.GET_METRICS}${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to fetch invoice metrics."
    );
  }

  return result?.[0] ?? {
    invoiceCount: 0,
    totalAmount: 0,
  };
};

const getInvoiceTrend12M = async (
  token: string,
  asOf?: string
): Promise<
  {
    monthStart: string;
    invoiceCount: number;
    amountSum: number;
  }[]
> => {
  const searchParams = new URLSearchParams();

  if (asOf) {
    searchParams.append("asOf", asOf);
  }

  const queryString = searchParams.toString();

  const response = await fetch(
    `${routes.INVOICE.GET_TREND_12M}${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
            "Failed to fetch invoice trend."
    );
  }

  return Array.isArray(result) ? result : [];
};

const getTopItems = async (
  token: string,
  params?: {
    fromDate?: string;
    toDate?: string;
    topN?: number;
  }
): Promise<
  {
    itemID: number;
    itemName: string;
    amountSum: number;
  }[]
> => {
  const searchParams = new URLSearchParams();

  if (params?.fromDate) {
    searchParams.append(
      "fromDate",
      params.fromDate
    );
  }

  if (params?.toDate) {
    searchParams.append(
      "toDate",
      params.toDate
    );
  }

  searchParams.append(
    "topN",
    String(params?.topN ?? 5)
  );

  const response = await fetch(
    `${routes.INVOICE.TOP_ITEMS}?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
            "Failed to fetch top items."
    );
  }

  return Array.isArray(result) ? result : [];
};

const invoiceService = {
  getInvoices,
  getInvoiceById,
  getInvoiceMetrics,
  getInvoiceTrend12M,
  getTopItems,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};

export default invoiceService;
