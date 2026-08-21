import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
  Section,
  Img,
  Tailwind,
  Button,
} from "@react-email/components";

interface AdminNewSignupEmailProps {
  fullName: string;
  email: string;
  signupDate: string;
}

export const AdminNewSignupEmail = ({
  fullName,
  email,
  signupDate,
}: AdminNewSignupEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>👋 New signup — {fullName || email}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            <Tailwind>
              <Img
                alt="zeek logo"
                width={150}
                height={100}
                src="https://swjqqxhvicbxqcembkml.supabase.co/storage/v1/object/public/email%20assets/zeek2.svg"
              />
            </Tailwind>
            <Text> New Signup 👋 </Text>
          </Heading>

          <Section style={metaSection}>
            <Text style={metaText}><strong>Name:</strong> {fullName || "—"}</Text>
            <Text style={metaText}><strong>Email:</strong> {email}</Text>
            <Text style={metaText}><strong>Signed up:</strong> {signupDate}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
            <Button
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/admin`}
              style={button}
            >
              VIEW IN ADMIN PANEL
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: "#f4f4f5", fontFamily: "sans-serif" };
const container = { backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "600px", border: "1px solid #e4e4e7" };
const heading = { color: "#18181b", fontSize: "24px", margin: "0 0 20px 0" };
const metaSection = { backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "6px", marginBottom: "20px" };
const metaText = { margin: "4px 0", fontSize: "14px", color: "#334155" };
const hr = { borderColor: "#e4e4e7", margin: "20px 0" };
const button = {
  backgroundColor: "#FF5A00",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block" as const,
  width: "100%",
  padding: "14px 0",
};