import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/types";
import { useState } from "react";

type FieldConfig = {
  key: string;
  label: string;
  value: string;
  canReveal?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
};

export function AccountInfoCard({ user }: { user: User }) {
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const fields: FieldConfig[] = [
    {
      key: "displayName",
      label: "Display Name",
      value: user?.displayName || user?.userName || "",
    },
    {
      key: "username",
      label: "Username",
      value: user?.userName || "",
    },
    {
      key: "email",
      label: "Email",
      value: showEmail ? user?.email || "" : "****************@gmail.com",
      canReveal: true,
    },
    {
      key: "phone",
      label: "Phone Number",
      value: showPhone ? "+1234567890" : "**********1234",
      canReveal: true,
    },
  ];

  return (
    <Card className="w-2xl bg-[#0a0a0a] border-zinc-800 overflow-hidden p-0 relative">
      <div className="w-full h-24 absolute top-0 left-0 bg-green-300" />

      <CardHeader className="z-10 mt-18 items-center">
        <div className="h-full flex justify-between items-center">
          <div className="h-full flex justify-center items-center gap-2">
            <UserAvatar
              user={user}
              size="3xl"
              className="border-4 rounded-full border-black"
            />
            <h1 className="text-white text-xl font-semibold">
              {user?.displayName || "User Name"}
            </h1>
          </div>

          <div className="h-full flex items-end-safe pb-4">
            <Button
              variant="outline"
              type="button"
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Edit User Profile
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 relative">
        <div className="space-y-0 bg-zinc-900/50 rounded-lg p-4">
          {fields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-zinc-400 text-sm font-medium">
                    {field.label}
                  </Label>

                  <div className="flex items-center gap-2">
                    <p className="text-white">{field.value}</p>

                    {field.key === "email" && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowEmail((v) => !v)}
                        className="text-indigo-400 hover:text-indigo-300 h-auto p-0"
                      >
                        Reveal
                      </Button>
                    )}

                    {field.key === "phone" && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowPhone((v) => !v)}
                        className="text-indigo-400 hover:text-indigo-300 h-auto p-0"
                      >
                        Reveal
                      </Button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {field.key === "phone" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      Remove
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
