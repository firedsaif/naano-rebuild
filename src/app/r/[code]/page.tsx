export default async function TrackingRedirect({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  return <p className="p-8">Tracking link {code}</p>;
}
