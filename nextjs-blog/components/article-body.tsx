// components/article-body.tsx
// Optional: a post body that follows the site owner's media settings with plain components, no Elements and no CSS framework.
// Use it in place of the `contentHtml` <div> in app/blog/[slug]/page.tsx: `<ArticleBody item={item} assets={assets} />`.
// - Without `renderMarkdown` it draws `contentHtml` and opens the images the owner marked for zoom.
// - With `renderMarkdown` (your Markdown renderer with GFM and CJK-friendly emphasis, for example via remark-gfm and remark-cjk-friendly)
//   it draws `segments` with the components below: you choose how each gallery, player, PDF and file looks.
// For a PDF reader and a player with streaming and captions, see https://kanorio.com/en/developers/guides/images-and-media
import type { ReactNode } from "react";
import type { BlogItem, DeliveryAssetMap } from "@/types/kanorio";
import { ZoomableHtml, ZoomableImage } from "@/components/zoom";

type Segment = NonNullable<BlogItem["segments"]>[number];
type Config<T extends Exclude<Segment["type"], "markdown">> = Extract<Segment, { type: T; config: unknown }>["config"];

const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

function Gallery({ config, assets }: { config: Config<"gallery">; assets: DeliveryAssetMap }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`, gap: 8, margin: "1.5em 0" }}>
      {config.items.map((item) => {
        const asset = item.assetId ? assets[item.assetId] : undefined;
        const size = { width: asset?.width ?? undefined, height: asset?.height ?? undefined };
        return config.lightbox ? (
          <ZoomableImage key={item.src} src={item.src} alt={item.alt} {...size} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.src} src={item.src} alt={item.alt} {...size} loading="lazy" style={{ width: "100%", height: "auto" }} />
        );
      })}
    </div>
  );
}

function Embed({ config, assets }: { config: Config<"embed">; assets: DeliveryAssetMap }) {
  if (config.embedType === "video") {
    const asset = config.assetId ? assets[config.assetId] : undefined;
    return (
      <video
        controls
        preload="metadata"
        src={config.url}
        poster={asset?.poster ?? undefined}
        crossOrigin={asset?.captions?.length ? "anonymous" : undefined}
        style={{ width: "100%", height: "auto" }}
      >
        {asset?.captions?.map((track) => <track key={track.url} kind="captions" src={track.url} srcLang={track.locale} label={track.locale} />)}
      </video>
    );
  }
  if (config.embedUrl && config.embedType !== "generic") {
    return (
      <iframe
        src={config.embedUrl}
        title={config.embedType}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16 / 9", border: 0 }}
      />
    );
  }
  return <a href={config.url}>{config.url}</a>;
}

function Pdf({ config }: { config: Config<"pdf"> }) {
  const label = config.title || "PDF";
  return (
    <p>
      {/* `downloadUrl` is null when the owner does not allow visitors to download */}
      {config.downloadUrl ? (
        <a href={config.downloadUrl} download>
          {label}
        </a>
      ) : (
        label
      )}
      {config.pageCount ? ` (${config.pageCount} pages)` : null}
    </p>
  );
}

function FileLink({ config }: { config: Config<"file"> }) {
  const href = config.downloadUrl ?? config.url;
  const size = config.size ? ` (${formatSize(config.size)})` : "";
  return <p>{href ? <a href={href} download>{config.name}</a> : config.name}{size}</p>;
}

function Block({ segment, assets, renderMarkdown }: { segment: Segment; assets: DeliveryAssetMap; renderMarkdown: (markdown: string) => ReactNode }) {
  switch (segment.type) {
    case "markdown":
      return <>{renderMarkdown(segment.value)}</>;
    case "gallery":
      return <Gallery config={segment.config} assets={assets} />;
    case "embed":
      return <Embed config={segment.config} assets={assets} />;
    case "audio":
      return (
        <figure style={{ margin: "1.5em 0" }}>
          <audio controls src={segment.config.src} style={{ width: "100%" }} />
          {segment.config.title && <figcaption>{segment.config.title}</figcaption>}
        </figure>
      );
    case "pdf":
      return <Pdf config={segment.config} />;
    case "file":
      return <FileLink config={segment.config} />;
    case "cta":
      return (
        <aside>
          {renderMarkdown(segment.config.content)}
          {segment.config.href && segment.config.buttonText && <a href={segment.config.href}>{segment.config.buttonText}</a>}
        </aside>
      );
    case "faq":
      return (
        <section>
          {segment.config.title && <h2>{segment.config.title}</h2>}
          {segment.config.items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              {renderMarkdown(item.answer)}
            </details>
          ))}
        </section>
      );
    case "toggle":
      return (
        <details>
          <summary>{segment.config.title}</summary>
          {renderMarkdown(segment.config.content)}
        </details>
      );
    case "callout":
      return (
        <aside data-tone={segment.config.tone}>
          {segment.config.title && <strong>{segment.config.title}</strong>}
          {renderMarkdown(segment.config.content)}
        </aside>
      );
  }
}

export function ArticleBody({
  item,
  assets,
  renderMarkdown,
}: {
  item: BlogItem;
  assets: DeliveryAssetMap;
  renderMarkdown?: (markdown: string) => ReactNode;
}) {
  if (renderMarkdown && item.segments) {
    return (
      <div>
        {item.segments.map((segment, index) => (
          <Block key={index} segment={segment} assets={assets} renderMarkdown={renderMarkdown} />
        ))}
      </div>
    );
  }
  return item.contentHtml ? <ZoomableHtml html={item.contentHtml} /> : null;
}
