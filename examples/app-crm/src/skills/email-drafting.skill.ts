// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { defineSkill } from '@objectstack/spec';

export const EmailDraftingSkill = defineSkill({
  name: 'email_drafting',
  label: 'Email Drafting',
  description: 'Drafts personalised outbound emails and optimises subject lines for open rate.',

  instructions: `When the user asks to draft, write, or optimise an email:
1. Use generate_email_copy with the recipient and a brief intent.
2. Always run optimize_subject_line on the proposed subject before
   returning the draft.
3. Personalise the body using personalize_content when the recipient
   has known firmographics or recent activity.
4. Return the draft as { subject, body, alternatives } so the UI can
   present A/B variants.`,

  tools: ['generate_email_copy', 'optimize_subject_line', 'personalize_content', 'generate_email'],

  triggerPhrases: [
    'draft an email',
    'write a follow-up',
    'compose email',
    'optimise subject line',
    'email template',
  ],

  permissions: ['crm:email:write'],
});
