export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type MenuItemInput = {
  name: string;
  description: string;
  price: number;
};

export type MenuItemListResponse = {
  data: MenuItem[];
};

export type MenuItemResponse = {
  data: MenuItem;
};

export type DeleteMenuItemResponse = {
  data: {
    deleted: true;
  };
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};
