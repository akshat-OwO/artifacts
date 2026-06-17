import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "default" | "text";
}

export const Logo = ({ variant = "default" }: LogoProps) =>
  variant === "default" ? (
    <Link
      to="/"
      className="py-1 px-4 border rounded-md border-primary focus:border-accent border-dashed"
    >
      <span className="text-2xl font-bold text-primary">A</span>
      <span className="sr-only">Artifacts</span>
    </Link>
  ) : (
    <Link to="/" className="text-xs font-bold">
      Artifacts
    </Link>
  );
