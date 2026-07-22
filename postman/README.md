# Postman API Checks

Import `menu-backend-api.postman_collection.json` into Postman, start the backend with the demo access token, then run the collection in order.

```sh
MENU_ADMIN_ACCESS_TOKEN=demo-local-token npm run backend:start
```

The collection uses these variables:

- `baseUrl`: defaults to `http://127.0.0.1:4000`
- `restaurantId`: defaults to `demo-restaurant`
- `alternateRestaurantId`: defaults to `harbor-cafe`
- `accessToken`: defaults to `demo-local-token`
- `itemId`: filled automatically after the create request

The runner covers:

- health check
- 401 when a menu request has no token
- list menu items
- list another restaurant's seed menu
- create menu item
- read created item back through list
- update menu item
- validation error for bad input
- 404 for missing item
- delete menu item
- confirm deleted item is no longer listed

If you start the backend without `MENU_ADMIN_ACCESS_TOKEN`, skip the no-token request because auth is disabled in that mode.

This collection creates and deletes its own test item. It may leave data behind only if the run is stopped before the delete request.
