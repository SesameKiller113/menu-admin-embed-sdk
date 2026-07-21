import type { FormEvent } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Check, Plus, X } from "lucide-react";
import type { MenuItemFormErrors, MenuItemFormValues } from "../formValidation";
import { PanelHeader } from "./layout";

type MenuItemFormProps = {
  errors: MenuItemFormErrors;
  isEditing: boolean;
  isSaving: boolean;
  onCancelEdit: () => void;
  onChange: (values: MenuItemFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  values: MenuItemFormValues;
};

export function MenuItemForm({
  errors,
  isEditing,
  isSaving,
  onCancelEdit,
  onChange,
  onSubmit,
  values
}: MenuItemFormProps) {
  return (
    <FormPanel elevation={0}>
      <PanelHeader>
        <Typography component="h2" variant="h2">
          {isEditing ? "Edit item" : "Add item"}
        </Typography>
        {isEditing ? <Chip label="Editing" color="primary" /> : null}
      </PanelHeader>
      <StyledForm onSubmit={onSubmit}>
        <TextField
          disabled={isSaving}
          error={Boolean(errors.name)}
          fullWidth
          helperText={errors.name}
          label="Name"
          onChange={(event) =>
            onChange({
              ...values,
              name: event.target.value
            })
          }
          value={values.name}
        />
        <TextField
          disabled={isSaving}
          error={Boolean(errors.description)}
          fullWidth
          helperText={errors.description}
          label="Description"
          minRows={3}
          multiline
          onChange={(event) =>
            onChange({
              ...values,
              description: event.target.value
            })
          }
          value={values.description}
        />
        <TextField
          disabled={isSaving}
          error={Boolean(errors.price)}
          fullWidth
          helperText={errors.price || "Use dollars, like 19.5"}
          inputProps={{ min: "0", step: "0.01" }}
          label="Price"
          onChange={(event) =>
            onChange({
              ...values,
              price: event.target.value
            })
          }
          type="number"
          value={values.price}
        />
        <ActionRow>
          <Button
            disabled={isSaving}
            startIcon={isEditing ? <Check size={18} /> : <Plus size={18} />}
            type="submit"
            variant="contained"
          >
            {isSaving ? "Saving" : isEditing ? "Save changes" : "Add item"}
          </Button>
          {isEditing ? (
            <Button
              disabled={isSaving}
              onClick={onCancelEdit}
              startIcon={<X size={18} />}
              type="button"
              variant="outlined"
            >
              Cancel
            </Button>
          ) : null}
        </ActionRow>
      </StyledForm>
    </FormPanel>
  );
}

const FormPanel = styled(Paper)(({ theme }) => ({
  border: "1px solid #dbe4ee",
  padding: theme.spacing(3)
}));

const StyledForm = styled("form")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2.25),
  marginTop: theme.spacing(2.5)
}));

const ActionRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5)
}));
