"use client";
import Image from "next/image";
import { COLLECTIONS, type Collection, type Entry } from "@/lib/cms/schema";
import { Icon, Reveal } from "./StudioUI";
import { photo, status, title } from "./content-utils";

export function StudioOverview({
  entries,
  mediaCount,
  onEdit,
  onCollection,
  onDrafts,
}: {
  entries: Entry[];
  mediaCount: number;
  onEdit: (entry: Entry) => void;
  onCollection: (collection: Collection | "media") => void;
  onDrafts: () => void;
}) {
  const home = entries.find((entry) => entry.collection === "homepage");
  const live = entries.filter((entry) => entry.published).length;
  const pending = entries.filter((entry) => status(entry) !== "Published");
  const recent = [...entries]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 3);
  return (
    <>
      <Reveal className="cms-overview-grid">
        <section className="cms-showcase">
          <div className="cms-showcase-copy">
            <span className="cms-overline">
              <span /> THE FIRST IMPRESSION
            </span>
            <h2>
              A great website
              <br />
              starts <em>here.</em>
            </h2>
            <p>
              Shape the story. Set the scene.
              <br />
              Give your next visitor something to remember.
            </p>
            {home && (
              <button
                className="cms-button cms-primary"
                onClick={() => onEdit(home)}
              >
                Edit homepage <Icon name="next" size={18} />
              </button>
            )}
            <span className="cms-showcase-caption">
              YOUR VISION, BEAUTIFULLY PRESENTED.
            </span>
          </div>
          {home && (
            <div className="cms-showcase-image">
              <Image
                src={photo(home.draft)}
                alt="Current homepage photograph"
                fill
                sizes="(max-width: 760px) 100vw, 40vw"
                priority
                unoptimized
              />
              <div className="cms-showcase-image-top">
                <span>
                  <Icon name="globe" size={13} /> sekibat website
                </span>
              </div>
              <span className="cms-showcase-image-bottom">
                <span>HOMEPAGE / DRAFT IMAGE</span>
                <Icon name="properties" size={22} />
              </span>
            </div>
          )}
        </section>
        <section className="cms-publishing">
          <div className="cms-section-heading">
            <h2>Publishing desk</h2>
            <Icon name="more" />
          </div>
          <div className="cms-live-count">
            <span className="cms-live-icon">
              <Icon name="globe" size={27} />
            </span>
            <div>
              <strong>
                {String(live).padStart(2, "0")}
                <span> / {entries.length}</span>
              </strong>
              <p>records on the public website</p>
            </div>
          </div>
          <div
            className="cms-publishing-track"
            aria-label={`${live} of ${entries.length} records published`}
          >
            {entries.map((entry) => (
              <span
                key={`${entry.collection}/${entry.id}`}
                className={entry.published ? "published" : ""}
              />
            ))}
          </div>
          <button className="cms-pending-link" onClick={onDrafts}>
            <span
              className={
                pending.length ? "cms-pending-icon" : "cms-pending-icon clear"
              }
            >
              <Icon name={pending.length ? "clock" : "check"} size={19} />
            </span>
            <span>
              <strong>
                {pending.length
                  ? `${pending.length} update${pending.length === 1 ? "" : "s"} waiting`
                  : "Everything is up to date"}
              </strong>
              <small>
                {pending.length
                  ? "Review drafts & unpublished changes"
                  : "Your content is ready for visitors"}
              </small>
            </span>
            <Icon name="next" size={17} />
          </button>
          <div className="cms-publishing-bottom">
            <span>Media, ready to go</span>
            <button onClick={() => onCollection("media")}>
              {mediaCount} images <Icon name="external" size={14} />
            </button>
          </div>
        </section>
      </Reveal>
      <Reveal className="cms-shortcuts" delay={0.07}>
        {COLLECTIONS.filter((c) =>
          ["properties", "projects", "services"].includes(c.key),
        ).map((c) => {
          const records = entries.filter((e) => e.collection === c.key);
          const image = records.find((e) => photo(e.draft));
          return (
            <button
              className="cms-shortcut"
              key={c.key}
              onClick={() => onCollection(c.key)}
            >
              <span className="cms-shortcut-image">
                {image ? (
                  <Image
                    src={photo(image.draft)}
                    alt=""
                    fill
                    sizes="70px"
                    unoptimized
                  />
                ) : (
                  <Icon name={c.key} />
                )}
              </span>
              <span>
                <small>
                  YOUR{" "}
                  {c.key === "services"
                    ? "EXPERTISE"
                    : c.key === "projects"
                      ? "PORTFOLIO"
                      : "SPACES"}
                </small>
                <strong>
                  {c.label}
                  <span>{records.length}</span>
                </strong>
              </span>
              <Icon name="external" size={21} />
            </button>
          );
        })}
      </Reveal>
      <Reveal className="cms-recent" delay={0.1}>
        <div>
          <Icon name="clock" size={16} />
          <span>RECENTLY UPDATED</span>
        </div>
        {recent.map((entry) => (
          <button
            key={`${entry.collection}/${entry.id}`}
            onClick={() => onEdit(entry)}
          >
            {title(entry)}
            <span>
              {entry.updatedAt
                ? new Date(entry.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    timeZone: "Africa/Lagos",
                  })
                : "Original"}
            </span>
            <Icon name="next" size={13} />
          </button>
        ))}
      </Reveal>
    </>
  );
}
