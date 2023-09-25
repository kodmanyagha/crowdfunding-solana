import { useContext } from "react";
import { Button } from "react-bootstrap";
import { ThemeContext } from "../context/theme-context-provider";

export default function Footer() {
  const theme = useContext(ThemeContext);

  return (
    <>
      <footer className="container">
        <p className="float-end">
          <Button onClick={() => theme.toggleTheme()}>
            {theme.theme.toUpperCase()}
          </Button>
        </p>
        <p>
          &copy; 2017-2023 Company, Inc. &middot; <a href="#">Privacy</a>
          &middot; <a href="#">Terms</a>
        </p>
      </footer>
    </>
  );
}
