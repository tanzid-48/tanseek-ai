export default function AuthButton({
  children,
  loading,
  type = "submit",
  onClick,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-md bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-text font-medium py-2.5 transition-colors"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
