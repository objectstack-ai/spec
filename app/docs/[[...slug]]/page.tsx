import { source } from '@/app/source';
import type { Metadata } from 'next';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = await source.getPage(params.slug ?? []);
  if (!page) notFound();

  const Content = (page.data as any).body;

  return (
    <DocsPage>
      <DocsBody>
        <h1>{page.data.title}</h1>
        {page.data.description && <p>{page.data.description}</p>}
        <Content />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await source.getPage(params.slug ?? []);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
