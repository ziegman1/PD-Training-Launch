import { redirect } from "next/navigation";

/** Default entry: screen-share-ready presentation for Session 1 */
export default function Home() {
  redirect("/present/session-1");
}
