import { notFound } from 'next/navigation';
import { blog } from '@/app/source';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { slug } = await params;
  
  // If no slug, show blog index
  if (!slug || slug.length === 0) {
    const posts = blog.getPages();

    return (
      <HomeLayout {...baseOptions}>
        <main className="container max-w-5xl mx-auto px-4 py-16">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-lg text-fd-foreground/80">
              Insights, updates, and best practices from the ObjectStack team.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.url}
                href={post.url}
                className="group block rounded-lg border border-fd-border bg-fd-card p-6 transition-all hover:border-fd-primary/30 hover:shadow-md"
              >
                <div className="mb-3">
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-fd-primary transition-colors">
                    {post.data.title}
                  </h2>
                  {post.data.description && (
                    <p className="text-fd-foreground/70">
                      {post.data.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-fd-foreground/70">
                  {post.data.date && (
                    <time dateTime={post.data.date}>
                      {new Date(post.data.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {post.data.author && (
                    <span>By {post.data.author}</span>
                  )}
                </div>

                {post.data.tags && post.data.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.data.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-fd-primary/10 px-2.5 py-0.5 text-xs font-medium text-fd-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-fd-foreground/70">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </main>
      </HomeLayout>
    );
  }

  // Show individual blog post
  const page = blog.getPage(slug);
  
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  return (
    <HomeLayout {...baseOptions}>
      <main className="container max-w-4xl mx-auto px-4 py-16">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-fd-foreground/70 hover:text-fd-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <header className="mb-8 pb-8 border-b border-fd-border">
            <h1 className="text-4xl font-bold mb-4">{page.data.title}</h1>
            
            {page.data.description && (
              <p className="text-xl text-fd-foreground/80 mb-6">
                {page.data.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-fd-foreground/70">
              {page.data.date && (
                <time dateTime={page.data.date}>
                  {new Date(page.data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
              {page.data.author && (
                <span>By {page.data.author}</span>
              )}
            </div>

            {page.data.tags && page.data.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {page.data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-fd-primary/10 px-3 py-1 text-sm font-medium text-fd-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <MDX components={defaultMdxComponents} />
        </article>
      </main>
    </HomeLayout>
  );
}

export async function generateStaticParams() {
  return blog.getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  
  // If no slug, return default metadata for blog index
  if (!slug || slug.length === 0) {
    return {
      title: 'Blog',
      description: 'Insights, updates, and best practices from the ObjectStack team.',
    };
  }
  
  const page = blog.getPage(slug);

  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
