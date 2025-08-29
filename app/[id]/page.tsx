import { recordClickAndRedirect } from '@/lib/actions/shortener';

export default async function ShortCatchAll({ params }: { params: { id: string } }) {
  const { id } = await params;
  await recordClickAndRedirect(id);
  return null;
}
