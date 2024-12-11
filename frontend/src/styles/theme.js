import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        text: {
            primary: "#1c343a",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    borderRadius: "8px",
                    textTransform: "none",
                    padding: "8px 16px",
                    backgroundColor: "#3f7f8b",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#2a5c65",
                    },
                },
                outlined: {
                    backgroundColor: "white",
                    border: "#d6d6db",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "0.8rem",
                    fontWeight: "normal",
                    boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)",
                    color: "#152a2f",
                    "&:hover": {
                        backgroundColor: "#f0f1f4",
                    },
                },
            },
        },
          
    },
});

export default theme;
