import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="NupHub home">
      <span className="brand-mark">N</span>
      <span className="brand-word">
        nup<span>hub</span>
      </span>
    </Link>
  );
}
