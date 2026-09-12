import type { Metadata } from "next";
import { RolePicker } from "@/components/marketing/role-picker";

export const metadata: Metadata = {
  title: "Sign up · Naano demo",
  description: "No sign-up needed. Pick brand or creator to explore the Naano demo.",
};

export default function Register() {
  return <RolePicker />;
}
