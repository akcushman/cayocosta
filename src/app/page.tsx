import Broadcast from "@/components/Broadcast";
import { getPlaylist } from "@/lib/spotify";
import { getPosts } from "@/lib/substack";

export default async function Home() {
  const [posts, playlist] = await Promise.all([getPosts(), getPlaylist()]);
  return <Broadcast programming={{ posts, playlist }} />;
}
