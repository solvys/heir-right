import type { ComponentType } from "react";

type ReactModule = typeof import("react");
type ReactDomServerModule = typeof import("react-dom/server");
type StreamdownComponent = ComponentType<{
  children?: string;
  mode?: "static" | "streaming";
  skipHtml?: boolean;
}>;

async function importModule<T>(specifier: string): Promise<T> {
  return import(specifier) as Promise<T>;
}

let rendererModules:
  | Promise<{
      React: ReactModule;
      renderToStaticMarkup: ReactDomServerModule["renderToStaticMarkup"];
      Streamdown: StreamdownComponent;
    }>
  | undefined;

async function loadRendererModules(): NonNullable<typeof rendererModules> {
  rendererModules ??= Promise.all([
    importModule<ReactModule>("react"),
    importModule<ReactDomServerModule>("react-dom/server"),
    importModule<{ Streamdown: StreamdownComponent }>("streamdown"),
  ]).then(([react, reactDomServer, streamdown]) => ({
    React: react,
    renderToStaticMarkup: reactDomServer.renderToStaticMarkup,
    Streamdown: streamdown.Streamdown,
  }));
  return rendererModules;
}

export async function renderMarkdownWithStreamdown(markdown: string): Promise<string> {
  const { React, renderToStaticMarkup, Streamdown } = await loadRendererModules();

  return renderToStaticMarkup(
    React.createElement(
      "div",
      { className: "streamdown-doc", "data-markdown-renderer": "streamdown" },
      React.createElement(Streamdown, { mode: "static", skipHtml: true }, markdown),
    ),
  );
}
