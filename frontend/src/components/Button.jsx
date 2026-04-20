function Button({
  children,
  variant = "primary",
  size,
  type = "button",
  className = "",
  disabled,
  ...rest
}) {
  const classes = ["btn", `btn--${variant}`, size === "sm" ? "btn--sm" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={`${classes} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
