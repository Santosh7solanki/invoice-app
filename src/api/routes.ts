const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const routes = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/Auth/Login`,
    SIGNUP: `${API_BASE_URL}/Auth/Signup`,
  },

ITEM: {
  GET_LIST: `${API_BASE_URL}/Item/GetList`,
  INSERT: `${API_BASE_URL}/Item`,
  UPDATE: `${API_BASE_URL}/Item`,
  DELETE: (id: number) => `${API_BASE_URL}/Item/${id}`,

  UPDATE_PICTURE: `${API_BASE_URL}/Item/UpdateItemPicture`,
  PICTURE: (id: number) => `${API_BASE_URL}/Item/Picture/${id}`,
  PICTURE_THUMBNAIL: (id: number) =>
    `${API_BASE_URL}/Item/PictureThumbnail/${id}`,
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
},
};

export default routes;
