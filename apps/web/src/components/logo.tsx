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
        className="border-primary focus:border-accent rounded-md border border-dashed px-4 py-1"
      >
        <span className="text-primary text-2xl font-bold">A</span>
        <span className="sr-only">Artifacts</span>
      </Link>
    )),
    Match.when("text", () => (
      <Link to="/" className="text-xs font-bold">
        Artifacts
      </Link>
    )),
    Match.when("loader", () => (
      <div className="border-primary animate-pulse rounded border border-dashed px-4 py-1">
        <span className="text-primary text-2xl font-bold">A</span>
        <span className="sr-only">Loading...</span>
      </div>
    )),
    Match.orElse(() => "Artifacts")
  );
