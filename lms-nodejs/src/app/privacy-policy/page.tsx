import React from 'react'
import { Metadata } from 'next'
import InnerHero from '@/components/common/InnerHero'
import legalPages from '@/lib/data/legal-pages.json'

const pageData = legalPages['privacy-policy']

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.meta_description,
  openGraph: {
    title: `${pageData.title} | Mentor Learning Management System`,
    description: pageData.meta_description,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <InnerHero title={pageData.name} slug={pageData.slug} />

      <div className="container mx-auto max-w-[1280px] px-4">
        <div className="mx-auto my-20 max-w-3xl rounded-2xl bg-muted px-6 py-10 md:px-20 prose dark:prose-invert">
          <div
            className="space-y-6 text-foreground leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:text-sm [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:text-muted-foreground [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: pageData.description }}
          />
        </div>
      </div>
    </>
  )
}
