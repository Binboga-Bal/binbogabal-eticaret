import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function PasswordChangedTemplate({ name, content, appUrl }: Props) {
  const lines = content.body.split("\n").filter(Boolean);
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Shield */}
          <path d="M40 10 L62 20 L62 40 Q62 60 40 70 Q18 60 18 40 L18 20 Z" />
          {/* Checkmark */}
          <polyline points="28,40 37,50 54,30" strokeWidth="3" />
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
    </EmailLayout>
  );
}
