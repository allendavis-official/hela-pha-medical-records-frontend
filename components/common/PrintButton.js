import { FaPrint } from "react-icons/fa";

export default function PrintButton({
  onClick,
  buttonText = "Print",
  buttonClass = "btn btn-secondary",
  disabled = false,
}) {
  return (
    <button onClick={onClick} disabled={disabled} className={buttonClass}>
      <FaPrint className="inline mr-2" />
      {buttonText}
    </button>
  );
}
