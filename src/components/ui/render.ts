import * as React from "react";

export function renderProp(asChild: boolean | undefined, children: React.ReactNode) {
  return asChild && React.isValidElement(children) ? (children as React.ReactElement) : undefined;
}

export function rendersNativeButton(asChild: boolean | undefined, children: React.ReactNode) {
  if (!asChild || !React.isValidElement(children)) {
    return true;
  }

  return typeof children.type !== "string" || children.type === "button";
}
