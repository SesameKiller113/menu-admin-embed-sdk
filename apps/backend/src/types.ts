export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemRequest = {
  name: string;
  description: string;
  price: number;
};

export type UpdateMenuItemRequest = Partial<CreateMenuItemRequest>;

export type MenuItemResponse = {
  data: MenuItem;
};

export type MenuItemListResponse = {
  data: MenuItem[];
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};
