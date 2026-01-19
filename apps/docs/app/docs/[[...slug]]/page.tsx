import { source } from '@/app/source';
import type { Metadata } from 'next';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Folder, Files } from 'fumadocs-ui/components/files';

const components = {
  ...defaultMdxComponents,
  Step,
  Steps,
  File,
  Folder,
  Files,
  FileTree: Files,
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = await source.getPage(params.slug ?? []);
  if (!page) notFound();

  const data = page.data as any;
  const Content = data.body;

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <DocsBody>
        <h1 className="mb-2 text-3xl font-bold text-foreground">{page.data.title}</h1>
        {page.data.description && (
          <p className="mb-8 text-lg text-muted-foreground">
            {page.data.description}
          </p>
        )}
        <Content components={components} />
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
