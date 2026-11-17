import type { ReactNode } from "react";
import { PageShell } from "./PageShell.tsx";
import { PrimaryButton } from "./PrimaryButton.tsx";
import { findCandidate } from "../domain/people.ts";
import { isMutual, useApplications, useSavedProfile } from "../domain/storage.ts";

export function MutualGate({
  personId,
  title,
  children,
}: {
  personId: string;
  title: string;
  children: ReactNode;
}) {
  const person = findCandidate(personId);
  const profile = useSavedProfile();
  const applications = useApplications();
  if (!person) {
    return (
      <PageShell title={title}>
        <h1 className="text-2xl font-semibold">没有这个人</h1>
        <div className="mt-6">
          <PrimaryButton to="/roommates">返回建议</PrimaryButton>
        </div>
      </PageShell>
    );
  }
  if (!profile || !isMutual(applications[person.id])) {
    return (
      <PageShell title={title}>
        <h1 className="text-2xl font-semibold">还没到这一步</h1>
        <p className="mt-2 text-sm leading-6">双方都同意之后，才能一起看房、分租金、把规矩说好。一个人不能替对方点头。</p>
        <div className="mt-6">
          <PrimaryButton to={`/roommates/${person.id}`}>返回对方资料</PrimaryButton>
        </div>
      </PageShell>
    );
  }
  return children;
}
