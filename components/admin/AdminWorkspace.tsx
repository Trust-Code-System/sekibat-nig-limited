"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { logout, saveContent } from "@/lib/cms/actions";
import { COLLECTIONS, type Collection, type Content, type Entry } from "@/lib/cms/schema";

type View = "overview" | Collection | "media";
const names: Record<string, string> = { shortDescription: "Short description", legalName: "Registered company name", ownedSide: "Our own portfolio", clientSide: "Work for clients", intro: "Company introduction", isPlaceholder: "Contact details are placeholders", addressLines: "Address", shortTitle: "Short title", projectType: "Project type", listedAt: "Date listed", completionDate: "Completion date", heroImage: "Opening photograph", storyImage: "About section photograph", ctaImage: "Enquiry section photograph", headingAccent: "Heading emphasis", ctaHeading: "Enquiry heading", ctaAccent: "Enquiry heading emphasis", ctaBody: "Enquiry description", ctaLabel: "Enquiry button text", size: "Area (sqm)", price: "Price (NGN)", order: "Display order", social: "Social profiles", values: "Company values", images: "Gallery photographs", services: "Related services" };
const label = (key: string) => names[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
const numbers = new Set(["price", "bedrooms", "bathrooms", "size", "order"]);
const dates = new Set(["listedAt", "completionDate"]);
const longText = new Set(["description", "shortDescription", "summary", "introduction", "intro", "ownedSide", "clientSide", "body", "brief", "role", "outcome", "ctaBody"]);
const optional = new Set(["address", "price", "bedrooms", "bathrooms", "size", "completionDate", "client", "brief", "role", "outcome"]);
const fieldsToHide = new Set(["id", "currency", "sizeUnit"]);
function status(entry: Entry) { return !entry.published ? "Draft" : JSON.stringify(entry.draft) !== JSON.stringify(entry.published) ? "Unpublished changes" : "Published"; }
function title(entry: Entry) { return String(entry.draft.title || entry.draft.legalName || (entry.collection === "homepage" ? "Homepage" : entry.collection === "properties" ? "Untitled property" : entry.collection === "projects" ? "Untitled project" : "Untitled service")); }
function photo(data: Content) { return String(data.heroImage || data.image || (Array.isArray(data.images) ? data.images[0] : "") || ""); }
function publicPath(entry: Entry) { return entry.collection === "homepage" ? "/" : entry.collection === "company" ? "/about" : `/${entry.collection}/${entry.published?.slug || entry.draft.slug}`; }
function clean(value: unknown, key = ""): unknown {
  if (optional.has(key) && value === "") return undefined;
  if (Array.isArray(value)) return value.map((item) => clean(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]).filter(([, v]) => v !== undefined));
  return value;
}
function template(collection: Collection): Content {
  const id = crypto.randomUUID();
  const shared = { id, title: "", slug: "" };
  if (collection === "properties") return { ...shared, reference: `PROP-${id.slice(0, 8).toUpperCase()}`, location: { city: "", state: "", address: "" }, type: "residential", status: "available", ownership: "sekibat", shortDescription: "", description: "", price: "", currency: "NGN", bedrooms: "", bathrooms: "", size: "", sizeUnit: "sqm", features: [], images: [], featured: false, listedAt: new Date().toISOString().slice(0, 10) };
  if (collection === "projects") return { ...shared, reference: `PRJ-${id.slice(0, 8).toUpperCase()}`, location: "", projectType: "", client: "", status: "planned", completionDate: "", services: [], shortDescription: "", description: "", brief: "", role: "", work: [], outcome: "", images: [], featured: false };
  return { ...shared, shortTitle: "", summary: "", description: "", capabilities: [{ title: "", body: "" }], audience: "", image: "", order: 5 };
}
function editData(entry: Entry): Content {
  if (entry.collection === "properties") return { ...entry.draft, price: entry.draft.price ?? "", bedrooms: entry.draft.bedrooms ?? "", bathrooms: entry.draft.bathrooms ?? "", size: entry.draft.size ?? "", location: { ...(entry.draft.location as Content), address: (entry.draft.location as Content).address ?? "" } };
  if (entry.collection === "projects") return { ...entry.draft, client: entry.draft.client ?? "", completionDate: entry.draft.completionDate ?? "", brief: entry.draft.brief ?? "", role: entry.draft.role ?? "", work: entry.draft.work ?? [], outcome: entry.draft.outcome ?? "" };
  return structuredClone(entry.draft);
}
function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    homepage: <><path d="m3 11 9-8 9 8M5 9v12h14V9M10 21v-7h4v7" /></>,
    company: <><path d="M4 21V3h12v18M16 10h4v11M8 7h4M8 11h4M8 15h4M8 19h4" /></>,
    properties: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6M10 21v-4h4v4" /></>,
    projects: <><path d="M3 21V8h18v13M8 8V4h8v4M3 13h18M10 13v3h4v-3" /></>,
    services: <><path d="m5 4 15 16M15 4a5 5 0 0 0-6 6L3 16l5 5 6-6a5 5 0 0 0 6-6l-4 4-5-5Z" /></>,
    media: <><rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="8" cy="8" r="1" /><path d="m3 17 6-6 4 4 3-3 5 5" /></>,
  };
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>{paths[name] || paths.overview}</svg>;
}

