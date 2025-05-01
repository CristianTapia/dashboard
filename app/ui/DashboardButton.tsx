import Link from "next/link";

type DashboardButtonProps = {
  href: string;
  name: string;
};

export default function DashboardButton({ href, name }: DashboardButtonProps) {
  return (
    <li>
      <Link href={href} className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
        {name}
      </Link>
    </li>
  );
}
