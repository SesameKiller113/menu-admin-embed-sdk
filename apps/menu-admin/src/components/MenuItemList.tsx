import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { CircleAlert, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatPrice } from "../format";
import type { MenuItem } from "../types";
import { PanelHeader } from "./layout";

type MenuItemListProps = {
  deletingItemId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  items: MenuItem[];
  onDelete: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
};

export function MenuItemList({
  deletingItemId,
  isLoading,
  isSaving,
  items,
  onDelete,
  onEdit
}: MenuItemListProps) {
  return (
    <ListPanel>
      <PanelHeader>
        <Typography component="h2" variant="h2">
          Menu items
        </Typography>
        <Chip label={`${items.length} items`} variant="outlined" />
      </PanelHeader>

      {isLoading ? (
        <StatusPanel>
          <CircularProgress size={28} />
          <Typography>Loading menu items...</Typography>
        </StatusPanel>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <StatusPanel>
          <CircleAlert size={24} />
          <Typography>No menu items yet.</Typography>
          <Typography color="text.secondary" variant="body2">
            Add the first item with the form.
          </Typography>
        </StatusPanel>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <MenuGrid>
          {items.map((item) => (
            <MenuCard key={item.id} variant="outlined">
              <CardContent>
                <MenuItemHeader>
                  <Typography component="h3" variant="h6">
                    {item.name}
                  </Typography>
                  <PriceText>${formatPrice(item.price)}</PriceText>
                </MenuItemHeader>
                <Typography color="text.secondary">
                  {item.description}
                </Typography>
                <CardMeta>Updated {formatDate(item.updatedAt)}</CardMeta>
              </CardContent>
              <Divider />
              <CardActions>
                <Tooltip title="Edit item">
                  <IconButton
                    aria-label={`Edit ${item.name}`}
                    disabled={isSaving || deletingItemId !== null}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete item">
                  <IconButton
                    aria-label={`Delete ${item.name}`}
                    color="error"
                    disabled={isSaving || deletingItemId !== null}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </MenuCard>
          ))}
        </MenuGrid>
      ) : null}
    </ListPanel>
  );
}

const ListPanel = styled(Paper)(({ theme }) => ({
  border: "1px solid #dbe4ee",
  display: "grid",
  gap: theme.spacing(2),
  padding: theme.spacing(3)
}));

const StatusPanel = styled("div")(({ theme }) => ({
  alignItems: "center",
  border: "1px dashed #b8c7d9",
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.secondary,
  display: "grid",
  gap: theme.spacing(1),
  justifyItems: "center",
  minHeight: 220,
  padding: theme.spacing(4),
  textAlign: "center"
}));

const MenuGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
}));

const MenuCard = styled(Card)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
}));

const MenuItemHeader = styled("div")(({ theme }) => ({
  alignItems: "flex-start",
  display: "flex",
  gap: theme.spacing(1),
  justifyContent: "space-between"
}));

const PriceText = styled("strong")(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: "1rem",
  whiteSpace: "nowrap"
}));

const CardMeta = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.8rem",
  marginTop: theme.spacing(2)
}));