export function AdminWorkspace({ entries: initial, media: initialMedia, remote }: { entries: Entry[]; media: string[]; remote: boolean }) {
  const [entries, setEntries] = useState(initial);
  const [media, setMedia] = useState(initialMedia);
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [draftsOnly, setDraftsOnly] = useState(false);
  const dirty = useRef(false);
  function navigate(next: View, entry: Entry | null = null) {
    if (dirty.current && !window.confirm("Leave this editor? Your unsaved changes will be lost.")) return;
    dirty.current = false; setView(next); setSelected(entry); setSearch(""); setDraftsOnly(false);
  }
  const counts = { published: entries.filter((e) => e.published).length, drafts: entries.filter((e) => status(e) !== "Published").length, media: media.length };
  const collection = COLLECTIONS.find((c) => c.key === view);
  const rows = entries.filter((e) => (view === "overview" || e.collection === view) && (!draftsOnly || status(e) !== "Published") && `${title(e)} ${e.draft.reference || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="cms-workspace">
    <a href="#admin-main" className="cms-skip">Skip to content</a>
    <aside className="cms-sidebar"><Link href="/admin" className="cms-brand"><BrandLockup /><span>CONTENT STUDIO</span></Link>
      <div className="cms-site-label"><span className="cms-site-dot" />Sekibat website<small>Website administration</small></div>
      <nav aria-label="Content management"><p className="cms-nav-label">Workspace</p>
        <button onClick={() => navigate("overview")} className={view === "overview" ? "active" : ""} aria-current={view === "overview" ? "page" : undefined}><Icon name="overview" />Overview</button>
        <p className="cms-nav-label">Website content</p>
        {COLLECTIONS.map((c) => <button key={c.key} onClick={() => navigate(c.key)} className={view === c.key ? "active" : ""} aria-current={view === c.key ? "page" : undefined}><Icon name={c.key} />{c.label}<span>{entries.filter((e) => e.collection === c.key).length}</span></button>)}
        <button onClick={() => navigate("media")} className={view === "media" ? "active" : ""} aria-current={view === "media" ? "page" : undefined}><Icon name="media" />Media library<span>{media.length}</span></button>
      </nav>
      <div className="cms-sidebar-bottom"><Link href="/" target="_blank" rel="noopener noreferrer">Visit website <span>↗</span></Link><div className="cms-admin-person"><span className="cms-avatar">S</span><div>Administrator<small>Sekibat Nig Limited</small></div><form action={logout}><button aria-label="Sign out" title="Sign out">↪</button></form></div></div>
    </aside>
    <div className="cms-main-wrap"><header className="cms-topbar"><p>Website <span>/</span> {selected ? title(selected) : collection?.label || (view === "media" ? "Media library" : "Overview")}</p><Link href="/" target="_blank" rel="noopener noreferrer" className="cms-button">View website ↗</Link><form action={logout} className="cms-mobile-logout"><button className="cms-button" aria-label="Sign out">↪</button></form></header>
      <main id="admin-main" className="cms-main">
        {remote && <div className="cms-notice" role="alert">The remote content API is active. The built-in CMS is read-only until the administrator disables SEKIBAT_API_URL.</div>}
        {selected ? <Editor key={`${selected.collection}/${selected.id}`} entry={selected} media={media} entries={entries} remote={remote} onDirty={(value) => { dirty.current = value; }} onBack={() => navigate(selected.collection)} onSaved={(entry) => { setEntries((all) => all.some((e) => e.collection === entry.collection && e.id === entry.id) ? all.map((e) => e.collection === entry.collection && e.id === entry.id ? entry : e) : [...all, entry]); setSelected(entry); }} onMedia={(src) => setMedia((all) => [...all, src])} /> : <>
          <div className="cms-page-heading"><div><p className="cms-eyebrow">Sekibat / Content studio</p><h1>{collection?.label || (view === "media" ? "Media library" : "A place for your next update.")}</h1><p>{collection?.description || (view === "media" ? "Photography for your website, in one place." : "Keep your website as considered as the properties you build.")}</p></div>
            {collection && !["company", "homepage"].includes(view) && <button disabled={remote} className="cms-button cms-primary" onClick={() => { const data = template(view as Collection); navigate(view, { id: String(data.id), collection: view as Collection, draft: data, published: null, revision: 0, updatedAt: null }); }}>+ Add {view === "properties" ? "property" : view === "projects" ? "project" : "service"}</button>}
          </div>
          {view === "overview" && <><div className="cms-summary"><div><span>Published records</span><strong>{String(counts.published).padStart(2, "0")}</strong><small>Visible on your website</small></div><button onClick={() => { setView("overview"); setSearch(""); setDraftsOnly((value) => !value); document.getElementById("content-list")?.scrollIntoView({ behavior: "smooth" }); }}><span>Drafts & pending changes</span><strong>{String(counts.drafts).padStart(2, "0")}</strong><small>Ready for your attention</small></button><button onClick={() => navigate("media")}><span>Library photographs</span><strong>{String(counts.media).padStart(2, "0")}</strong><small>Available to use across the site</small></button></div>
            <div className="cms-feature"><div><p className="cms-eyebrow">The first impression</p><h2>Make the homepage yours.</h2><p>Shape the opening story, choose the right photograph, and give visitors a reason to explore.</p><button className="cms-button" onClick={() => navigate("homepage", entries.find((e) => e.collection === "homepage")!)}>Edit homepage <span>→</span></button></div><Image src={photo(entries.find((e) => e.collection === "homepage")!.draft)} alt="Current homepage photograph" width={650} height={320} unoptimized /></div></>}
          {view === "media" ? <MediaGrid media={media} onUpload={(src) => setMedia((all) => [...all, src])} /> : <section id="content-list" className="cms-content-list"><div className="cms-list-heading"><div><h2>{draftsOnly ? "Drafts & pending changes" : view === "overview" ? "Website content" : "All records"}</h2><span>{rows.length} records</span></div><label className="cms-search"><span className="sr-only">Search content</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search content…" /><span aria-hidden>⌕</span></label></div>
            <div className="cms-table" role="table" aria-label="Website content"><div className="cms-table-head" role="row"><span role="columnheader">Content</span><span role="columnheader">Section</span><span role="columnheader">Status</span><span role="columnheader">Last updated</span><span /></div>
              {rows.map((entry) => <button role="row" className="cms-table-row" key={`${entry.collection}/${entry.id}`} onClick={() => navigate(entry.collection, entry)}><span className="cms-record-name" role="cell">{photo(entry.draft) ? <Image src={photo(entry.draft)} alt="" width={64} height={48} unoptimized /> : <span className="cms-record-icon"><Icon name={entry.collection} /></span>}<span><strong>{title(entry)}</strong><small>{String(entry.draft.reference || (entry.collection === "homepage" ? "/" : entry.collection === "company" ? "/about · /contact" : `/${entry.collection}/${entry.draft.slug}`))}</small></span></span><span role="cell" className="cms-section-name">{COLLECTIONS.find((c) => c.key === entry.collection)?.label}</span><span role="cell"><span className={`cms-status ${status(entry) === "Published" ? "is-published" : ""}`}>{status(entry)}</span></span><span role="cell" className="cms-updated">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }) : "Original content"}</span><span className="cms-row-arrow" aria-hidden>↗</span></button>)}
              {!rows.length && <p className="cms-empty">{search ? "No content matches your search." : "No records yet. Add the first one to get started."}</p>}
            </div><p className="cms-list-note">Drafts stay private. Publish when you’re ready for visitors to see your changes.</p>
          </section>}
        </>}
        <footer className="cms-workspace-footer"><span>SEKIBAT NIG LIMITED</span><span>Built with care. Kept up to date by you.</span></footer>
      </main>
    </div>
  </div>;
}

function Editor({ entry, media, entries, remote, onDirty, onBack, onSaved, onMedia }: { entry: Entry; media: string[]; entries: Entry[]; remote: boolean; onDirty: (dirty: boolean) => void; onBack: () => void; onSaved: (entry: Entry) => void; onMedia: (src: string) => void }) {
  const [data, setData] = useState<Content>(() => editData(entry));
  const [baseline, setBaseline] = useState(() => JSON.stringify(editData(entry)));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [picking, setPicking] = useState<{ value: string; onSelect: (src: string) => void } | null>(null);
  const dirty = JSON.stringify(data) !== baseline;
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { const guard = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [dirty]);
  function update(keys: (string | number)[], value: unknown) {
    setMessage(""); setError("");
    setData((previous) => { const next = structuredClone(previous); let current: unknown = next; keys.slice(0, -1).forEach((key) => { current = (current as Record<string | number, unknown>)[key]; }); (current as Record<string | number, unknown>)[keys[keys.length - 1]] = value; return next; });
  }
  function save(operation: "draft" | "publish" | "unpublish") {
    if (operation === "unpublish" && !window.confirm("Remove this record from the public website? It will remain available here as a draft.")) return;
    setError(""); setMessage("");
    startTransition(async () => {
      try {
        const result = await saveContent({ collection: entry.collection, id: entry.id, revision: entry.revision, operation, data: operation === "unpublish" ? entry.published : clean(data) });
        if (result.error) { setError(result.error); return; }
        if (result.entry) { const next = editData(result.entry); setData(next); setBaseline(JSON.stringify(next)); onDirty(false); onSaved(result.entry); setMessage(operation === "publish" ? "Published. Your website is up to date." : operation === "unpublish" ? "Unpublished. This record is now a private draft." : "Draft saved. Your published content is unchanged."); }
      } catch { setError("Your session or connection may have expired. Reload the page and sign in, then try again."); }
    });
  }
  function renderFields(object: Content, prefix: (string | number)[] = []) {
    return Object.entries(object).filter(([key]) => !fieldsToHide.has(key)).map(([key, value]) => {
      const keys = [...prefix, key];
      const fieldId = `cms-${keys.join("-")}`;
      if (Array.isArray(value)) {
        const objects = ["values", "capabilities", "social"].includes(key);
        return <fieldset className="cms-field-group" key={key}><legend>{label(key)}</legend>
          {key === "services" ? <div className="cms-service-choices">{entries.filter((e) => e.collection === "services" && e.published).map((service) => <label key={service.id}><input type="checkbox" checked={value.includes(service.published!.slug)} onChange={(event) => update(keys, event.target.checked ? [...value, service.published!.slug] : value.filter((item) => item !== service.published!.slug))} />{title(service)}</label>)}</div> : value.map((item, index) => <div className="cms-repeat" key={index}><div>{objects ? renderFields(item as Content, [...keys, index]) : key === "images" ? <ImageField value={String(item)} label={`Photograph ${index + 1}`} onChoose={() => setPicking({ value: String(item), onSelect: (src) => update([...keys, index], src) })} /> : <label className="cms-field">{label(key)} {index + 1}<input value={String(item)} onChange={(event) => update([...keys, index], event.target.value)} /></label>}</div><button type="button" className="cms-remove" aria-label={`Remove ${label(key)} ${index + 1}`} onClick={() => update(keys, value.filter((_, i) => i !== index))}>×</button></div>)}
          {key !== "services" && <button type="button" className="cms-button" onClick={() => key === "images" ? setPicking({ value: "", onSelect: (src) => update(keys, [...value, src]) }) : update(keys, [...value, objects ? key === "social" ? { label: "", href: "" } : { title: "", body: "" } : ""])}>+ Add {key === "images" ? "photograph" : key === "addressLines" ? "address line" : "item"}</button>}
        </fieldset>;
      }
      if (value && typeof value === "object") return <fieldset className="cms-field-group" key={key}><legend>{label(key)}</legend><div className="cms-fields">{renderFields(value as Content, keys)}</div></fieldset>;
      if (typeof value === "boolean") return <label className="cms-checkbox" key={key}><input type="checkbox" checked={value} onChange={(event) => update(keys, event.target.checked)} /><span>{label(key)}<small>{key === "featured" ? "Prioritise this record in the website catalogue." : key === "isPlaceholder" ? "Keep the contact confirmation notice visible." : ""}</small></span></label>;
      if (key === "image" || key.endsWith("Image")) return <ImageField key={key} value={String(value || "")} label={label(key)} onChoose={() => setPicking({ value: String(value || ""), onSelect: (src) => update(keys, src) })} />;
      const choices = key === "type" ? ["residential", "commercial", "land", "mixed-use"] : key === "status" ? entry.collection === "properties" ? ["available", "under-development", "completed", "leased", "sold"] : ["planned", "ongoing", "completed"] : key === "ownership" ? ["sekibat", "client"] : null;
      return <label className={`cms-field ${longText.has(key) ? "cms-wide" : ""}`} htmlFor={fieldId} key={key}><span>{label(key)}{optional.has(key) && <small>Optional</small>}</span>{choices ? <select id={fieldId} value={String(value)} onChange={(event) => update(keys, event.target.value)}>{choices.map((choice) => <option key={choice} value={choice}>{label(choice.replaceAll("-", " "))}</option>)}</select> : longText.has(key) ? <textarea id={fieldId} rows={key === "description" || key === "intro" ? 6 : 3} value={String(value ?? "")} onChange={(event) => update(keys, event.target.value)} /> : <input id={fieldId} type={numbers.has(key) ? "number" : dates.has(key) ? "date" : key === "email" ? "email" : "text"} min={numbers.has(key) ? 0 : undefined} step={key === "size" ? "any" : numbers.has(key) ? 1 : undefined} value={String(value ?? "")} onChange={(event) => update(keys, numbers.has(key) && event.target.value !== "" ? Number(event.target.value) : event.target.value)} />}{key === "slug" && <small>This sets the public URL. Use lowercase words separated by hyphens.</small>}</label>;
    });
  }
  return <>
    <button className="cms-back" onClick={onBack}>← All {COLLECTIONS.find((c) => c.key === entry.collection)?.label.toLowerCase()}</button>
    <div className="cms-page-heading"><div><p className="cms-eyebrow">Content editor / {entry.collection}</p><h1>{title(entry) || "New record"}</h1><p>Give every detail a considered place.</p></div><span className="cms-status">{dirty ? "Unsaved changes" : status(entry)}</span></div>
    <div className="cms-editor-grid"><div><form className="cms-editor-panel" onSubmit={(event) => { event.preventDefault(); save("draft"); }}><div className="cms-panel-heading"><h2>Content & details</h2><span>Fields marked optional may be left empty.</span></div><fieldset disabled={pending || remote} className="cms-fields cms-editor-fieldset">{renderFields(data)}</fieldset><div className="cms-editor-actions"><span>{entry.revision === 0 && !entry.published ? "New record · not saved" : dirty ? "You have unsaved changes" : "All changes saved"}</span><button type="submit" className="cms-button" disabled={pending || remote}>{pending ? "Saving…" : "Save draft"}</button><button type="button" className="cms-button cms-primary" disabled={pending || remote} onClick={() => save("publish")}>Publish changes ↗</button></div></form>
      {error && <p className="cms-error" role="alert">{error}</p>}{message && <p className="cms-success" role="status">{message}</p>}
    </div><aside className="cms-publish-panel"><p className="cms-eyebrow">Before you publish</p>{photo(data) && <Image src={photo(data)} alt="Selected content photograph" width={450} height={300} unoptimized />}<h2>{String(data.title || data.heading || data.legalName || "New record")}</h2><p>{String(data.shortDescription || data.summary || data.introduction || data.positioning || "Review your copy and photography before making this record public.")}</p><dl><div><dt>Visibility</dt><dd>{entry.published ? "Public website" : "Private draft"}</dd></div><div><dt>Changes</dt><dd>{dirty ? "Not saved" : status(entry)}</dd></div></dl><p className="cms-publish-note">Save a draft to continue later. Publishing makes these changes visible to every visitor.</p>{entry.published && <Link href={publicPath(entry)} target="_blank" rel="noopener noreferrer" className="cms-button">View published page ↗</Link>}{entry.published && !["company", "homepage"].includes(entry.collection) && <button className="cms-text-link" disabled={pending || remote} onClick={() => save("unpublish")}>Unpublish this record</button>}</aside></div>
    {picking && <MediaPicker media={media} current={picking.value} onClose={() => setPicking(null)} onSelect={(src) => { picking.onSelect(src); setPicking(null); }} onUpload={onMedia} />}
  </>;
}
function ImageField({ value, label, onChoose }: { value: string; label: string; onChoose: () => void }) { return <div className="cms-image-field"><span>{label}</span><button type="button" onClick={onChoose}>{value ? <Image src={value} alt="" width={120} height={80} unoptimized /> : <Icon name="media" />}<span><strong>{value ? "Change photograph" : "Choose photograph"}</strong><small>{value ? value.split("/").pop() : "Select from the media library"}</small></span><span aria-hidden>↗</span></button></div>; }

function MediaGrid({ media, onUpload, onSelect, current }: { media: string[]; onUpload: (src: string) => void; onSelect?: (src: string) => void; current?: string }) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  async function upload(file: File) {
    setError(""); setUploading(true);
    try { const form = new FormData(); form.set("file", file); const response = await fetch("/api/admin/media", { method: "POST", body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.error); onUpload(result.src); if (onSelect) onSelect(result.src); }
    catch (error) { setError(error instanceof Error ? error.message : "Upload failed. Try again."); }
    finally { setUploading(false); }
  }
  const filtered = media.filter((src) => src.toLowerCase().includes(query.toLowerCase()));
  return <><div className="cms-media-toolbar"><label className="cms-search"><span className="sr-only">Search photographs</span><input type="search" placeholder="Search photographs…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="cms-button cms-primary cms-upload">{uploading ? "Uploading…" : "+ Upload photograph"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /></label></div><p className="cms-list-note">JPEG, PNG or WebP · up to 8 MB. Uploaded images are saved to your library.</p>{error && <p role="alert" className="cms-error">{error}</p>}<div className="cms-media-grid">{filtered.map((src) => <div key={src} className={`cms-media-card ${src === current ? "is-selected" : ""}`}><Image src={src} alt={src.split("/").pop()!.replace(/[-_]/g, " ")} width={350} height={240} unoptimized /><p title={src}>{src.split("/").pop()}</p>{onSelect ? <button className="cms-button" onClick={() => onSelect(src)}>{src === current ? "Selected photograph" : "Use photograph"}</button> : <button className="cms-button" onClick={async (event) => { const button = event.currentTarget; try { await navigator.clipboard.writeText(src); button.textContent = "Path copied"; } catch { setError(`Image path: ${src}`); } }}>Copy image path</button>}</div>)}</div>{!filtered.length && <p className="cms-empty">No photographs match your search.</p>}</>;
}
function MediaPicker({ media, current, onClose, onSelect, onUpload }: { media: string[]; current: string; onClose: () => void; onSelect: (src: string) => void; onUpload: (src: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="cms-media-dialog" aria-labelledby="cms-media-title" onCancel={onClose}><div className="cms-dialog-heading"><div><p className="cms-eyebrow">Media library</p><h2 id="cms-media-title">Choose a photograph.</h2></div><button className="cms-button" aria-label="Close media library" onClick={onClose}>×</button></div><MediaGrid media={media} current={current} onSelect={onSelect} onUpload={onUpload} /></dialog>;
}
