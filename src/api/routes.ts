const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const routes = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/Auth/Login`,
    SIGNUP: `${API_BASE_URL}/Auth/Signup`,
  },

ITEM: {
  GET_LIST: `${API_BASE_URL}/Item/GetList`,
  GET_LOOKUP_LIST: `${API_BASE_URL}/Item/GetLookupList`,

  INSERT: `${API_BASE_URL}/Item`,
  UPDATE: `${API_BASE_URL}/Item`,
  DELETE: (id: number) => `${API_BASE_URL}/Item/${id}`,

  PICTURE: `${API_BASE_URL}/Item/Picture`,
  PICTURE_THUMBNAIL: `${API_BASE_URL}/Item/PictureThumbnail`,
},

INVOICE: {
  GET_LIST: `${API_BASE_URL}/Invoice/GetList`,
  GET_BY_ID: (id: number) => `${API_BASE_URL}/Invoice/${id}`,
  INSERT: `${API_BASE_URL}/Invoice/`,
  UPDATE: `${API_BASE_URL}/Invoice/`,
  DELETE: (id: number) => `${API_BASE_URL}/Invoice/${id}`,
  GET_METRICS: `${API_BASE_URL}/Invoice/GetMetrices`,
  GET_TREND_12M: `${API_BASE_URL}/Invoice/GetTrend12M`,
  TOP_ITEMS: `${API_BASE_URL}/Invoice/TopItems`,
  PRINT_VIEW: `${API_BASE_URL}/Invoice/PrintView`,
},
};

export default routes;