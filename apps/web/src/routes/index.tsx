import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "#/components/navbar";

const Home = () => <Navbar />;

export const Route = createFileRoute("/")({ component: Home });
