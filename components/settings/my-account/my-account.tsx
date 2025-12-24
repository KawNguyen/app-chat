"use client";

import { User } from "@/types";
import {
  AccountInfoCard,
  SetPasswordDialog,
  TwoFactorDialog,
} from "./components";
import { trpc } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MyAccountProps {
  user: User;
  hasPassword?: boolean;
}

export function MyAccount({ user, hasPassword }: MyAccountProps) {
  const utils = trpc.useUtils();

  return (
    <div className="w-2xl flex items-start flex-col gap-6 pb-10">
      <AccountInfoCard user={user} />

      <div className="space-y-2">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Password and Authentication
        </h4>
        <SetPasswordDialog
          hasPassword={hasPassword}
          onSuccess={async () => {
            await utils.user.me.invalidate();
          }}
        />
      </div>
      <div className="space-y-2">
        <div>
          <h4 className="scroll-m-20 text-md font-semibold tracking-tight">
            Authentication App
          </h4>
          <p className="leading-5 text-sm text-muted-foreground">
            Protect your ConTalk account with an extra layer of sercurity. Once
            configured, you&apos;ll be required to enter a code from your
            authentication app each time you log in.
          </p>
        </div>

        <TwoFactorDialog
          isEnabled={user?.twoFactorEnabled}
          hasPassword={hasPassword}
          onStatusChange={async () => {
            await utils.user.me.invalidate();
          }}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <div>
          <h4 className="scroll-m-20 text-md font-semibold tracking-tight">
            Account Removal
          </h4>
          <p className="leading-5 text-sm text-muted-foreground">
            Disabling your account means you can recover it at any time after
            taking this action.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            type="button"
            size={"sm"}
            className="bg-red-500 hover:bg-red-600"
          >
            Disable Account
          </Button>
          <Button
            variant="outline"
            type="button"
            size={"sm"}
            className="bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-400"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
