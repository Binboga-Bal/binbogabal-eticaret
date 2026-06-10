import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, EmailNote } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  resetUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function PasswordResetTemplate({ name, resetUrl, content, appUrl }: Props) {
  const lines = content.body.split("\n").filter(Boolean);
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Padlock body */}
          <rect x="20" y="38" width="40" height="30" rx="6" />
          {/* Shackle */}
          <path d="M28 38 L28 28 Q28 16 40 16 Q52 16 52 28 L52 38" />
          {/* Keyhole */}
          <circle cx="40" cy="52" r="5" />
          <line x1="40" y1="57" x2="40" y2="62" />
          {/* Honey drop */}
          <path d="M56 10 Q58 6 60 8 Q63 12 60 16 Q57 19 54 16 Q51 12 56 10 Z" fill="#F9B10B" stroke="#F9B10B" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </EmailBody>
      <EmailButton href={resetUrl}>{content.buttonText ?? "Şifremi Sıfırla"}</EmailButton>
      {content.note && <EmailNote>{content.note}</EmailNote>}
    </EmailLayout>
  );
}
