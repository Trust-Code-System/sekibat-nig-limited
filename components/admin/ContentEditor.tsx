"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { saveContent } from "@/lib/cms/actions";
import { COLLECTIONS, type Content, type Entry } from "@/lib/cms/schema";
import {
  label,
  status,
  title,
  photo,
  publicPath,
  clean,
  editData,
} from "./content-utils";
import { Icon, Reveal } from "./StudioUI";
import { ImageField, MediaPicker } from "./MediaLibrary";
const numbers = new Set(["price", "bedrooms", "bathrooms", "size", "order"]);
const dates = new Set(["listedAt", "completionDate"]);
const longText = new Set([
  "description",
  "shortDescription",
  "summary",
  "introduction",
  "intro",
  "ownedSide",
  "clientSide",
  "body",
  "brief",
  "role",
  "outcome",
  "ctaBody",
]);
const optional = new Set([
  "address",
  "price",
  "bedrooms",
  "bathrooms",
  "size",
  "completionDate",
  "client",
  "brief",
  "role",
  "outcome",
]);
const fieldsToHide = new Set(["id", "currency", "sizeUnit"]);
export function ContentEditor({
  entry,
  media,
  entries,
  remote,
  onDirty,
  onBack,
  onSaved,
  onMedia,
}: {
  entry: Entry;
  media: string[];
  entries: Entry[];
  remote: boolean;
  onDirty: (dirty: boolean) => void;
  onBack: () => void;
  onSaved: (entry: Entry) => void;
  onMedia: (src: string) => void;
}) {
  const [data, setData] = useState<Content>(() => editData(entry));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(editData(entry)),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [picking, setPicking] = useState<{
    value: string;
    onSelect: (src: string) => void;
  } | null>(null);
  const [preview, setPreview] = useState("wide");
  const dirty = JSON.stringify(data) !== baseline;
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function update(keys: (string | number)[], value: unknown) {
    setMessage("");
    setError("");
    setData((previous) => {
      const next = structuredClone(previous);
      let current: unknown = next;
      keys.slice(0, -1).forEach((key) => {
        current = (current as Record<string | number, unknown>)[key];
      });
      (current as Record<string | number, unknown>)[keys[keys.length - 1]] =
        value;
      return next;
    });
  }
  function save(operation: "draft" | "publish" | "unpublish") {
    if (
      operation === "unpublish" &&
      !window.confirm(
        "Remove this record from the public website? It will remain available here as a draft.",
      )
    )
      return;
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const result = await saveContent({
          collection: entry.collection,
          id: entry.id,
          revision: entry.revision,
          operation,
          data: operation === "unpublish" ? entry.published : clean(data),
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.entry) {
          const next = editData(result.entry);
          setData(next);
          setBaseline(JSON.stringify(next));
          onDirty(false);
          onSaved(result.entry);
          setMessage(
            operation === "publish"
              ? "Published. Your website is up to date."
              : operation === "unpublish"
                ? "Unpublished. This record is now a private draft."
                : "Draft saved. Your published content is unchanged.",
          );
        }
      } catch {
        setError(
          "Your session or connection may have expired. Reload the page and sign in, then try again.",
        );
      }
    });
  }
  function renderFields(object: Content, prefix: (string | number)[] = []) {
    return Object.entries(object)
      .filter(([key]) => !fieldsToHide.has(key))
      .map(([key, value]) => {
        const keys = [...prefix, key];
        const fieldId = `cms-${keys.join("-")}`;
        if (Array.isArray(value)) {
          const objects = ["values", "capabilities", "social"].includes(key);
          return (
            <fieldset className="cms-field-group" key={key}>
              <legend>{label(key)}</legend>
              {key === "services" ? (
                <div className="cms-service-choices">
                  {entries
                    .filter((e) => e.collection === "services" && e.published)
                    .map((service) => (
                      <label key={service.id}>
                        <input
                          type="checkbox"
                          checked={value.includes(service.published!.slug)}
                          onChange={(event) =>
                            update(
                              keys,
                              event.target.checked
                                ? [...value, service.published!.slug]
                                : value.filter(
                                    (item) => item !== service.published!.slug,
                                  ),
                            )
                          }
                        />
                        {title(service)}
                      </label>
                    ))}
                </div>
              ) : (
                value.map((item, index) => (
                  <div className="cms-repeat" key={index}>
                    <div>
                      {objects ? (
                        renderFields(item as Content, [...keys, index])
                      ) : key === "images" ? (
                        <ImageField
                          value={String(item)}
                          label={`Photograph ${index + 1}`}
                          onChoose={() =>
                            setPicking({
                              value: String(item),
                              onSelect: (src) => update([...keys, index], src),
                            })
                          }
                        />
                      ) : (
                        <label className="cms-field">
                          {label(key)} {index + 1}
                          <input
                            value={String(item)}
                            onChange={(event) =>
                              update([...keys, index], event.target.value)
                            }
                          />
                        </label>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cms-remove"
                      aria-label={`Remove ${label(key)} ${index + 1}`}
                      onClick={() =>
                        update(
                          keys,
                          value.filter((_, i) => i !== index),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
              {key !== "services" && (
                <button
                  type="button"
                  className="cms-button"
                  onClick={() =>
                    key === "images"
                      ? setPicking({
                          value: "",
                          onSelect: (src) => update(keys, [...value, src]),
                        })
                      : update(keys, [
                          ...value,
                          objects
                            ? key === "social"
                              ? { label: "", href: "" }
                              : { title: "", body: "" }
                            : "",
                        ])
                  }
                >
                  + Add{" "}
                  {key === "images"
                    ? "photograph"
                    : key === "addressLines"
                      ? "address line"
                      : "item"}
                </button>
              )}
            </fieldset>
          );
        }
        if (value && typeof value === "object")
          return (
            <fieldset className="cms-field-group" key={key}>
              <legend>{label(key)}</legend>
              <div className="cms-fields">
                {renderFields(value as Content, keys)}
              </div>
            </fieldset>
          );
        if (typeof value === "boolean")
          return (
            <label className="cms-checkbox" key={key}>
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => update(keys, event.target.checked)}
              />
              <span>
                {label(key)}
                <small>
                  {key === "featured"
                    ? "Prioritise this record in the website catalogue."
                    : key === "isPlaceholder"
                      ? "Keep the contact confirmation notice visible."
                      : ""}
                </small>
              </span>
            </label>
          );
        if (key === "image" || key.endsWith("Image"))
          return (
            <ImageField
              key={key}
              value={String(value || "")}
              label={label(key)}
              onChoose={() =>
                setPicking({
                  value: String(value || ""),
                  onSelect: (src) => update(keys, src),
                })
              }
            />
          );
        const choices =
          key === "type"
            ? ["residential", "commercial", "land", "mixed-use"]
            : key === "status"
              ? entry.collection === "properties"
                ? [
                    "available",
                    "under-development",
                    "completed",
                    "leased",
                    "sold",
                  ]
                : ["planned", "ongoing", "completed"]
              : key === "ownership"
                ? ["sekibat", "client"]
                : null;
        return (
          <label
            className={`cms-field ${longText.has(key) ? "cms-wide" : ""}`}
            htmlFor={fieldId}
            key={key}
          >
            <span>
              {label(key)}
              {optional.has(key) && <small>Optional</small>}
            </span>
            {choices ? (
              <select
                id={fieldId}
                value={String(value)}
                onChange={(event) => update(keys, event.target.value)}
              >
                {choices.map((choice) => (
                  <option key={choice} value={choice}>
                    {label(choice.replaceAll("-", " "))}
                  </option>
                ))}
              </select>
            ) : longText.has(key) ? (
              <textarea
                id={fieldId}
                rows={key === "description" || key === "intro" ? 6 : 3}
                value={String(value ?? "")}
                onChange={(event) => update(keys, event.target.value)}
              />
            ) : (
              <input
                id={fieldId}
                type={
                  numbers.has(key)
                    ? "number"
                    : dates.has(key)
                      ? "date"
                      : key === "email"
                        ? "email"
                        : "text"
                }
                min={numbers.has(key) ? 0 : undefined}
                step={key === "size" ? "any" : numbers.has(key) ? 1 : undefined}
                value={String(value ?? "")}
                onChange={(event) =>
                  update(
                    keys,
                    numbers.has(key) && event.target.value !== ""
                      ? Number(event.target.value)
                      : event.target.value,
                  )
                }
              />
            )}
            {key === "slug" && (
              <small>
                This sets the public URL. Use lowercase words separated by
                hyphens.
              </small>
            )}
          </label>
        );
      });
  }
  const groups = [
    {
      id: "story",
      name:
        entry.collection === "homepage" ? "Opening story" : "Identity & story",
      description: "The words that introduce this page to the world.",
      keys: [
        "eyebrow",
        "heading",
        "headingAccent",
        "introduction",
        "title",
        "shortTitle",
        "slug",
        "reference",
        "name",
        "legalName",
        "positioning",
        "summary",
        "shortDescription",
        "description",
        "intro",
        "ownedSide",
        "clientSide",
      ],
    },
    {
      id: "details",
      name:
        entry.collection === "company"
          ? "People & connections"
          : "Details & context",
      description:
        "Give visitors the information they need to take the next step.",
      keys: [
        "location",
        "type",
        "status",
        "ownership",
        "price",
        "bedrooms",
        "bathrooms",
        "size",
        "projectType",
        "client",
        "completionDate",
        "listedAt",
        "audience",
        "order",
        "featured",
        "features",
        "services",
        "work",
        "brief",
        "role",
        "outcome",
        "values",
        "capabilities",
        "contact",
        "social",
      ],
    },
    {
      id: "photography",
      name: "Photography",
      description: "Set the scene with a considered selection of images.",
      keys: ["heroImage", "storyImage", "ctaImage", "image", "images"],
    },
    {
      id: "enquiry",
      name: "The next step",
      description: "Make the invitation clear, inviting, and easy to act on.",
      keys: ["ctaHeading", "ctaAccent", "ctaBody", "ctaLabel"],
    },
  ]
    .map((group) => ({
      ...group,
      fields: Object.fromEntries(
        Object.entries(data).filter(([key]) => group.keys.includes(key)),
      ),
    }))
    .filter((group) => Object.keys(group.fields).length);
  const ungrouped = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) =>
        !fieldsToHide.has(key) &&
        !groups.some((group) => group.keys.includes(key)),
    ),
  );
  if (Object.keys(ungrouped).length)
    groups.push({
      id: "other",
      name: "Additional details",
      description: "The finishing touches.",
      keys: Object.keys(ungrouped),
      fields: ungrouped,
    });
  return (
    <>
      <button className="cms-back" onClick={onBack}>
        <Icon name="back" size={16} />
        All{" "}
        {COLLECTIONS.find(
          (c) => c.key === entry.collection,
        )?.label.toLowerCase()}
      </button>
      <Reveal className="cms-editor-heading">
        <div>
          <p className="cms-eyebrow">CONTENT EDITOR / {entry.collection}</p>
          <h1>
            {title(entry) || "New record"}
            <span>.</span>
          </h1>
          <p>Small details. A better impression.</p>
        </div>
        <span
          className={`cms-status ${!dirty && status(entry) === "Published" ? "is-published" : ""}`}
        >
          <span />
          {dirty ? "Unsaved changes" : status(entry)}
        </span>
      </Reveal>
      <div className="cms-editor-savebar">
        <span>
          <Icon name={dirty ? "clock" : "success"} size={18} />
          {entry.revision === 0 && !entry.published
            ? "New record · not saved"
            : dirty
              ? "You have unsaved changes"
              : "All changes saved"}
        </span>
        <div>
          <button
            type="button"
            className="cms-button"
            disabled={pending || remote}
            onClick={() => save("draft")}
          >
            <Icon name="save" size={17} />
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className="cms-button cms-primary"
            disabled={pending || remote}
            onClick={() => save("publish")}
          >
            Publish changes
            <Icon name="external" size={17} />
          </button>
        </div>
      </div>
      {error && (
        <p className="cms-error cms-editor-feedback" role="alert">
          <Icon name="warning" />
          {error}
        </p>
      )}
      {message && (
        <p className="cms-success cms-editor-feedback" role="status">
          <Icon name="success" />
          {message}
        </p>
      )}
      <nav className="cms-editor-section-nav" aria-label="Editor sections">
        {groups.map((group, index) => (
          <a key={group.id} href={`#section-${group.id}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {group.name}
          </a>
        ))}
      </nav>
      <div className="cms-editor-grid">
        <form
          className="cms-editor-form"
          onSubmit={(event) => {
            event.preventDefault();
            save("draft");
          }}
        >
          {groups.map((group, index) => (
            <section
              className="cms-editor-panel"
              key={group.id}
              id={`section-${group.id}`}
            >
              <div className="cms-panel-heading">
                <span className="cms-panel-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{group.name}</h2>
                  <p>{group.description}</p>
                </div>
                <Icon
                  name={
                    group.id === "photography"
                      ? "media"
                      : group.id === "enquiry"
                        ? "next"
                        : entry.collection
                  }
                  size={20}
                />
              </div>
              <fieldset
                disabled={pending || remote}
                className="cms-fields cms-editor-fieldset"
              >
                {renderFields(group.fields)}
              </fieldset>
            </section>
          ))}
          <p className="cms-editor-form-note">
            <Icon name="lock" size={14} />
            Your edits stay private until you publish. Optional fields may be
            left empty.
          </p>
        </form>
        <aside className="cms-publish-panel">
          <div className="cms-preview-heading">
            <span className="cms-overline">DRAFT PREVIEW</span>
            <div className="cms-view-switch">
              <button
                aria-label="Wide preview"
                aria-pressed={preview === "wide"}
                onClick={() => setPreview("wide")}
              >
                <Icon name="rows" size={16} />
              </button>
              <button
                aria-label="Compact preview"
                aria-pressed={preview === "compact"}
                onClick={() => setPreview("compact")}
              >
                <Icon name="homepage" size={16} />
              </button>
            </div>
          </div>
          <div
            className={`cms-preview-card ${preview === "compact" ? "is-compact" : ""}`}
          >
            <div className="cms-preview-chrome">
              <span />
              <span />
              <span />
              <small>{entry.collection}</small>
              <Icon name="lock" size={10} />
            </div>
            {photo(data) ? (
              <Image
                src={photo(data)}
                alt="Selected content photograph"
                width={450}
                height={300}
                unoptimized
              />
            ) : (
              <div className="cms-preview-placeholder">
                <Icon name="media" size={35} />
                <span>Your photograph goes here</span>
              </div>
            )}
            <div className="cms-preview-copy">
              <small>SEKIBAT NIG LIMITED</small>
              <h2>
                {String(
                  data.title || data.heading || data.legalName || "New record",
                )}
                {entry.collection === "homepage" && (
                  <em>{String(data.headingAccent || "")}</em>
                )}
              </h2>
              <p>
                {String(
                  data.shortDescription ||
                    data.summary ||
                    data.introduction ||
                    data.positioning ||
                    "Your story takes shape as you edit. Add your copy and photography to bring it to life.",
                )}
              </p>
              <span className="cms-preview-cta">
                Discover more <Icon name="external" size={12} />
              </span>
            </div>
          </div>
          <p className="cms-preview-note">
            Content preview · the published page uses your website layout.
          </p>
          <div className="cms-publish-details">
            <h3>Ready for the world?</h3>
            <dl>
              <div>
                <dt>Visibility</dt>
                <dd>
                  <span
                    className={
                      entry.published ? "cms-dot-green" : "cms-dot-amber"
                    }
                  />
                  {entry.published ? "Public website" : "Private draft"}
                </dd>
              </div>
              <div>
                <dt>Changes</dt>
                <dd>{dirty ? "Not saved" : status(entry)}</dd>
              </div>
              <div>
                <dt>Collection</dt>
                <dd>{entry.collection}</dd>
              </div>
            </dl>
            <p className="cms-publish-note">
              Save a draft to pick up later. Publish to make your changes
              visible to visitors.
            </p>
            {entry.published && (
              <Link
                href={publicPath(entry)}
                target="_blank"
                rel="noopener noreferrer"
                className="cms-button"
              >
                View published page
                <Icon name="external" size={16} />
              </Link>
            )}
            {entry.published &&
              !["company", "homepage"].includes(entry.collection) && (
                <button
                  className="cms-text-link cms-unpublish"
                  disabled={pending || remote}
                  onClick={() => save("unpublish")}
                >
                  Unpublish this record
                </button>
              )}
          </div>
        </aside>
      </div>
      {picking && (
        <MediaPicker
          media={media}
          current={picking.value}
          onClose={() => setPicking(null)}
          onSelect={(src) => {
            picking.onSelect(src);
            setPicking(null);
          }}
          onUpload={onMedia}
        />
      )}
    </>
  );
}
