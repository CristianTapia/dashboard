type ConfirmAlertProps = {
  message: string;
};

export default function ConfirmAlert({ message }: ConfirmAlertProps) {
  return <div className="text-center text-gray-800 text-base">{message}</div>;
}
