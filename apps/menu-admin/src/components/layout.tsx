import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const AppFrame = styled("main")(({ theme }) => ({
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f6f7fb 0%, #eef3f8 42%, #f8fafc 100%)",
  padding: theme.spacing(4, 0),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 0)
  }
}));

export const PageContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  margin: "0 auto",
  maxWidth: 1180,
  padding: theme.spacing(0, 3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 2)
  }
}));

export const HeaderPanel = styled(Paper)(({ theme }) => ({
  alignItems: "center",
  border: "1px solid #dbe4ee",
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "space-between",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    alignItems: "flex-start",
    flexDirection: "column"
  }
}));

export const HeaderCopy = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(0.5)
}));

export const ContentGrid = styled("section")(({ theme }) => ({
  alignItems: "start",
  display: "grid",
  gap: theme.spacing(3),
  gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)",
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr"
  }
}));

export const PanelHeader = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  gap: theme.spacing(1.5),
  justifyContent: "space-between"
}));
