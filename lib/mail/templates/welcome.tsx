import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  shopUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function WelcomeTemplate({ name, shopUrl, content, appUrl }: Props) {
  const lines = content.body.split("\n").filter(Boolean);
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Honeycomb cells */}
          <polygon points="40,14 48,18 48,28 40,32 32,28 32,18" />
          <polygon points="22,26 30,30 30,40 22,44 14,40 14,30" />
          <polygon points="58,26 66,30 66,40 58,44 50,40 50,30" />
          <polygon points="40,38 48,42 48,52 40,56 32,52 32,42" />
          {/* Bee */}
          <ellipse cx="40" cy="69" rx="6" ry="4" />
          <line x1="36" y1="67" x2="34" y2="63" />
          <line x1="44" y1="67" x2="46" y2="63" />
          <line x1="40" y1="65" x2="40" y2="60" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title.replace("{name}", name)}</EmailTitle>
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
      <EmailButton href={shopUrl}>{content.buttonText ?? "Ürünleri Keşfet"}</EmailButton>
    </EmailLayout>
  );
}
