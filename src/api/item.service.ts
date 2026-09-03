import routes from "@/api/routes";
import { getSecureItem } from "@/utils/secureStorage";

const TOKEN_KEY = "invoiceapp_token";

export interface Item {
  primaryKeyID: number;
  itemID: number;
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number;
  createdByUserName: string;
  createdOn: string;
  updatedByUserName: string;
  updatedOn: string | null;
}

export interface CreateItemRequest {
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number;
}

export interface UpdateItemRequest {
  updatedOn: string | null;
  itemID: number;
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number;
}

export interface ItemRequest {
  itemID?: number;
  itemName: string;
  description: string | null;
  salesRate: number;
  discountPct: number;
  updatedOnPrev?: string | null;
}

export interface ItemMutationResponse {
  primaryKeyID: number;
  updatedOn: string | null;
  additionalResponseData: unknown;
  noOfRecordsEffected: number;
}

const getAuthHeaders = () => {
  const token = getSecureItem<string>(TOKEN_KEY);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get Items
const getItems = async (): Promise<Item[]> => {
  const response = await fetch(routes.ITEM.GET_LIST, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to fetch items."
    );
  }

  return result;
};




// Update Item
const updateItem = async (
  data: UpdateItemRequest
): Promise<ItemMutationResponse> => {
  const response = await fetch(routes.ITEM.UPDATE, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to update item."
    );
  }

  return result;
};


// Delete Item
const deleteItem = async (data: ItemRequest) => {
  const itemID = data?.itemID;

  if (itemID === undefined || itemID === null) {
    throw new Error("Item ID is required for deletion.");
  }

  const response = await fetch(routes.ITEM.DELETE(itemID), {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      data,
    }),
  });

  if (!response.ok) {
    const result = await response.text();

    throw new Error(
      result || "Failed to delete item."
    );
  }

  return true;
};


const uploadItemImage = async (
  itemID: number,
  file: File
) => {
  const token = getSecureItem<string>(TOKEN_KEY);

  const formData = new FormData();

  formData.append("ItemID", String(itemID));
  formData.append("File", file);

  const response = await fetch(routes.ITEM.UPDATE_PICTURE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const result = await response.text();

    throw new Error(
      result || "Failed to upload item image."
    );
  }

  return true;
};

const getItemImageUrl = async (
  itemID: number
): Promise<string> => {
  const token = getSecureItem<string>(TOKEN_KEY);

  const response = await fetch(
    routes.ITEM.PICTURE(itemID),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get item image.");
  }

  return response.text();
};

const getItemThumbnailUrl = async (
  itemID: number
): Promise<string> => {
  const token = getSecureItem<string>(TOKEN_KEY);

  const response = await fetch(
    routes.ITEM.PICTURE_THUMBNAIL(itemID),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get item thumbnail.");
  }

  return response.text();
};

// Create Item
const addItem = async (
  data: ItemRequest
) => {
  const response = await fetch(routes.ITEM.INSERT, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Failed to save item."
    );
  }

  return result;
};

const itemService = {
  getItems,
  updateItem,
  deleteItem,
  addItem,
  uploadItemImage,
  getItemImageUrl,
  getItemThumbnailUrl,
};

export default itemService;