import { useId } from "react";
import { useReducer } from "react";

const hideWhenVisibleStyles = (visible) => ({ display: visible ? "none" : undefined });
const showWhenVisibleStyles = (visible) => ({ display: visible ? undefined : "none" });
const contentStyles = { marginBottom: 8 };

export function Togglable({ openButtonLabel = "Open", closeButtonLabel = "Close", children }) {
  const [visible, toggleVisibility] = useReducer((state) => !state, false);

  const contentId = useId();

  return (
    <div>
      <div style={hideWhenVisibleStyles(visible)}>
        <button
          type="button"
          onClick={toggleVisibility}
          aria-expanded="false"
          aria-controls={contentId}
        >
          {openButtonLabel}
        </button>
      </div>
      <div id={contentId} style={showWhenVisibleStyles(visible)}>
        <div style={contentStyles}>{children}</div>
        <button
          type="button"
          onClick={toggleVisibility}
          aria-expanded="true"
          aria-controls={contentId}
        >
          {closeButtonLabel}
        </button>
      </div>
    </div>
  );
}
