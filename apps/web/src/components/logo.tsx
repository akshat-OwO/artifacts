import { Link } from "@tanstack/react-router";
import * as Match from "effect/Match";

interface LogoProps {
  variant?: "default" | "text" | "loader";
}

export const Logo = ({ variant = "default" }: LogoProps) =>
  Match.value(variant).pipe(
    Match.when("default", () => (
      <Link
        to="/"
        className="py-1 px-4 border rounded-md border-primary focus:border-accent border-dashed"
      >
        <span className="text-2xl font-bold text-primary">A</span>
        <span className="sr-only">Artifacts</span>
      </Link>
    )),
    Match.when("text", () => (
      <Link to="/" className="text-xs font-bold">
        Artifacts
      </Link>
    )),
    Match.when("loader", () => (
      <div className="py-1 px-4 border rounded border-primary border-dashed animate-pulse">
        <span className="text-2xl font-bold text-primary">A</span>
        <span className="sr-only">Loading...</span>
      </div>
    )),
    Match.orElse(() => "Artifacts")
  );
