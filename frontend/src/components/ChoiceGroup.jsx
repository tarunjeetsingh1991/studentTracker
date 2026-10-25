import React from "react";
export default function ChoiceGroup({
  title,
  subtitle,
  options,
  value,
  onChange,
  multiple = false,
}) {
  return (
    <section className="panel p-4 mb-3">
      <h2 className="h5 fw-bold mb-1">{title}</h2>
      <p className="text-muted small mb-3">{subtitle}</p>
      <div className="d-flex flex-wrap gap-2">
        {options.map(([key, label]) => {
          const selected = multiple ? value.includes(key) : value === key;
          return (
            <label
              className={"choice " + (selected ? "selected" : "")}
              key={key}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={title}
                checked={selected}
                onChange={() =>
                  onChange(
                    multiple
                      ? selected
                        ? value.filter((x) => x !== key)
                        : [...value, key]
                      : key,
                  )
                }
              />
              {label}
            </label>
          );
        })}
      </div>
    </section>
  );
}
