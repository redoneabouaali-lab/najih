import { db, type ProfileRow } from "./db";

export type Profile = {
  branchSlug: string;
  studyLang: "ar" | "fr";
};

export async function getProfile(): Promise<Profile | null> {
  const p: ProfileRow | undefined = await db.profile.get("self");
  if (!p) return null;
  return { branchSlug: p.branchSlug, studyLang: p.studyLang };
}

export async function saveProfile(
  branchSlug: string,
  studyLang: "ar" | "fr",
) {
  await db.profile.put({
    key: "self",
    branchSlug,
    studyLang,
    updatedAt: Date.now(),
  });
}

export async function clearProfile() {
  await db.profile.delete("self");
}