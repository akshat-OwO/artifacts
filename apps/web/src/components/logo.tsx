import { Link } from "@tanstack/react-router";

export const Logo = () => (
  <Link
    to="/"
    className="py-1 px-4 border rounded-md border-primary focus:border-accent border-dashed"
  >
    <span className="text-2xl font-bold text-primary">A</span>
    <span className="sr-only">Artifacts</span>
  </Link>
);
