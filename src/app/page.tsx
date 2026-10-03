import Broadcast from "@/components/Broadcast";
import { getPosts } from "@/lib/substack";

export default async function Home() {
  const posts = await getPosts();
  return <Broadcast programming={{ posts }} />;
}
