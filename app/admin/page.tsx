import { requireAdmin, administratorEmail } from "@/lib/cms/auth";
import { readEntries, mediaLibrary } from "@/lib/api/cms-store";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export default async function AdminPage() {
  await requireAdmin();
  const [entries, media] = await Promise.all([readEntries(), mediaLibrary()]);
  return (
    <AdminWorkspace
      email={administratorEmail()}
      entries={entries}
      media={media}
      remote={Boolean(process.env.SEKIBAT_API_URL?.trim())}
    />
  );
}
