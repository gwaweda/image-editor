type Props = {
  percent: number;
  label: string;
};

export default function ProgressBar({ percent, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-12 shadow-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="font-medium text-gray-700">{label}</p>
      <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">{percent}%</p>
    </div>
  );
}