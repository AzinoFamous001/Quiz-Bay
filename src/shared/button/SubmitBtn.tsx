import AnimateSpin from "../spinner/AnimateSpin";

interface SubmitBtnProps {
  label: string;
  isDisabled?: boolean;
  isLoading?: boolean;
}

function SubmitBtn({
  label,
  isDisabled = true,
  isLoading = false,
}: SubmitBtnProps) {
  return (
    <button
      className={`py-4 p-44 rounded-lg font-bold  ${
        isDisabled
          ? "bg-transparent text-black cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
      }`}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 justify-center text-white">
          <AnimateSpin />
          <span>{label}</span>
        </div>
      ) : (
        label
      )}
    </button>
  );
}

export default SubmitBtn;