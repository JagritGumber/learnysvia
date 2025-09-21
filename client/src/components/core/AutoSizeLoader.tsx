import clsx from "clsx";

export const AutoSizeLoader = (props: React.ComponentProps<"div">) => {
  return (
    <div
      {...props}
      className={clsx(
        "min-h-full bg-base-100 flex items-center justify-center",
        props.className
      )}
    >
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-base-content/70">Loading catalog...</p>
      </div>
    </div>
  );
};
