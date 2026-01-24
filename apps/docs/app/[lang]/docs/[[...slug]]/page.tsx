import { source } from '@/app/source';
import type { Metadata } from 'next';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Folder, Files } from 'fumadocs-ui/components/files';
import { CopyPageMarkdown } from '@/components/copy-page-markdown';
import fs from 'fs';
import path from 'path';

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
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug ?? [], params.lang);
  if (!page) notFound();

  const data = page.data as any;
  const Content = data.body;

  // Read the raw MDX content
  let rawMarkdown = '';
  try {
    const slugPath = params.slug?.join('/') || 'index';
    const possiblePaths = [
      path.join(process.cwd(), '../../content/docs', `${slugPath}.mdx`),
      path.join(process.cwd(), '../../content/docs', `${slugPath}.${params.lang}.mdx`),
      path.join(process.cwd(), '../../content/docs', slugPath, 'index.mdx'),
      path.join(process.cwd(), '../../content/docs', slugPath, `index.${params.lang}.mdx`),
    ];
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        rawMarkdown = fs.readFileSync(filePath, 'utf-8');
        break;
      }
    }
  } catch (error) {
    console.error('Failed to read raw markdown:', error);
  }

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <DocsBody>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-foreground">{page.data.title}</h1>
            {page.data.description && (
              <p className="mb-8 text-lg text-muted-foreground">
                {page.data.description}
              </p>
            )}
          </div>
          {rawMarkdown && (
            <div className="flex-shrink-0">
              <CopyPageMarkdown content={rawMarkdown} />
            </div>
          )}
        </div>
        <Content components={components} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug ?? [], params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
