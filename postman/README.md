# Postman API Checks

Import `menu-backend-api.postman_collection.json` into Postman, start the backend, then run the collection in order.

```sh
npm run backend:start
```

The collection uses these variables:

- `baseUrl`: defaults to `http://127.0.0.1:4000`
- `restaurantId`: defaults to `demo-restaurant`
- `itemId`: filled automatically after the create request

The runner covers:

- health check
- list menu items
- create menu item
- read created item back through list
- update menu item
- validation error for bad input
- 404 for missing item
- delete menu item
- confirm deleted item is no longer listed

This collection creates and deletes its own test item. It may leave data behind only if the run is stopped before the delete request.
