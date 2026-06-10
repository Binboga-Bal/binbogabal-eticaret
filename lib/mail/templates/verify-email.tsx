import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, EmailNote } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  verifyUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function VerifyEmailTemplate({ name, verifyUrl, content, appUrl }: Props) {
  const lines = content.body.split("\n").filter(Boolean);
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Beekeeper body */}
          <circle cx="40" cy="22" r="10" />
          {/* Hat + veil */}
          <path d="M28 22 Q28 10 40 10 Q52 10 52 22" />
          <line x1="28" y1="22" x2="52" y2="22" />
          <path d="M30 22 Q26 28 26 36" />
          <path d="M50 22 Q54 28 54 36" />
          <path d="M26 36 L54 36" />
          {/* Body */}
          <path d="M33 36 L30 58 L50 58 L47 36" />
          {/* Envelope */}
          <rect x="26" y="46" width="28" height="20" rx="3" />
          <path d="M26 46 L40 57 L54 46" />
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
      <EmailButton href={verifyUrl}>{content.buttonText ?? "E-Postamı Doğrula"}</EmailButton>
      {content.note && <EmailNote>{content.note}</EmailNote>}
    </EmailLayout>
  );
}
