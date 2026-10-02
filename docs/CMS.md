# Website content management

The built-in CMS lives at `/admin`; `/cms` redirects there. It manages homepage copy and
photographs, company and contact details, property listings, project case studies and services.
The accounting and operational property-management system is a separate future scope.

## Access

Set `SEKIBAT_ADMIN_PASSWORD` (12+ characters) and `SEKIBAT_ADMIN_SECRET` (32+ characters) in the
server environment. Set `SEKIBAT_ADMIN_EMAIL` to choose the administrator email (defaults to
`test@sekibat.com`). Restart the server after changing credentials. The login checks both email
and password; email comparison ignores surrounding whitespace and letter case.
the secret signs eight-hour HTTP-only, SameSite=Strict sessions. Production requires HTTPS.
Changing the email, password or secret invalidates existing sessions. With missing or short credentials,
access stays disabled. A single administrator account is supported. Sign-in attempts are
limited to 20 per 15 minutes per server process across all visitors.

The profile shows the configured sign-in email. Display name and compact-navigation preferences
are stored only in the current browser; they do not change the sign-in account or permissions.

For this local workspace, generated credentials are in the ignored `.env.local` file. Keep
that file private and use different credentials for deployment.

## Editing

Choose a record, edit its fields, then **Save draft** to keep changes private. **Publish
changes** validates the content and updates the public site. Previously published content
stays visible while an edited draft is saved. **Unpublish this record** removes a property,
project or service from public pages and retains it as a draft. Homepage and company records
must remain published. Record IDs stay fixed; slugs must be unique within their collection.
Changing a slug changes the public URL; redirects from previous slugs are not created.

The media library accepts JPEG, PNG and WebP files up to 8 MB. Publishing checks that selected
images exist. Related services on projects must refer to published services. Revisions stop
two editors from silently overwriting the same record. If an edit conflicts, reload to see
the newer content before saving again.

## Storage and hosting

This version targets **one Node.js application host with a writable persistent disk**.
Content is saved to `.cms/content.json` (or `SEKIBAT_CMS_DIR/content.json`), using a temporary
file and atomic rename. A directory lock serialises writes between processes sharing that
disk. If the process is killed during a write, confirm no writer is running, then remove
the `write.lock` directory inside the content directory before resuming writes.

Uploaded photographs live in `public/media/uploads`. Preserve **both** the content directory
and uploaded photographs across deployments, and back them up together. These directories
are ignored by Git. Do not deploy this storage adapter on ephemeral/serverless storage or
across hosts with independent disks. For that deployment model, replace the store with a
database and object storage first.

Until the first save, existing bundled records seed the editor and remain published.
The first save writes the whole initial content snapshot. Public repositories read only
published content; unpublished records are excluded from lists, detail pages, related records,
filters and the sitemap. The public site keeps its existing URLs and design.

Setting `SEKIBAT_API_URL` preserves the existing remote API adapter and makes the built-in
CMS read-only. Disable it to use local CMS publishing. Remote administrative writes are
not part of the existing backend API contract.

## Verification

Run `pnpm lint`, `pnpm build` and, with `pnpm dev` running, `pnpm smoke` and `pnpm smoke:cms`.
CMS checks exercise authentication, draft/publish isolation, persistence, validation, revision
conflicts, unpublishing, uploads, media selection and responsive layouts. They temporarily
edit content and restore the original content file afterward; run on a local test workspace
with no concurrent editors. Screenshots are saved to `.artifacts`.
