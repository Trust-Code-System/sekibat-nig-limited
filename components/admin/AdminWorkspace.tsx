"use client";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion } from "motion/react";
import { logout } from "@/lib/cms/actions";
import { COLLECTIONS, type Collection, type Entry } from "@/lib/cms/schema";
import { Icon, Reveal, StudioBrand, StudioMotion } from "./StudioUI";
import { StudioOverview } from "./StudioOverview";
import { CommandMenu, type View } from "./CommandMenu";
import { ContentEditor } from "./ContentEditor";
import { MediaGrid } from "./MediaLibrary";
import { photo, status, template, title } from "./content-utils";
import { StudioMenu, StudioSelect, StudioTooltip } from "./StudioControls";
import { ProfilePanel } from "./ProfilePanel";
import { initials, useStudioPreference } from "./studio-preferences";

function Navigation({
  view,
  mobile,
  entries,
  media,
  navigate,
  collapsed = false,
  name,
}: {
  view: View;
  mobile: boolean;
  entries: Entry[];
  media: string[];
  navigate: (next: View, entry?: Entry | null) => void;
  collapsed?: boolean;
  name: string;
}) {
  return (
    <>
      <nav aria-label="Content management">
        <span className="cms-nav-label">WORKSPACE</span>
        {[
          { key: "overview", label: "Overview" },
          ...COLLECTIONS,
          { key: "media", label: "Media library" },
        ].map((item, index) => (
          <div key={item.key}>
            {index === 1 && (
              <span className="cms-nav-label">WEBSITE CONTENT</span>
            )}
            {index === 6 && <span className="cms-nav-label">ASSETS</span>}
            <StudioTooltip label={item.label} enabled={collapsed}>
              <button
                onClick={() => navigate(item.key as View)}
                className={view === item.key ? "active" : ""}
                aria-current={view === item.key ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                {view === item.key && (
                  <motion.span
                    layoutId={mobile ? "mobile-nav-active" : "nav-active"}
                    className="cms-nav-active"
                  />
                )}
                <Icon name={item.key} />
                <span className="cms-nav-text">{item.label}</span>
                {index > 0 && (
                  <small>
                    {item.key === "media"
                      ? media.length
                      : entries.filter((e) => e.collection === item.key).length}
                  </small>
                )}
              </button>
            </StudioTooltip>
          </div>
        ))}
      </nav>
      <div className="cms-sidebar-bottom">
        <div className="cms-sidebar-tip">
          <span className="cms-tip-icon">
            <Icon name="check" size={16} />
          </span>
          <strong>
            A little update.
            <br />A fresh impression.
          </strong>
          <p>Keep your website moving forward.</p>
          <button
            onClick={() => {
              navigate(
                "homepage",
                entries.find((e) => e.collection === "homepage")!,
              );
            }}
          >
            Make an update <Icon name="next" size={15} />
          </button>
        </div>
        <StudioTooltip label="Visit website" enabled={collapsed}>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="cms-sidebar-visit"
            aria-label="Visit website"
          >
            <Icon name="external" size={18} />
            <span>Visit website</span>
          </Link>
        </StudioTooltip>
        <div className="cms-admin-person">
          <StudioTooltip label="Your profile" enabled={collapsed}>
            <button
              className="cms-profile-link"
              onClick={() => navigate("profile")}
              aria-label="Your profile"
              aria-current={view === "profile" ? "page" : undefined}
            >
              <span className="cms-avatar">{initials(name)}</span>
              <span className="cms-profile-link-copy">
                <strong>{name}</strong>
                <small>Administrator</small>
              </span>
            </button>
          </StudioTooltip>
          <form action={logout}>
            <button
              className="cms-icon-button"
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function AdminWorkspace({
  entries: initial,
  media: initialMedia,
  remote,
  email,
}: {
  entries: Entry[];
  media: string[];
  remote: boolean;
  email: string;
}) {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [collapsedPreference, saveCollapsed] = useStudioPreference(
    "collapsed",
    "false",
  );
  const [name] = useStudioPreference("name", "Administrator");
  const collapsed = collapsedPreference === "true";
  const [entries, setEntries] = useState(initial);
  const [media, setMedia] = useState(initialMedia);
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [display, setDisplay] = useState("list");
  const [command, setCommand] = useState(false);
  const [mobile, setMobile] = useState(false);
  const dirty = useRef(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const navigate = useCallback((next: View, entry: Entry | null = null) => {
    if (
      dirty.current &&
      !window.confirm("Leave this editor? Your unsaved changes will be lost.")
    )
      return;
    dirty.current = false;
    setView(next);
    setSelected(entry);
    setSearch("");
    setFilter("all");
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const onDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand((value) => !value);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    const dialog = menuRef.current;
    if (mobile && dialog && !dialog.open) dialog.showModal();
    else if (dialog?.open) dialog.close();
  }, [mobile]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeDrawer = (event: MediaQueryListEvent) => {
      if (event.matches) setMobile(false);
    };
    desktop.addEventListener("change", closeDrawer);
    return () => desktop.removeEventListener("change", closeDrawer);
  }, []);
  function create(collection: Collection) {
    const data = template(collection);
    navigate(collection, {
      id: String(data.id),
      collection,
      draft: data,
      published: null,
      revision: 0,
      updatedAt: null,
    });
  }
  const collection = COLLECTIONS.find((c) => c.key === view);
  const pending = entries.filter((e) => status(e) !== "Published").length;
  const rows = entries
    .filter(
      (e) =>
        (view === "overview" || e.collection === view) &&
        (filter === "all" ||
          (filter === "drafts"
            ? status(e) !== "Published"
            : status(e) === "Published")) &&
        `${title(e)} ${e.draft.reference || ""} ${e.collection}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? title(a).localeCompare(title(b))
        : (b.updatedAt || "").localeCompare(a.updatedAt || ""),
    );

  const addButton =
    collection && !["company", "homepage"].includes(view) ? (
      <button
        disabled={remote}
        className="cms-button cms-primary"
        onClick={() => create(view as Collection)}
      >
        <Icon name="plus" size={18} />
        Add{" "}
        {view === "properties"
          ? "property"
          : view === "projects"
            ? "project"
            : "service"}
      </button>
    ) : view === "overview" ? (
      <StudioMenu
        trigger={
          <button disabled={remote} className="cms-button cms-primary">
            <Icon name="plus" size={18} />
            Create content
            <Icon name="down" size={14} />
          </button>
        }
        items={[
          {
            label: "New property",
            icon: "properties",
            disabled: remote,
            onSelect: () => create("properties"),
          },
          {
            label: "New project",
            icon: "projects",
            disabled: remote,
            onSelect: () => create("projects"),
          },
          {
            label: "New service",
            icon: "services",
            disabled: remote,
            onSelect: () => create("services"),
          },
        ]}
      />
    ) : null;
  return (
    <StudioMotion>
      <div
        className={`cms-workspace ${collapsed ? "is-sidebar-collapsed" : ""}`}
        data-ready={ready}
      >
        <a href="#admin-main" className="cms-skip">
          Skip to content
        </a>
        <aside id="cms-sidebar" className="cms-sidebar">
          <button
            className="cms-brand"
            onClick={() => navigate("overview")}
            aria-label="Sekibat content studio overview"
          >
            <StudioBrand compact={collapsed} />
          </button>
          <Navigation
            view={view}
            mobile={mobile}
            entries={entries}
            media={media}
            navigate={navigate}
            collapsed={collapsed}
            name={name}
          />
        </aside>
        <div className="cms-main-wrap">
          <header className="cms-topbar">
            <div className="cms-breadcrumb">
              <button
                className="cms-desktop-collapse cms-icon-button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                aria-controls="cms-sidebar"
                onClick={() => saveCollapsed(String(!collapsed))}
              >
                <Icon name="sidebar" size={20} />
              </button>
              <button
                className="cms-mobile-menu cms-icon-button"
                aria-label="Open navigation"
                onClick={() => setMobile(true)}
              >
                <Icon name="menu" />
              </button>
              <Icon name="overview" size={16} />
              <span>Workspace</span>
              <span className="cms-breadcrumb-divider">/</span>
              <strong>
                {selected
                  ? title(selected)
                  : collection?.label ||
                    (view === "media"
                      ? "Media library"
                      : view === "profile"
                        ? "Your profile"
                        : "Overview")}
              </strong>
            </div>
            <div className="cms-topbar-actions">
              <button
                className="cms-global-search"
                aria-label="Open quick search"
                onClick={() => setCommand(true)}
              >
                <Icon name="search" size={17} />
                <span>Quick search</span>
                <kbd>Ctrl K</kbd>
              </button>
              <span className="cms-topbar-separator" />
              <button
                className="cms-avatar cms-topbar-avatar"
                aria-label="Open profile"
                onClick={() => navigate("profile")}
              >
                {initials(name)}
              </button>
            </div>
          </header>
          <main id="admin-main" className="cms-main">
            {remote && (
              <div className="cms-notice" role="alert">
                <Icon name="warning" />
                The remote content API is active. The built-in CMS is read-only
                until the administrator disables SEKIBAT_API_URL.
              </div>
            )}
            {view === "profile" ? (
              <ProfilePanel email={email} />
            ) : selected ? (
              <ContentEditor
                key={`${selected.collection}/${selected.id}`}
                entry={selected}
                media={media}
                entries={entries}
                remote={remote}
                onDirty={onDirty}
                onBack={() => navigate(selected.collection)}
                onSaved={(entry) => {
                  setEntries((all) =>
                    all.some(
                      (e) =>
                        e.collection === entry.collection && e.id === entry.id,
                    )
                      ? all.map((e) =>
                          e.collection === entry.collection && e.id === entry.id
                            ? entry
                            : e,
                        )
                      : [...all, entry],
                  );
                  setSelected(entry);
                }}
                onMedia={(src) => setMedia((all) => [...all, src])}
              />
            ) : (
              <>
                <Reveal className="cms-page-heading">
                  <div>
                    <p className="cms-eyebrow">
                      {view === "overview"
                        ? "YOUR WEBSITE, FROM A NEW PERSPECTIVE"
                        : view === "media"
                          ? "A WELL-CURATED FIRST IMPRESSION"
                          : "THE DETAILS MAKE THE DIFFERENCE"}
                    </p>
                    <h1>
                      {collection?.label ||
                        (view === "media"
                          ? "The image library."
                          : "Your website. In good hands.")}
                      <span className="cms-heading-dot">
                        {collection ? "." : ""}
                      </span>
                    </h1>
                    <p>
                      {collection?.description ||
                        (view === "media"
                          ? "A place for every photograph. A photograph for every story."
                          : "A little care, a fresh perspective. Make your next update count.")}
                    </p>
                  </div>
                  {addButton}
                </Reveal>
                {view === "overview" && (
                  <StudioOverview
                    entries={entries}
                    mediaCount={media.length}
                    onEdit={(entry) => navigate(entry.collection, entry)}
                    onCollection={navigate}
                    onDrafts={() => {
                      setFilter((value) =>
                        value === "drafts" ? "all" : "drafts",
                      );
                      document.getElementById("content-list")?.scrollIntoView({
                        behavior: window.matchMedia(
                          "(prefers-reduced-motion: reduce)",
                        ).matches
                          ? "instant"
                          : "smooth",
                      });
                    }}
                  />
                )}
                {view === "media" ? (
                  <Reveal>
                    <MediaGrid
                      media={media}
                      onUpload={(src) => setMedia((all) => [...all, src])}
                    />
                  </Reveal>
                ) : (
                  <Reveal className="cms-content-list">
                    <section id="content-list">
                      <div className="cms-list-heading">
                        <div>
                          <h2>
                            {view === "overview"
                              ? "Your content"
                              : "Collection"}
                            <span>
                              {
                                entries.filter(
                                  (e) =>
                                    view === "overview" ||
                                    e.collection === view,
                                ).length
                              }
                            </span>
                          </h2>
                          <p>
                            {view === "overview"
                              ? "Every page, property, and story. All right here."
                              : "Manage the details that your visitors will see."}
                          </p>
                        </div>
                        <div
                          className="cms-view-switch"
                          aria-label="Content layout"
                        >
                          <button
                            aria-label="List view"
                            aria-pressed={display === "list"}
                            onClick={() => setDisplay("list")}
                          >
                            <Icon name="rows" size={18} />
                          </button>
                          <button
                            aria-label="Grid view"
                            aria-pressed={display === "grid"}
                            onClick={() => setDisplay("grid")}
                          >
                            <Icon name="overview" size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="cms-list-toolbar">
                        <div
                          className="cms-filters"
                          aria-label="Content visibility"
                        >
                          {[
                            { key: "all", label: "All content" },
                            { key: "drafts", label: "Needs attention" },
                            { key: "published", label: "Published" },
                          ].map((f) => (
                            <button
                              key={f.key}
                              aria-pressed={filter === f.key}
                              className={filter === f.key ? "active" : ""}
                              onClick={() => setFilter(f.key)}
                            >
                              {f.label}
                              {f.key === "drafts" && pending > 0 && (
                                <span>
                                  {
                                    entries.filter(
                                      (e) =>
                                        (view === "overview" ||
                                          e.collection === view) &&
                                        status(e) !== "Published",
                                    ).length
                                  }
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="cms-list-searches">
                          <label className="cms-search">
                            <Icon name="search" size={17} />
                            <span className="sr-only">Search content</span>
                            <input
                              type="search"
                              value={search}
                              onChange={(event) =>
                                setSearch(event.target.value)
                              }
                              placeholder="Search content…"
                            />
                          </label>
                          <StudioSelect
                            className="cms-sort-trigger"
                            label="Sort content"
                            value={sort}
                            onValueChange={setSort}
                            options={[
                              { value: "recent", label: "Recently updated" },
                              { value: "title", label: "Title A–Z" },
                            ]}
                          />
                        </div>
                      </div>
                      <div
                        className={
                          display === "grid" ? "cms-record-grid" : "cms-table"
                        }
                        role={display === "list" ? "table" : undefined}
                        aria-label="Website content"
                      >
                        {display === "list" && (
                          <div className="cms-table-head" role="row">
                            <span role="columnheader">Content name</span>
                            <span role="columnheader">Collection</span>
                            <span role="columnheader">Visibility</span>
                            <span role="columnheader">Last updated</span>
                            <span />
                          </div>
                        )}
                        {rows.map((entry) => (
                          <button
                            role={display === "list" ? "row" : undefined}
                            className={
                              display === "list"
                                ? "cms-table-row"
                                : "cms-record-card"
                            }
                            key={`${entry.collection}/${entry.id}`}
                            onClick={() => navigate(entry.collection, entry)}
                          >
                            <span
                              className="cms-record-name"
                              role={display === "list" ? "cell" : undefined}
                            >
                              {photo(entry.draft) ? (
                                <Image
                                  src={photo(entry.draft)}
                                  alt=""
                                  width={400}
                                  height={240}
                                  unoptimized
                                />
                              ) : (
                                <span className="cms-record-icon">
                                  <Icon name={entry.collection} size={25} />
                                </span>
                              )}
                              <span>
                                <strong>{title(entry)}</strong>
                                <small>
                                  {String(
                                    entry.draft.reference ||
                                      (entry.collection === "homepage"
                                        ? "/"
                                        : entry.collection === "company"
                                          ? "/about · /contact"
                                          : `/${entry.collection}/${entry.draft.slug}`),
                                  )}
                                </small>
                              </span>
                            </span>
                            <span
                              role={display === "list" ? "cell" : undefined}
                              className="cms-section-name"
                            >
                              <Icon name={entry.collection} size={14} />
                              {
                                COLLECTIONS.find(
                                  (c) => c.key === entry.collection,
                                )?.label
                              }
                            </span>
                            <span
                              role={display === "list" ? "cell" : undefined}
                            >
                              <span
                                className={`cms-status ${status(entry) === "Published" ? "is-published" : ""}`}
                              >
                                <span />
                                {status(entry)}
                              </span>
                            </span>
                            <span
                              role={display === "list" ? "cell" : undefined}
                              className="cms-updated"
                            >
                              {entry.updatedAt
                                ? new Date(entry.updatedAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      timeZone: "Africa/Lagos",
                                    },
                                  )
                                : "Original content"}
                            </span>
                            <span className="cms-row-arrow">
                              <Icon name="external" size={18} />
                            </span>
                          </button>
                        ))}
                      </div>
                      {!rows.length && (
                        <div className="cms-empty">
                          <Icon name="search" size={30} />
                          <h3>
                            {search
                              ? "Nothing here by that name"
                              : "You’re all caught up"}
                          </h3>
                          <p>
                            {search
                              ? "Try a different title or reference number."
                              : filter === "drafts"
                                ? "No drafts or unpublished changes in this view."
                                : "Add content to start building this collection."}
                          </p>
                          {(search || filter !== "all") && (
                            <button
                              className="cms-button"
                              onClick={() => {
                                setSearch("");
                                setFilter("all");
                              }}
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      )}
                      <div className="cms-list-note">
                        <span>
                          <Icon name="lock" size={14} />
                          Drafts stay private until you publish.
                        </span>
                        <span>
                          {rows.length} record{rows.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </section>
                  </Reveal>
                )}
              </>
            )}
            <footer className="cms-workspace-footer">
              <span>
                <span className="cms-footer-dot" />
                SEKIBAT CONTENT STUDIO
              </span>
              <span>Good spaces deserve good stories.</span>
            </footer>
          </main>
        </div>
        {command && (
          <CommandMenu
            entries={entries}
            onClose={() => setCommand(false)}
            onNavigate={(next, entry) => navigate(next, entry)}
          />
        )}
        <dialog
          ref={menuRef}
          className="cms-mobile-dialog"
          aria-label="Workspace navigation"
          onCancel={() => setMobile(false)}
        >
          <div className="cms-mobile-dialog-top">
            <StudioBrand />
            <button
              className="cms-icon-button"
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          {mobile && (
            <Navigation
              view={view}
              mobile={mobile}
              entries={entries}
              media={media}
              navigate={navigate}
              name={name}
            />
          )}
        </dialog>
      </div>
    </StudioMotion>
  );
}
