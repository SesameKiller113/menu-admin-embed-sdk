import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Typography from "@mui/material/Typography";
import {
  createMenuItemsClient,
  type MenuItem,
  type MenuItemsClient
} from "@menu-admin-embed-sdk/core";
import { RefreshCcw } from "lucide-react";
import { DeleteMenuItemDialog } from "./components/DeleteMenuItemDialog";
import {
  AppFrame,
  ContentGrid,
  HeaderCopy,
  HeaderPanel,
  PageContainer
} from "./components/layout";
import { MenuItemForm } from "./components/MenuItemForm";
import { MenuItemList } from "./components/MenuItemList";
import { menuAdminConfig } from "./config";
import { validateMenuItemForm } from "./formValidation";
import type { MenuItemFormErrors, MenuItemFormValues } from "./formValidation";
import { menuAdminTheme } from "./theme";

const emptyForm: MenuItemFormValues = {
  name: "",
  description: "",
  price: ""
};

export default function App() {
  const client = useMemo(() => createMenuItemsClient(menuAdminConfig), []);

  return (
    <ThemeProvider theme={menuAdminTheme}>
      <CssBaseline />
      <MenuAdminApp
        client={client}
        restaurantId={menuAdminConfig.restaurantId}
      />
    </ThemeProvider>
  );
}

type MenuAdminAppProps = {
  client: MenuItemsClient;
  restaurantId: string;
};

export function MenuAdminApp({ client, restaurantId }: MenuAdminAppProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [formValues, setFormValues] = useState<MenuItemFormValues>(emptyForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<MenuItemFormErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const loadMenuItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setItems(await client.listMenuItems());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadMenuItems();
  }, [loadMenuItems]);

  const isEditing = editingItemId !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);

    const validation = validateMenuItemForm(formValues);

    if (!validation.ok) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      const savedItem = isEditing
        ? await client.updateMenuItem(editingItemId, validation.value)
        : await client.createMenuItem(validation.value);

      setItems((currentItems) =>
        isEditing
          ? currentItems.map((item) =>
              item.id === savedItem.id ? savedItem : item
            )
          : [...currentItems, savedItem]
      );
      resetForm();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(item: MenuItem) {
    setEditingItemId(item.id);
    setFormValues({
      name: item.name,
      description: item.description,
      price: String(item.price)
    });
    setFormErrors({});
    setSaveError(null);
  }

  function resetForm() {
    setEditingItemId(null);
    setFormValues(emptyForm);
    setFormErrors({});
    setSaveError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeletingItemId(deleteTarget.id);
    setSaveError(null);

    try {
      await client.deleteMenuItem(deleteTarget.id);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== deleteTarget.id)
      );

      if (editingItemId === deleteTarget.id) {
        resetForm();
      }

      setDeleteTarget(null);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setDeletingItemId(null);
    }
  }

  return (
    <AppFrame>
      <PageContainer>
        <HeaderPanel>
          <HeaderCopy>
            <Typography component="h1" variant="h1">
              Menu Admin
            </Typography>
            <Typography color="text.secondary">
              Managing menu for <strong>{restaurantId}</strong>
            </Typography>
          </HeaderCopy>
          <Button
            disabled={isLoading}
            onClick={() => void loadMenuItems()}
            startIcon={<RefreshCcw size={18} />}
            type="button"
            variant="outlined"
          >
            Refresh
          </Button>
        </HeaderPanel>

        {loadError ? (
          <Alert severity="error">
            Could not load menu items. {loadError}
          </Alert>
        ) : null}

        {saveError ? (
          <Alert severity="error">
            Could not save menu changes. {saveError}
          </Alert>
        ) : null}

        <ContentGrid>
          <MenuItemForm
            errors={formErrors}
            isEditing={isEditing}
            isSaving={isSaving}
            onCancelEdit={resetForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
            values={formValues}
          />
          <MenuItemList
            deletingItemId={deletingItemId}
            isLoading={isLoading}
            isSaving={isSaving}
            items={items}
            onDelete={setDeleteTarget}
            onEdit={startEditing}
          />
        </ContentGrid>
      </PageContainer>

      <DeleteMenuItemDialog
        isDeleting={deletingItemId !== null}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </AppFrame>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
