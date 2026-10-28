-- Session revocation: bumped on logout; JWTs carry the version they were issued with.
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
