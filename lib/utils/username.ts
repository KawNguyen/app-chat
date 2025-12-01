import prisma from "../prisma";

/**
 * Automatically generate unique username from email or name
 */
export async function generateUniqueUsername(
  email: string,
  name?: string
): Promise<string> {
  // Get part before @ of email or use name
  let baseUsername = name
    ? name.toLowerCase().replace(/\s+/g, "")
    : email.split("@")[0];

  // Remove special characters, keep only letters and numbers
  baseUsername = baseUsername.replace(/[^a-z0-9]/g, "");

  // Ensure username has at least 3 characters
  if (baseUsername.length < 3) {
    baseUsername = `user${baseUsername}`;
  }

  // Check if username already exists
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (!existingUser) {
      return username;
    }

    // If exists, add number to the end
    username = `${baseUsername}${counter}`;
    counter++;

    // Avoid infinite loop
    if (counter > 10000) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }

  return username;
}

/**
 * Update username for user if they don't have one
 */
export async function ensureUserHasUsername(
  userId: string,
  email: string,
  name?: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  // If username exists, return it
  if (user?.username) {
    return user.username;
  }

  // Generate new username
  const newUsername = await generateUniqueUsername(email, name);

  // Update database
  await prisma.user.update({
    where: { id: userId },
    data: { username: newUsername },
  });

  return newUsername;
}
